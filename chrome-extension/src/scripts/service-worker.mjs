/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/


import { db } from "../db";
import { 
    appParams, 
    messageMeta,
    getTodayReminders,
    testTabBaseUrl,
    getProfileDataFrom,
    getNewProfileData,
    categoryVerbMap,
    isLinkedinFeed,
    isLinkedinProfilePage,
} from "../popup/Local_library";
import { v4 as uuidv4 } from 'uuid';
import Dexie from 'dexie';

/** The following code is executed on installation
 * and check if the required database already exists.
 * If it does exist, everything runs smoothly from then on  
 * If it doesn't, this code redirects to the installation page
 * and it finally sets the uninstallation process with the deletion
 * of the database
 */

chrome.runtime.onInstalled.addListener(details => {

    switch(details.reason){

        case chrome.runtime.OnInstalledReason.INSTALL: {

            // checking if a previous instance already exists before showing the setup page
            Dexie.exists(appParams.appDbName).then(function (exists) {
                if (!exists) {
                    // on install, open a web page for information
                    chrome.tabs.create({ url: "install.html" });
                }
            });

            // Setting the process when uninstalling the extension
            chrome.runtime.setUninstallURL("", () => {

                // deleting the whole database
                db.delete().then(() => {
                    console.log("Database successfully deleted");
                }).catch((err) => {
                    console.error("Could not delete database");
                }).finally(() => {
                    // Do what should be done next...
                });
                
            });

            break;
        }

        case chrome.runtime.OnInstalledReason.UPDATE: {
            break;
        }

    }

});

function isUrlOfInterest(url){
    return isLinkedinFeed(url) || isLinkedinProfilePage(url);
}


/** this function listens to any tabs change
 * to check if the change is related to linkedin
 * and then injects the appropriate script into the concerned tab
 */

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    if (changeInfo.url && changeInfo.status == "loading"){
        
        var url = changeInfo.url;
        if (testTabBaseUrl(url) && isUrlOfInterest(url)){

            url = url.split("?")[0];
            try{

                Dexie.exists(appParams.appDbName).then(async function (exists) {
                    if (exists) {

                        chrome.tabs.query({active: true, currentWindow: true}, async function(tabs){

                            handleNewInterestingTab(tabId, url, tabs[0].id == tabId);

                        });
                        
                    }
                });

            }
            catch(error){
                console.error("Error : ", error);
            }

        }
        else{

            chrome.tabs.query({active: true, currentWindow: true}, async function(tabs){
                if (tabs[0].id == tabId){
                    resetTabTimer();
                }
            });
            chrome.action.setBadgeText({text: null});
        }

    }

  }
);

/** this function counts the time spent on a tab
 * before switching to another one 
 * It only does so when a linkedin page is open on that tab
 */

async function runTabTimer(tabId, url){

    await resetTabTimer();

    url = isLinkedinProfilePage(url) ? url.slice(url.indexOf("linkedin.com")) : url;

    const interval = setInterval(async () => {       

        var sessionItem = await chrome.storage.session.get(["myTabs"]);
        if (!sessionItem.myTabs
                || (sessionItem.myTabs && !Object.hasOwn(sessionItem.myTabs, tabId))
                || (sessionItem.myTabs && Object.hasOwn(sessionItem.myTabs, tabId) && !sessionItem.myTabs[tabId].visits)){
            return;
        }

        const index = sessionItem.myTabs[tabId].visits.map(v => v.url).indexOf(url);
        if (index == -1){
            return;
        }

        await db.visits
                .where({id: sessionItem.myTabs[tabId].visits[index].id})
                .modify(visit => {
                    visit.timeCount += appParams.TAB_TIME_INC_VALUE;
                });

    }, (appParams.TAB_TIME_INC_VALUE * 1000));

    await chrome.storage.session.set({ tabTimer: interval });

}

/** This function injects the content scripts into the page
 * along with some setup data in order to harverst the necessary data
 * or displays visuals for the user to interact with
 */

