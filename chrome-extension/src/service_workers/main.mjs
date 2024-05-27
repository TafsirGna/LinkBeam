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
    isLinkedinFeedPostPage,
    deactivateTodayReminders,
    popularityValue,
} from "../popup/Local_library";
import { v4 as uuidv4 } from 'uuid';
import Dexie from 'dexie';
// import { DateTime as LuxonDateTime } from "luxon";

/** The following code is executed on installation
 * and check if the required database already exists.
 * If it does exist, everything runs smoothly from then on  
 * If it doesn't, this code redirects to the installation page
 * and it finally sets the uninstallation process with the deletion
 * of the database
 */

chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

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
    return isLinkedinFeed(url) 
            || isLinkedinProfilePage(url)
            || isLinkedinFeedPostPage(url);
}


/** this function listens to any tabs change
 * to check if the change is related to linkedin
 * and then injects the appropriate script into the concerned tab
 */

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    if (!changeInfo.url){      
        return;
    }

    if (testTabBaseUrl(changeInfo.url) && isUrlOfInterest(changeInfo.url)){

        switch(changeInfo.status){

            case "loading":{

                var url = changeInfo.url.split("?")[0];

                // checking a lock before proceding
                // var sessionItem = await chrome.storage.session.get(["loadingTabs"]);
                // if (sessionItem.loadingTabs 
                //         && sessionItem.loadingTabs.findIndex(t => t.id == tabId && t.url == url) != -1){
                //     return;
                // }
                // sessionItem.loadingTabs = sessionItem.loadingTabs 
                //                             ? sessionItem.loadingTabs.concat({id: tabId, url: url})
                //                             : [{id: tabId, url: url}];
                // await chrome.storage.session.set({ loadingTabs: sessionItem.loadingTabs });

                try{

                    Dexie.exists(appParams.appDbName).then(function (exists) {
                        if (exists) {

                            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                                console.log(",,,,,,,,,,,,,,,, onUpdated | tabs : ", tabs);
                                handleNewInterestingTab(tabId, url, tabs[0].id == tabId);
                            });
                            
                        }
                    });

                }
                catch(error){
                    console.error("Error : ", error);
                }

                break;

            }

            case "complete": {

                // var sessionItem = await chrome.storage.session.get(["loadingTabs"]);
                // if (sessionItem.loadingTabs){
                //     const index = sessionItem.loadingTabs.findIndex(t => t.id == tabId && t.url == url);
                //     if (index != -1){
                //         sessionItem.loadingTabs.splice(index, 1);
                //         await chrome.storage.session.set({ loadingTabs: sessionItem.loadingTabs });
                //     }
                // }

                break;
            }

        }

    }
    else{

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            console.log("################### : ", tabs, tabs[0]);
            if (tabs[0].id == tabId){
                resetTabTimer();
                chrome.action.setBadgeText({text: null});
            }
        });

    }

  }
);

/** this function counts the time spent on a tab
 * before switching to another one 
 * It only does so when a linkedin page is open on that tab
 */

