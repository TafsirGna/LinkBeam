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
import Dexie from 'dexie';

let activeTabData = {
    id: null, 
    // url: null,
};
let timer = null;

let pageObjects = {};

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

    if (changeInfo.url){
        const url = changeInfo.url;
        if (testTabBaseUrl(url)){
            try{

                Dexie.exists(appParams.appDbName).then(async function (exists) {
                    if (exists) {

                        if (activeTabData.id == tabId){
                            if (isUrlOfInterest(url)){
                                countTabTime(tabId, url);   
                            } 
                        }

                        if (isUrlOfInterest(url)){
                            const visit = await db.visits
                                                  .where("tabId")
                                                  .equals(tabId)
                                                  .first();

                            if (!visit){
                                injectScriptsInTab(tabId, url);
                            }
                        }
                        
                    }
                });

            }
            catch(error){
                console.error("Error : ", error);
            }
        }
    }

  }
);

/** this function counts the time spent on a tab
 * before switching to another one 
 * It only does so when a linkedin page is open on that tab
 */

async function countTabTime(tabId, url){

    resetTimer();

    const interval = setInterval(async () => {       

        var visit = await db.visits
                            .where({tabId: tabId, url: url})
                            .first();

        if (!visit){

            if (isLinkedinFeed(url)){
                var feedItemsMetrics = {};
                for (var category of Object.keys(categoryVerbMap).concat(["publications"])) { feedItemsMetrics[category] =  0; }

                visit = {
                    date: new Date().toISOString(),
                    url: url,
                    timeCount: 1, 
                    tabId: tabId,
                    feedItemsMetrics: feedItemsMetrics,
                };

                await db.visits.add(visit);

                chrome.action.setBadgeText({text: "!"});
            }

            return;
        }

        visit.timeCount += appParams.TAB_TIME_INC_VALUE;
        await db.visits.update(visit.id, visit);

    }, (appParams.TAB_TIME_INC_VALUE * 1000));

    timer = interval;

}

/**
 * 
 * 
 */