function injectScriptsInTab(tabId, url, visitId){

    // const linkedInPattern = /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)/gm;
    
    async function injectDataExtractorParams(tabId, url){

        // Inject tab id
        const settings = await db
                               .settings
                               .where('id')
                               .equals(1)
                               .first();

        chrome.tabs.sendMessage(tabId, {
                header: messageMeta.header.CS_SETUP_DATA, 
                data: {
                    tabId: tabId, 
                    settings: {lastDataResetDate: settings.lastDataResetDate},
                    visitId: visitId,
                }
            }, 
            (response) => {
                console.log('tabId sent', response);
            }
        ); 

        if (isLinkedinFeed(url)){
            db.keywords.toArray().then((keywords) => {
                keywords = keywords.map(keyword => keyword.name);
                chrome.tabs.sendMessage(tabId, {header: messageMeta.header.CS_SETUP_DATA, data: {allKeywords: keywords}}, (response) => {
                    console.log('Keywords sent', keywords, response);
                }); 
            });
        }

        if (settings.notifications){
            getTodayReminders(db, (reminders) => {
                if (reminders.length){

                    var uuid = uuidv4();
                    chrome.notifications.create(uuid, {
                        title: 'Linkbeam',
                        message: `${reminders.length} waiting reminder${reminders.length <= 1 ? "" : "s"}`,
                        iconUrl: chrome.runtime.getURL("/assets/app_logo.png"),
                        type: 'basic',
                        buttons: [{
                            title: "Show",
                            // iconUrl: "/path/to/yesIcon.png",
                        }]
                    });

                    chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
                        if (notificationId == uuid){
                            if (buttonIndex == 0){
                                chrome.tabs.sendMessage(tabId, {header: messageMeta.header.CS_SETUP_DATA, data: {show: true, widget: "ReminderModal"}}, (response) => {
                                    console.log('Show reminder modal request sent', response);
                                }); 
                            }
                        }
                    });

                    chrome.tabs.sendMessage(tabId, {header: messageMeta.header.CS_SETUP_DATA, data: {reminders: reminders}}, (response) => {
                        console.log('Reminders sent', response);
                    }); 
                }
            });
        }     

    };

    // If the user is browsing linkedin's feed
    const dataExtractorPath = "./assets/mixed_data_extractor.js";

    if (dataExtractorPath){
        chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: [dataExtractorPath],
            }, 
            () => {
                injectDataExtractorParams(tabId, url);
            }
        );
    }

};

/** Whenever needed, this function reset the timer
 * for a new timer to start over
 */

async function resetTabTimer(){

    const sessionItem = await chrome.storage.session.get(["tabTimer"]);

    if (sessionItem.tabTimer){
        clearInterval(sessionItem.tabTimer);
        await chrome.storage.session.set({ tabTimer: null })
    }
}

async function handleNewInterestingTab(tabId, url, onNewTab){

    if (onNewTab){
        runTabTimer(tabId, url);
    }

    var sessionItem = await chrome.storage.session.get(["myTabs"]),
        visitId = null, 
        myTabs = null;
    const badgeText = "!";

    if (onNewTab){
        chrome.action.setBadgeText({text: badgeText});
    }

    if (!sessionItem.myTabs){

        myTabs = {};  
        myTabs[tabId] = {badgeText: badgeText};

        if (isLinkedinFeed(url)){
            visitId = await addFreshFeedVisit();
            myTabs[tabId].visits = [{id: visitId, url: url}];
        }

    }
    else{

        myTabs = sessionItem.myTabs;  

        if (Object.hasOwn(sessionItem.myTabs, tabId)){

            if (onNewTab){
                chrome.action.setBadgeText({text: sessionItem.myTabs[tabId].badgeText});
            }
            
            if (!sessionItem.myTabs[tabId].visits){

                if (isLinkedinFeed(url)){
                    visitId = await addFreshFeedVisit();
                    myTabs[tabId].visits = [{id: visitId, url: url}];
                }

            }
            else{

                const index = myTabs[tabId].visits.map(v => v.url).indexOf(url);
                if (index == -1){

                    if (isLinkedinFeed(url)){
                        visitId = await addFreshFeedVisit();
                        myTabs[tabId].visits.push({id: visitId, url: url});
                    }

                }
                else{
                    visitId = myTabs[tabId].visits[index].id;
                }

            }

        }
        else{

            myTabs[tabId] = {badgeText: badgeText};

            if (isLinkedinFeed(url)){
                visitId = await addFreshFeedVisit();
                if (!myTabs[tabId].visits){
                    myTabs[tabId].visits = [{id: visitId, url: url}];
                }
                else{
                    if (myTabs[tabId].visits.map(v => v.url).indexOf(url) == -1){
                        myTabs[tabId].visits.push({id: visitId, url: url});
                    }
                }
            }

        }
    }

    chrome.storage.session.set({ myTabs: myTabs });
    console.log('Injectinnnnnnnnnnnng');
    injectScriptsInTab(tabId, url, visitId);

    async function addFreshFeedVisit(){
        var feedItemsMetrics = {};
        const dateTime = new Date().toISOString();
        for (var category of Object.keys(categoryVerbMap).concat(["publications"])) { feedItemsMetrics[category] =  0; }

        var visit = {
            date: dateTime,
            url: appParams.LINKEDIN_FEED_URL,
            timeCount: 1, 
            feedItemsMetrics: feedItemsMetrics,
        };

        await db.visits.add(visit);
        return (await db.visits.where({date: dateTime}).first()).id;
    }

}