async function runTabTimer(tabId, url){

    url = isLinkedinProfilePage(url) ? url.slice(url.indexOf(appParams.LINKEDIN_ROOT_URL)) : url;

    const interval = setInterval(async () => {       

        // checking first that the user is still on the page for which the timer has been started before proceeding to the next stage
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            if (!tabs[0]){
                return;
            }
            var currTabUrl = tabs[0].url.split("?")[0];
            currTabUrl = isLinkedinProfilePage(currTabUrl) ? currTabUrl.slice(currTabUrl.indexOf(appParams.LINKEDIN_ROOT_URL)) : currTabUrl;
            if (currTabUrl != url){
                resetTabTimer();
            }
        });


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
                    visit.timeCount += (appParams.TIMER_VALUE_2 / 1000);
                });

        // finally, checking periodically if the user's reaching or crossed the time threshold
        sessionItem = await chrome.storage.session.get(["totalDayTime"]);
        const today = (new Date()).toISOString().split("T")[0];

        async function getSessionTotalDayTime(){

            const settings = await db.settings
                                 .where({id: 1})
                                 .first();

            if (!settings.notifications || settings["maxTimeAlarm"] == "Never"){
                return "N/A";
            }

            var totalTime = 0;
            await db.visits
                    .where("date")
                    .startsWith((new Date()).toISOString().split("T")[0])
                    .each(visit => {
                        totalTime += visit.timeCount;
                    });

            return {
                date: today, 
                time: totalTime,
                max: settings["maxTimeAlarm"] == "1 hour" ? 60 : Number(settings["maxTimeAlarm"].slice(0, 2)),
                lastCheckedAt: totalTime,
            };
        }

        if (!sessionItem.totalDayTime){
            sessionItem.totalDayTime = await getSessionTotalDayTime();
        }
        else{

            if (sessionItem.totalDayTime == "N/A"){
                return;
            }

            if (sessionItem.totalDayTime.date != today){
                sessionItem.totalDayTime = await getSessionTotalDayTime();
            }
            else{
                sessionItem.totalDayTime.time += (appParams.TIMER_VALUE_2 / 1000);
            }
        }

        if (sessionItem.totalDayTime == "N/A"){
            await chrome.storage.session.set({ totalDayTime: sessionItem.totalDayTime });
            return;
        }

        const mins = (sessionItem.totalDayTime.time / 60).toFixed(0); 

        if (!(mins % 5) /*every 5 minutes*/ && mins != sessionItem.totalDayTime.lastCheckedAt){

            sessionItem.totalDayTime.lastCheckedAt = mins;

            if (mins >= (sessionItem.totalDayTime.max * (3/4))){

                const uuid = uuidv4();
                chrome.notifications.create(uuid, {
                  title: 'Linkbeam',
                  message: `Time limit ${mins >= sessionItem.totalDayTime.max ? "" : "almost"} reached`,
                  iconUrl: chrome.runtime.getURL("/assets/app_logo.png"),
                  type: 'basic',
                });

            }

        }

        await chrome.storage.session.set({ totalDayTime: sessionItem.totalDayTime });

    }, (appParams.TIMER_VALUE_2));

    await chrome.storage.session.set({ tabTimer: interval });

}

async function getPostFromPostUrl(url){

    var postUid = url.slice(url.indexOf("urn:li:activity:")).replaceAll("/", "");

    var post = await db.feedPosts
                       .where({uid: postUid})
                       .first();

    if (!post){
        post = {};
    }

    post.reminder = await db.reminders
                             .where("objectId")
                             .equals(postUid)
                             .first();

    post.viewsCount = 0;

    await db.feedPostViews
             .where("uid")
             .equals(postUid)
             .each(postView => {
                post.viewsCount++;
             });

    return post;

}

/** This function injects the content scripts into the page
 * along with some setup data in order to harverst the necessary data
 * or displays visuals for the user to interact with
 */

function injectScriptsInTab(tabId, url, visitId){

    // const linkedInPattern = /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)/gm;
    
    

    // If the user is browsing linkedin's feed
    const dataExtractorPath = "./assets/main_content_script.js";

    if (dataExtractorPath){
        chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: [dataExtractorPath],
            }, 
            () => {
                injectDataExtractorParams(tabId, url, visitId);
            }
        );
    }

};