function injectScriptsInTab(tabId, url){

    // const linkedInPattern = /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)/gm;
    
    async function injectDataExtractorParams(tabId, url){

        // Inject tab id
        chrome.tabs.sendMessage(tabId, {header: messageMeta.header.CS_SETUP_DATA, data: {tabId: tabId}}, (response) => {
            console.log('tabId sent', response);
        }); 

        if (isLinkedinFeed(url)){
            db.keywords.toArray().then((keywords) => {
                keywords = keywords.map(keyword => keyword.name);
                chrome.tabs.sendMessage(tabId, {header: messageMeta.header.CS_SETUP_DATA, data: {allKeywords: keywords}}, (response) => {
                    console.log('Keywords sent', keywords, response);
                }); 
            });
        }

        const settings = await db
                               .settings
                               .where('id')
                               .equals(1)
                               .first();

        if (settings.notifications){
            getTodayReminders(db, (reminders) => {
                if (reminders.length){
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

function resetTimer(){
    if (timer){
        clearInterval(timer);
        timer = null;
    }
}

chrome.tabs.onActivated.addListener(async function(activeInfo) {

    // console.log(activeInfo.tabId);

    resetTimer();

    activeTabData.id = activeInfo.tabId;
    // windowId = info.windowId

    console.log("changing tab : ", activeTabData.id);

    chrome.tabs.query({}, function(tabs){

        console.log("Existing tabs : ", tabs);

        // notifying to all linkedin tabs the change of the active tab
        tabs.forEach(tab => {
            // console.log("tab :::::::::: ", tab, tab.url && testTabBaseUrl(tab.url));
            if (tab.url && testTabBaseUrl(tab.url)){
                // console.log("******************* ", tab.id);
                chrome.tabs.sendMessage(tab.id, {header: messageMeta.header.CS_SETUP_DATA, data: {tabId: activeTabData.id}}, (response) => {
                    console.log('activated tab id sent', response);
                }); 
            }
        });
    });


    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){

        const url = tabs[0].url;
        console.log("aaa 1 ", url, testTabBaseUrl(url));
        if (url && testTabBaseUrl(url)){

            if (!isUrlOfInterest(url)){
                chrome.action.setBadgeText({text: null});
                return;
            }

            Dexie.exists(appParams.appDbName).then(function (exists) {
                if (exists) {

                    // check if this tab has already been visited 
                    (async () => {

                        try{

                            await countTabTime(activeInfo.tabId, url);

                            var visit = null;

                            if (isLinkedinProfilePage(url)){

                                visit = await db.visits
                                            .where({tabId: activeInfo.tabId, url: url.split("?")[0]})
                                            .first();

                                if (visit){
                                    if (activeTabData.id == activeInfo.tabId){
                                        chrome.action.setBadgeText({text: "1"});
                                    }
                                }
                                else{

                                    if (activeTabData.id == activeInfo.tabId){
                                        chrome.action.setBadgeText({text: null});
                                    }

                                    injectScriptsInTab(activeInfo.tabId, url);

                                }

                            }
                            else if (isLinkedinFeed(url)){

                                visit = await db.visits
                                            .where("tabId")
                                            .equals(activeInfo.tabId)
                                            .filter(visit => Object.hasOwn(visit, "feedItemsMetrics"))
                                            .first();

                                if (visit){
                                    showBadgeText(visit.feedItemsMetrics, activeInfo.tabId);
                                }
                                else{

                                    if (activeTabData.id == activeInfo.tabId){
                                        chrome.action.setBadgeText({text: null});
                                    }

                                    injectScriptsInTab(activeInfo.tabId, url);

                                }

                            }

                        }
                        catch (error) {
                            console.log("Error : ", error);
                        }

                    })();

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
    // if (activeTabData.id != tabData.tabId){
    //     return;
    // }

    if (tabData.extractedData){
        if (isLinkedinFeed(tabData.tabUrl)){ // feed data
            await recordFeedVisit(tabData);
        }
        else if (isLinkedinProfilePage(tabData.tabUrl)){ // profile data
            await recordProfileVisit(tabData);
        }
    }

}


function showBadgeText(feedItemsMetrics, tabId){

    var badgeText = 0;
    for (var metric in feedItemsMetrics){
        badgeText += feedItemsMetrics[metric];
    }

    console.log("µµµµµµµµµµµµµµµµµ : ", activeTabData.id, tabId, badgeText);
    if (activeTabData.id == tabId){
        chrome.action.setBadgeText({text: badgeText.toString()});
    }

}

async function recordFeedVisit(tabData){

    const dateTime = new Date().toISOString();

    db.visits
      .where({url: tabData.tabUrl, tabId: tabData.tabId})
      .first()
      .then(async (visit) => {

        if (!visit){
            return;
        }

        var post = tabData.extractedData;
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


        await db.feedPosts
            .where("uid")
            .equals(post.id)
            .first()
            .then(async (dbPost) => {
                
                if (dbPost){
                    await db.feedPosts
                            .update(dbPost.id, newPost);
                }
                else{
                    await db.feedPosts.add(newPost);
                }

                var postView = await db.feedPostViews
                                       .where({uid: post.id, tabId: tabData.tabId})
                                       .first(); 

                if (!postView){

                    postView = {
                        uid: post.id,
                        date: dateTime,
                        tabId: tabData.tabId, 
                        reactions: post.content.reactions,
                        commentsCount: post.content.commentsCount,
                        repostsCount: post.content.repostsCount,
                    };

                    // saving the post view
                    await db.feedPostViews.add(postView);
                    
                }

                post.reminder = await db.reminders
                                         .where("objectId")
                                         .equals(newPost.uid)
                                         .first();

                post.viewsCount = 0;
                post.timeCount = 0;

                await db.feedPostViews
                         .where("uid")
                         .equals(newPost.uid)
                         .each(postView => {
                            post.viewsCount++;
                            post.timeCount += (postView.timeCount ? postView.timeCount : 0);
                         })

            });

        visit.feedItemsMetrics[post.category ? post.category : "publications"]++;
        // console.log("poooooooooooooost : ", post.category, visit.feedItemsMetrics);
        await db.visits.update(visit.id, visit);
        
        // display the updated badge text
        showBadgeText(visit.feedItemsMetrics, tabData.tabId);

        chrome.tabs.sendMessage(tabData.tabId, {header: messageMeta.header.CRUD_OBJECT_RESPONSE, data: {action: "read", objectStoreName: "feedPosts", objects: [post]}}, (response) => {
            console.log('response sent', response);
        });  

      });

}

async function recordProfileVisit(tabData){

    tabData.tabUrl = tabData.tabUrl;

    const openNewTab = (url, settings) => {
        // open new tab
        if (settings.autoTabOpening){

            chrome.tabs.create({
              active: true,
              url:  `/index.html?view=Profile&data=${url}`,
            }, null);

        }
    }

    async function checkKeywordOccurence(profile, tabId, settings){

        if (settings.notifications){
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
                chrome.tabs.sendMessage(tabId, {header: messageMeta.header.CS_SETUP_DATA, data: {detectedKeywords: detectedKeywords}}, (response) => {
                    console.log('detectedKeywords sent', response);
                });  
            }
        }     

    }

    const profileVisits = await db
                            .visits
                            .where('url')
                            .equals(tabData.tabUrl)
                            .sortBy("date");

    if (profileVisits.length){

        var visit = profileVisits.filter(profileVisit => profileVisit.tabId == tabData.tabId);
        visit = visit.length ? visit[0] : null;

        const fullProfileData = getProfileDataFrom(profileVisits);
        const newProfileData = getNewProfileData(fullProfileData, tabData.extractedData);

        if (visit){

            // Incrementing the time count
            await db
                    .visits
                    .where({id: visit.id})
                    .modify(visit => {
                        visit.profileData = newProfileData;
                    });

        }
        else{

            var settings = await db
                                   .settings
                                   .where('id')
                                   .equals(1)
                                   .first();

            // checking the occurence of any predefined keyword in the profile
            checkKeywordOccurence(tabData.extractedData, tabData.tabId, settings);

            await db.visits.add({
                date: new Date().toISOString(),
                url: tabData.tabUrl,
                timeCount: 1, 
                tabId: tabData.tabId,
                profileData: newProfileData,
            });

            if (activeTabData.id == tabData.tabId){
                chrome.action.setBadgeText({text: "1"});
            }

            openNewTab(tabData.tabUrl, settings);

        }

    }
    else{

        var settings = await db
                               .settings
                               .where('id')
                               .equals(1)
                               .first();

        // checking the occurence of any predefined keyword in the profile
        checkKeywordOccurence(tabData.extractedData, tabData.tabId, settings);

        var visit = {
            date: new Date().toISOString(),
            url: tabData.tabUrl,
            timeCount: 1, 
            tabId: tabData.tabId,
            profileData: tabData.extractedData,
        };

        await db.visits.add(visit);

        if (activeTabData.id == tabData.tabId){
            chrome.action.setBadgeText({text: "1"});
        }

        openNewTab(tabData.tabUrl, settings);

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
                tabId = message.data.tabId;

            await db.feedPostViews
                    .where({uid: postUid, tabId: tabId})
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

        const settings = await db.settings
                                 .where("id")
                                 .equals(1)
                                 .first();

        return {lastDataResetDate: settings.lastDataResetDate, views: feedPostViews};

    }
    catch(error){
        console.error("Error : ", error);
        return null;
    }

}