chrome.tabs.onActivated.addListener(async function(activeInfo) {

    // console.log(activeInfo.tabId);

    await resetTabTimer();

    // windowId = info.windowId

    console.log("changing tab : ", activeInfo.tabId);

    chrome.tabs.query({}, function(tabs){

        // notifying to all linkedin tabs the change of the active tab
        tabs.forEach(tab => {
            if (tab.url && testTabBaseUrl(tab.url)){
                chrome.tabs.sendMessage(tab.id, {header: messageMeta.header.CS_SETUP_DATA, data: {tabId: activeInfo.tabId}}, (response) => {
                    console.log('activated tab id sent', response);
                }); 
            }
        });
    });


    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){

        var url = tabs[0].url;

        if (url && testTabBaseUrl(url)){

            if (!isUrlOfInterest(url)){
                chrome.action.setBadgeText({text: null});
                return;
            }

            url = url.split("?")[0];

            Dexie.exists(appParams.appDbName).then(function (exists) {
                if (exists) {

                    handleNewInterestingTab(activeInfo.tabId, url, true);

                }
            });

        }
        else{
            chrome.action.setBadgeText({text: null});
        }

    });

});

// Script for processing linkedin data

async function processTabData(tabData){
    
    console.log("linkedInData : ", tabData);

    if (tabData.extractedData){
        if (isLinkedinFeed(tabData.tabUrl)){ // feed data
            await recordFeedVisit(tabData);
        }
        else if (isLinkedinProfilePage(tabData.tabUrl)){ // profile data
            await recordProfileVisit(tabData);
        }
    }

}

async function recordFeedVisit(tabData){

    const dateTime = new Date().toISOString();

    var sessionItem = await chrome.storage.session.get(["myTabs"]);
    const visitIndex = sessionItem.myTabs[tabData.tabId].visits.map(v => v.url).indexOf(tabData.tabUrl);
    const visitId = sessionItem.myTabs[tabData.tabId].visits[visitIndex].id;

    db.visits
      .where({id: visitId})
      .first()
      .then(async (visit) => {

        if (!visit){
            return;
        }

        var post = tabData.extractedData;

        if (post.category == "suggestions"){
            visit.feedItemsMetrics[post.category]++;
        }
        else{

            const newPost = {
                uid: post.id,
                category: post.category,
                initiator: post.initiator,
                content: {
                    author: post.content.author,
                    text: post.content.text,
                },
            };

            // await db.transaction('rw', [db.feedPosts, db.feedPostViews], function() {
            //     // saving the post
            //     db.feedPosts.add(newPost);
            // }).then(function() {
            //     console.log("Transaction committed");
            // }).catch(function(err) {
            //     console.error(err);
            // });


            var dbPost = await db.feedPosts
                                .where("uid")
                                .equals(post.id)
                                .first();

            if (dbPost){
                await db.feedPosts
                        .update(dbPost.id, newPost);
            }
            else{
                await db.feedPosts.add(newPost);
            }

            var postView = await db.feedPostViews
                                   .where({uid: post.id, visitId: visitId})
                                   .first(); 

            if (!postView){

                postView = {
                    uid: post.id,
                    date: dateTime,
                    visitId: visitId, 
                    reactions: post.content.reactions,
                    commentsCount: post.content.commentsCount,
                    repostsCount: post.content.repostsCount,
                    timeCount: 1,
                };

                // saving the post view
                await db.feedPostViews.add(postView);

                visit.feedItemsMetrics[post.category ? post.category : "publications"]++;
                
            }

        }

        post.reminder = await db.reminders
                                 .where("objectId")
                                 .equals(post.id)
                                 .first();

        post.viewsCount = 0;
        post.timeCount = 0;

        await db.feedPostViews
                 .where("uid")
                 .equals(post.id)
                 .each(postView => {
                    post.viewsCount++;
                    post.timeCount += (postView.timeCount ? postView.timeCount : 0);
                 });

        await db.visits.update(visit.id, visit);
        
        // display the updated badge text
        var badgeText = 0;
        for (var metric in visit.feedItemsMetrics){ badgeText += visit.feedItemsMetrics[metric]; }
        badgeText = badgeText.toString();

        sessionItem.myTabs[tabData.tabId].badgeText = badgeText;
        chrome.storage.session.set({ myTabs: sessionItem.myTabs }).then(() => {
            chrome.action.setBadgeText({text: badgeText});
            // console.log("Value was set");
        });

        chrome.tabs.sendMessage(tabData.tabId, {header: messageMeta.header.CRUD_OBJECT_RESPONSE, data: {action: "read", objectStoreName: "feedPosts", objects: [post]}}, (response) => {
            console.log('response sent', response);
        });  

      });

}