async function injectDataExtractorParams(tabId, url, visitId){

    // Inject tab id
    const settings = await db
                           .settings
                           .where({id: 1})
                           .first();

    var postData = null;
    if (isLinkedinFeedPostPage(url)){
        postData = await getPostFromPostUrl(url);
    }

    const keywords = (await db.keywords.toArray()).map(keyword => keyword.name.toLowerCase());
    var payload = {
        tabId: tabId, 
        settings: {
            lastDataResetDate: settings.lastDataResetDate,
            notifications: settings.notifications,
        },
        visitId: visitId,
        postData: postData,
        allKeywords: keywords,
    };

    chrome.tabs.sendMessage(tabId, {
            header: messageMeta.header.CS_SETUP_DATA, 
            data: payload,
        }, 
        (response) => {
            console.log('tabId sent', response, payload);
        }
    ); 

    if (settings.notifications){
        getTodayReminders(db, (reminders) => {
            if (reminders.length){

                const uuid = uuidv4();
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

                            chrome.tabs.create({
                              active: true,
                              url:  `/index.html?view=Calendar&dataType=Reminders`,
                            }, () => {
                                deactivateTodayReminders(db);
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

/** Whenever needed, this function reset the timer
 * for a new timer to start over
 */

async function resetTabTimer(){

    const sessionItem = await chrome.storage.session.get(["tabTimer"]);

    if (sessionItem.tabTimer){
        clearInterval(sessionItem.tabTimer);
        await chrome.storage.session.set({ tabTimer: null });
    }

}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'my_menu_item') {
    console.log('hello');
  }
});

async function handleNewInterestingTab(tabId, url, onNewTab){

    if (onNewTab){
        await resetTabTimer();
        if (!isLinkedinFeedPostPage(url)){
            runTabTimer(tabId, url);
        }
    }

    var sessionItem = await chrome.storage.session.get(["myTabs"]),
        visitId = null;
    const badgeText = "!";

    if (onNewTab){
        chrome.action.setBadgeText({text: badgeText});
    }

    if (!sessionItem.myTabs){

        sessionItem.myTabs = {};  
        sessionItem.myTabs[tabId] = {badgeText: badgeText};

        if (isLinkedinFeed(url)){
            visitId = await addFreshFeedVisit();
            sessionItem.myTabs[tabId].visits = [{id: visitId, url: url}];
            setPostsRankingInSession();
        }

        chrome.storage.session.set({ myTabs: sessionItem.myTabs });
        injectScriptsInTab(tabId, url, visitId);

    }
    else{

        if (Object.hasOwn(sessionItem.myTabs, tabId)){

            if (onNewTab){
                chrome.action.setBadgeText({text: sessionItem.myTabs[tabId].badgeText});
            }
            
            if (!sessionItem.myTabs[tabId].visits){

                if (isLinkedinFeed(url)){
                    visitId = await addFreshFeedVisit();
                    sessionItem.myTabs[tabId].visits = [{id: visitId, url: url}];
                    setPostsRankingInSession();
                }

                chrome.storage.session.set({ myTabs: sessionItem.myTabs });
                injectScriptsInTab(tabId, url, visitId);

            }
            else{

                const index = sessionItem.myTabs[tabId].visits.map(v => v.url).indexOf(url);
                if (index == -1){

                    if (isLinkedinFeed(url)){
                        visitId = await addFreshFeedVisit();
                        sessionItem.myTabs[tabId].visits.push({id: visitId, url: url});
                        setPostsRankingInSession();
                    }

                    chrome.storage.session.set({ myTabs: sessionItem.myTabs });
                    injectScriptsInTab(tabId, url, visitId);

                }
                // else{
                //     visitId = sessionItem.myTabs[tabId].visits[index].id;
                // }

            }

        }
        else{

            sessionItem.myTabs[tabId] = {badgeText: badgeText};

            if (isLinkedinFeed(url)){
                visitId = await addFreshFeedVisit();
                if (!sessionItem.myTabs[tabId].visits){
                    sessionItem.myTabs[tabId].visits = [{id: visitId, url: url}];
                }
                else{
                    if (sessionItem.myTabs[tabId].visits.map(v => v.url).indexOf(url) == -1){
                        sessionItem.myTabs[tabId].visits.push({id: visitId, url: url});
                    }
                }
                setPostsRankingInSession();
            }

            chrome.storage.session.set({ myTabs: sessionItem.myTabs });
            injectScriptsInTab(tabId, url, visitId);

        }
    }

    // if (isLinkedinFeed(url)){ 
    //     createBrowsingOnBehalfMenu();
    // }

    // function createBrowsingOnBehalfMenu(){

    //     chrome.contextMenus.create({
    //         id: "browse_on_behalf_menu",
    //         title: "Browse on behalf",
    //         contexts: ["all"]
    //     });

    // }

    async function setPostsRankingInSession(){

        var sessionItem = await chrome.storage.session.get(["rankedPostsByPopularity"]);
        if (sessionItem.rankedPostsByPopularity){
            return;
        }

        var feedPosts = await db.feedPosts.toArray(),
            results = [];
        for (var feedPost of feedPosts){

            const lastView = await db.feedPostViews
                                   .where({feedPostId: feedPost.id})
                                   .last();

            if (!lastView){
                continue;
            }

            results.push({id: feedPost.id, popularity: popularityValue(lastView)});

        }

        results.sort(function(a, b) { return b.popularity - a.popularity; });

        await chrome.storage.session.set({ rankedPostsByPopularity: results }).then(function(){
            console.log("--- rankedPostsByPopularity set ", results);
        });

        return results;

    }


    async function addFreshFeedVisit(){

        var feedItemsMetrics = {};
        const dateTime = new Date().toISOString();
        for (var category of Object.keys(categoryVerbMap).concat(["publications"])) { feedItemsMetrics[category] =  0; }

        var visit = {
            date: dateTime,
            url: appParams.LINKEDIN_FEED_URL(),
            timeCount: 1, 
            feedItemsMetrics: feedItemsMetrics,
        };

        await db.visits.add(visit);
        return (await db.visits.where({date: dateTime}).first()).id;

    }

}

chrome.tabs.onActivated.addListener(async function(activeInfo) {

    // console.log(activeInfo.tabId);
    // windowId = info.windowId

    await resetTabTimer();

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

        const newFeedPost = {
            uid: !post.category ? post.id : null,
            author: post.content.author,
            text: post.content.text,
            media: post.content.media 
                    ? (post.content.media.length
                        ? post.content.media
                        : null) 
                    : null,
            date: post.content.date,
        };

        console.log("!!!!!!!!!!!!!!!!!! : ", post);


        if (post.subPost){

            var subPost = {
                uid: post.subPost.uid,
                author: post.subPost.author,
                text: post.subPost.text,
                media: post.subPost.media
                        ? (post.subPost.media.length
                            ? post.subPost.media
                            : null)
                        : null,
                date: post.subPost.date,
            }

            await db.feedPosts
                    .add(subPost)
                    .then(function(id){
                        subPost.id = id;
                    })

            newFeedPost["linkedPostId"] = subPost.id;
            
        }

        function sameFeedPostCondition(entry, newFeedPost){
            return (newFeedPost.uid && entry.uid && newFeedPost.uid == entry.uid)
                                                        || ((!newFeedPost.uid || !entry.uid) 
                                                                && entry.author.url == newFeedPost.author.url
                                                                && entry.text.replaceAll("\n", "").replaceAll(/\s/g,"").slice(0, 20) == newFeedPost.text.replaceAll("\n", "").replaceAll(/\s/g,"").slice(0, 20));
        }

        var dbFeedPost = await db.feedPosts
                                   .filter(entry => sameFeedPostCondition(entry, newFeedPost))
                                   .first();

        if (dbFeedPost){

            newFeedPost.uid = dbFeedPost.uid ? dbFeedPost.uid : newFeedPost.uid; // avoid overwritting a previous valid uid
            await db.feedPosts
                    .update(dbFeedPost.id, newFeedPost);

        }
        else{

            await db.feedPosts
                    .add(newFeedPost).then(function(id){
                        newFeedPost.id = id;
                        dbFeedPost = newFeedPost;
                    });

        }

        var postView = await db.feedPostViews
                               .where({uid: post.id, visitId: visitId})
                               .first(); 

        if (!postView){

            postView = {
                category: post.category,
                initiator: post.initiator,
                uid: post.id,
                date: dateTime,
                visitId: visitId, 
                feedPostId: dbFeedPost.id,
                reactions: post.content.reactions,
                commentsCount: post.content.commentsCount,
                repostsCount: post.content.repostsCount,
                timeCount: 1,
            };

            // saving the post view
            await db.feedPostViews.add(postView);

            visit.feedItemsMetrics[post.category ? post.category : "publications"]++;
            
        }


        post.reminder = await db.reminders
                                 .where({objectId: dbFeedPost.id})
                                 .first();
        if (post.reminder){
            post.reminder.postUid = post.id;
        }

        post.viewsCount = 0;
        post.timeCount = 0;
        post.dbId = dbFeedPost.id;

        var popularity = {date: null, value: 0};
        await db.feedPostViews
                 .where({feedPostId: dbFeedPost.id})
                 .each(postView => {

                    post.viewsCount++;
                    post.timeCount += postView.timeCount;

                    // updating popularity variable
                    if (!popularity.date){
                        popularity.date = postView.date;
                        popularity.value = popularityValue(postView);
                    }
                    else{
                        if (new Date(popularity.date) < new Date(postView.date)){
                            popularity.date = postView.date;
                            popularity.value = popularityValue(postView);
                        }
                    }

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

        // update the rankedPostsByPopularity session variable
        sessionItem = await chrome.storage.session.get(["rankedPostsByPopularity"]);
        if (!sessionItem.rankedPostsByPopularity){
            sessionItem.rankedPostsByPopularity = await setPostsRankingInSession();
        }

        const index = sessionItem.rankedPostsByPopularity.map(p => p.id).indexOf(dbFeedPost.id);
        if (index != -1){
            post.rank = {
                number: index + 1, 
                count: sessionItem.rankedPostsByPopularity.length,
            };
        }
        else{
            sessionItem.rankedPostsByPopularity.push({id: dbFeedPost.id, popularity: popularity.value});
            sessionItem.rankedPostsByPopularity.sort(function(a, b){ return b.popularity - a.popularity; });
            post.rank = {
                number: sessionItem.rankedPostsByPopularity.map(p => p.id).indexOf(dbFeedPost.id) + 1,
                count: sessionItem.rankedPostsByPopularity.length,
            };
            await chrome.storage.session.set({ rankedPostsByPopularity: sessionItem.rankedPostsByPopularity }).then(function(){
                console.log("--- rankedPostsByPopularity set ", sessionItem.rankedPostsByPopularity);
            });
        }

        chrome.tabs.sendMessage(tabData.tabId, {header: messageMeta.header.CRUD_OBJECT_RESPONSE, data: {action: "read", objectStoreName: "feedPosts", objects: [post]}}, (response) => {
            console.log('post data response sent', [post], response);
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

    const dateTime = new Date().toISOString(),
          badgeText = "1";
    var profileData = null;
    var sessionItem = await chrome.storage.session.get(["myTabs"]);

    if (sessionItem.myTabs[tabData.tabId].badgeText != badgeText){
        sessionItem.myTabs[tabData.tabId].badgeText = badgeText;
    }

    if (!sessionItem.myTabs[tabData.tabId].visits){
        sessionItem.myTabs[tabData.tabId].visits = [{
            id: await processPrimeVisit(), 
            url: tabData.tabUrl, 
            profileData: profileData,
        }];
    }
    else{
        const index = sessionItem.myTabs[tabData.tabId].visits.map(v => v.url).indexOf(tabData.tabUrl);
        if (index == -1){
            sessionItem.myTabs[tabData.tabId].visits.push({
                id: await processPrimeVisit(), 
                url: tabData.tabUrl, 
                profileData: profileData,
            });
        }
        else{
            profileData = sessionItem.myTabs[tabData.tabId].visits[index].profileData;

            await db.visits
                    .where({id: sessionItem.myTabs[tabData.tabId].visits[index].id})
                    .modify(visit => {
                        visit.profileData = getNewProfileData(profileData, tabData.extractedData);
                    });

        }
    }

    chrome.storage.session.set({ myTabs: sessionItem.myTabs });

    // checking first that the user is on the linkedin tab before setting the badge text
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        if (tabs[0].id == tabData.tabId){
            chrome.action.setBadgeText({text: badgeText});
        }
    });

    chrome.tabs.sendMessage(tabData.tabId, {header: "SAVED_PROFILE_OBJECT", data: profileData ? profileData : tabData.extractedData}, (response) => {
        console.log('profile data response sent', response, profileData ? profileData : tabData.extractedData);
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
            profileData = await getProfileDataFrom(db, tabData.tabUrl);
            visit.profileData = getNewProfileData(profileData, tabData.extractedData);
        }
        else{
            visit.profileData = tabData.extractedData;
        }

        await db.visits.add(visit);

        var settings = await db.settings
                               .where({id: 1})
                               .first();

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

        case "NOTIFY_USER":{
            // acknowledge receipt
            sendResponse({
                status: "ACK"
            });
            
            if (message.data == "keywords"){

                const uuid = uuidv4();
                chrome.notifications.create(uuid, {
                  title: 'Linkbeam',
                  message: `Keyword detected !`,
                  iconUrl: chrome.runtime.getURL("/assets/app_logo.png"),
                  type: 'basic',
                });

            }
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
    const postUid = reminder.objectId;

    try{

        reminder.objectId = (await db.feedPostViews
                                     .where({uid: reminder.objectId})
                                     .first()).feedPostId;

        await db.reminders
                .add(reminder)
                .then(function(id){
                    reminder.id = id;
                });

        reminder.postUid = postUid;
        return reminder;/*await db.reminders
                       .where("objectId")
                       .equals(reminder.objectId)
                       .first()*/;

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

        return reminder.postUid;

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