async function recordProfileVisit(tabData){

    const openNewTab = (url) => {
        // open new tab

        chrome.tabs.create({
          active: true,
          url:  `/index.html?view=Profile&data=${url}`,
        }, null);

    }

    async function checkKeywordOccurence(profile, tabId){

        var keywords = await db
                           .keywords
                           .toArray();

        var stringified = JSON.stringify(profile);
        var detectedKeywords = [];
        for (var keyword of keywords){
            if (stringified.indexOf(keyword.name) != -1){
                detectedKeywords.push(keyword);
            }
        }

        if (detectedKeywords.length){

            chrome.notifications.create('', {
              title: 'Linkbeam',
              message: `${detectedKeywords.length}  keyword${reminders.length <= 1 ? "" : "s"} detected `,
              iconUrl: chrome.runtime.getURL("/assets/app_logo.png"),
              type: 'basic'
            });

            chrome.tabs.sendMessage(tabId, {header: messageMeta.header.CS_SETUP_DATA, data: {detectedKeywords: detectedKeywords}}, (response) => {
                console.log('detectedKeywords sent', response);
            });  
        }

    }

    const dateTime = new Date().toISOString(),
          badgeText = "1";
    var profileData = null;
    var sessionItem = await chrome.storage.session.get(["myTabs"]);

    if (sessionItem.myTabs[tabData.tabId].badgeText != badgeText){
        sessionItem.myTabs[tabData.tabId].badgeText = badgeText;
    }

    if (!sessionItem.myTabs[tabData.tabId].visits){
        const visitId = await processPrimeVisit();
        sessionItem.myTabs[tabData.tabId].visits = [{id: visitId, url: tabData.tabUrl, profileData: profileData}];
    }
    else{
        const index = sessionItem.myTabs[tabData.tabId].visits.map(v => v.url).indexOf(tabData.tabUrl);
        if (index == -1){
            const visitId = await processPrimeVisit();
            sessionItem.myTabs[tabData.tabId].visits.push({id: visitId, url: tabData.tabUrl, profileData: profileData});
        }
        else{

            const fullProfileData = sessionItem.myTabs[tabData.tabId].visits[index].profileData;
            const newProfileData = getNewProfileData(fullProfileData, tabData.extractedData);

            await db.visits
                    .where({id: sessionItem.myTabs[tabData.tabId].visits[index].id})
                    .modify(visit => {
                        visit.profileData = newProfileData;
                    });
        }
    }

    // console.log("TTTTTTTTTTTTTT : ", sessionItem.myTabs);
    chrome.storage.session.set({ myTabs: sessionItem.myTabs });

    // checking first that the user is on the linkedin tab before setting the badge text
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        if (tabs[0].id == tabData.tabId){
            chrome.action.setBadgeText({text: badgeText});
        }
    });

    async function processPrimeVisit(){

        const profileVisits = await db.visits
                                      .where('url')
                                      .equals(tabData.tabUrl)
                                      .sortBy("date");

        var visit = {
                date: dateTime,
                url: tabData.tabUrl,
                timeCount: 1, 
            };

        if (profileVisits.length){

            const fullProfileData = getProfileDataFrom(profileVisits);
            profileData = fullProfileData;
            const newProfileData = getNewProfileData(fullProfileData, tabData.extractedData);

            visit.profileData = newProfileData;
        }
        else{
            visit.profileData = tabData.extractedData;
        }

        await db.visits.add(visit);

        var settings = await db.settings
                               .where({id: 1})
                               .first();

        // checking the occurence of any predefined keyword in the profile
        if (settings.notifications){
            checkKeywordOccurence(tabData.extractedData, tabData.tabId);
        }

        if (settings.autoTabOpening){
            openNewTab(tabData.tabUrl);
        }

        return (await db.visits.where({"date": dateTime}).first()).id;

    }
    

}

// Script for listening to all events related to the content scripts

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

    // acknowledge receipt
    sendResponse({
        status: "ACK"
    });

    await processMessageEvent(message, sender, sendResponse);

});


// Script handling the message execution

async function processMessageEvent(message, sender, sendResponse){

    console.log("Message received : ", message);

    // testUpDb();

    // Script for getting all the visits done so far
    switch(message.header){

        case messageMeta.header.EXTRACTED_DATA:{
            // acknowledge receipt
            sendResponse({
                status: "ACK"
            });
            
            // Saving the new notification setting state
            var tabData = message.data;
            await processTabData(tabData);
            break;
        }

        case messageMeta.header.FEED_POST_TIME_UPDATE:{
            // acknowledge receipt
            sendResponse({
                status: "ACK"
            });
            
            // Saving the new notification setting state
            var postUid = message.data.postUid,
                timeCount = message.data.time,
                visitId = message.data.visitId;

            await db.feedPostViews
                    .where({uid: postUid, visitId: visitId})
                    .modify(postView => {
                        postView.timeCount = timeCount;
                    });

            break;
        }

        case messageMeta.header.CRUD_OBJECT:{
            // acknowledge receipt
            sendResponse({
                status: "ACK"
            });

            var result = null;
            switch(message.data.objectStoreName){
                case "reminders":{
                    result = await crudReminders(message.data.action, message.data.object);
                    break;
                }
                case "feedPostViews":{
                    result = await crudFeedPostViews(message.data.action, message.data.props);
                    break;
                }
            }

            chrome.tabs.sendMessage(message.data.tabId, {header: messageMeta.header.CRUD_OBJECT_RESPONSE, data: {action: message.data.action, objectStoreName: message.data.objectStoreName, object: result}}, (response) => {
                console.log('crud process response sent', response, result);
            });

            break;
        }

    }
}

async function crudFeedPostViews(action, props){

    var result = null;
    switch(action){
        case "read":{
            result = await fetchPostViews(props);
            break;
        }
    }

    return result;

}

async function crudReminders(action, reminder){

    var result = null;
    switch(action){

        case "add":{
            result = await saveReminder(reminder);
            break;
        }

        case "delete":{
            result = await deleteReminder(reminder);
            break;
        }
    }

    return result;

}

async function saveReminder(reminder){

    reminder.createdOn = (new Date()).toISOString();
    reminder.active = true;

    try{

        await db.reminders
                .add(reminder);

        return await db.reminders
                       .where("objectId")
                       .equals(reminder.objectId)
                       .first();

    }
    catch(error){
        console.error("Error : ", error);
    } 

    return null;

}

async function deleteReminder(reminder){

    try{

        await db.reminders
                .delete(reminder.id);

        return reminder.objectId;

    }
    catch(error){
        console.error("Error : ", error);
    } 

    return null;

}


async function fetchPostViews(props){

    try{

        const feedPostViews = await db.feedPostViews
                                      .where("uid")
                                      .equals(props.uid)
                                      .toArray();

        return {views: feedPostViews};

    }
    catch(error){
        console.error("Error : ", error);
        return null;
    }

}