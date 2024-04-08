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
} from "../popup/Local_library";
import Dexie from 'dexie';

let currentTabId = null;

// Extension installation script
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
                
                // Removing local storage data
                // localStorage.removeItem("currentPageTitle");

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


// Script for listening to all tab updates

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    // check first if the app has been correctly set up before proceeding
    if (changeInfo.url){
        const url = changeInfo.url;
        if (url && testTabBaseUrl(url)){
            Dexie.exists(appParams.appDbName).then(function (exists) {
                if (exists) {

                    if (currentTabId == tabId){
                        chrome.action.setBadgeText({text: null});
                    }
                    processTabEvent(tabId, url);
                    
                }
            });
        }
    }

  }
);

// Script for processing tab event

function processTabEvent(tabId, url){

    // const linkedInPattern = /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)/gm;
    
    async function injectDataExtractorParams(tabId){

        // Inject tab id
        chrome.tabs.sendMessage(tabId, {header: messageMeta.header.CS_SETUP_DATA, data: {tabId: tabId}}, (response) => {
            console.log('tabId sent', response);
        }); 

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
            })
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
                injectDataExtractorParams(tabId);
            }
        );
    }

};

chrome.tabs.onActivated.addListener(function(activeInfo) {

    // console.log(activeInfo.tabId);
    currentTabId = activeInfo.tabId;
    // windowId = info.windowId

    chrome.tabs.query({}, function(tabs){

        // pausing or reactivating linkedin tabs
        tabs.forEach(tab => {
            if (tab.url && testTabBaseUrl(tab.url)){
                chrome.tabs.sendMessage(tab.id, {header: messageMeta.header.CS_SETUP_DATA, data: {tabId: currentTabId}}, (response) => {
                    console.log('activated tab id sent', response);
                }); 
            }
        });


        const url = tabs[0].url;
        if (url && testTabBaseUrl(url)){

            if (url.indexOf("/feed") == -1
                    && url.indexOf("/in/") == -1){
                chrome.action.setBadgeText({text: null});
                return;
            }

            Dexie.exists(appParams.appDbName).then(function (exists) {
                if (exists) {

                    // check if this tab has already been visited 
                    (async () => {

                        try{

                            var visit = null;

                            if (url.indexOf("/in/") != -1){

                                visit = await db.visits
                                            .where({tabId: activeInfo.tabId, url: url.split("?")[0]})
                                            .first();

                                if (visit){
                                    if (currentTabId == activeInfo.tabId){
                                        chrome.action.setBadgeText({text: "1"});
                                    }
                                }
                                else{

                                    if (currentTabId == activeInfo.tabId){
                                        chrome.action.setBadgeText({text: null});
                                    }

                                    processTabEvent(activeInfo.tabId, url);

                                }

                            }
                            else if (url.indexOf("/feed") != -1){

                                visit = await db.visits
                                            .where("tabId")
                                            .equals(activeInfo.tabId)
                                            .filter(visit => Object.hasOwn(visit, "feedItemsMetrics"))
                                            .first();

                                if (visit){
                                    showBadgeText(visit.feedItemsMetrics, activeInfo.tabId);
                                }
                                else{

                                    if (currentTabId == activeInfo.tabId){
                                        chrome.action.setBadgeText({text: null});
                                    }

                                    processTabEvent(activeInfo.tabId, url);

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
    if (currentTabId != tabData.tabId){
        return;
    }

    if (!tabData.extractedData){

        if (tabData.tabUrl.indexOf("/feed") != -1){

            await db
                    .visits
                    .where("tabId")
                    .equals(tabData.tabId)
                    .filter(visit => Object.hasOwn(visit, "feedItemsMetrics"))
                    .modify(visit => {
                        visit.timeCount += appParams.TIME_COUNT_INC_VALUE;
                    });

        }
        else if (tabData.tabUrl.indexOf("/in/") != -1){

            await db
                    .visits
                    .where({url: tabData.tabUrl, tabId: tabData.tabId})
                    .modify(visit => {
                        visit.timeCount += appParams.TIME_COUNT_INC_VALUE;
                    });

        }

    }
    else{
        if (tabData.tabUrl.indexOf("/feed") != -1){ // feed data
            await recordFeedVisit(tabData);
        }
        else if (tabData.tabUrl.indexOf("/in/") != -1){ // profile data
            await recordProfileVisit(tabData);
        }
    }

}


function showBadgeText(feedItemsMetrics, tabId){

    var badgeText = 0;
    for (var metric in feedItemsMetrics){
        badgeText += feedItemsMetrics[metric];
    }

    if (currentTabId == tabId){
        chrome.action.setBadgeText({text: badgeText.toString()});
    }

}

async function recordFeedVisit(tabData){

    // checking first that the object has some consistent data
    var postCount = 0;
    for (var metric in tabData.extractedData.metrics){
        postCount += tabData.extractedData.metrics[metric];
    }

    if (!postCount){
        return;
    }

    const dateTime = new Date().toISOString();

    const visit = await db
                            .visits
                            .where({url: tabData.tabUrl, tabId: tabData.tabId})
                            .first();

    if (visit){

        // Incrementing the time count
        await db
                .visits
                .where({url: tabData.tabUrl, tabId: tabData.tabId})
                .modify(visit => {
                    visit.timeCount += appParams.TIME_COUNT_INC_VALUE;
                    visit.feedItemsMetrics = tabData.extractedData.metrics;
                });

    }
    else{

        const dateTime = new Date().toISOString();

        await db.visits.add({
            date: dateTime,
            url: tabData.tabUrl,
            timeCount: 1, 
            tabId: tabData.tabId,
            feedItemsMetrics: tabData.extractedData.metrics,
        });

    }

    // display the updated badge text
    if (currentTabId == tabData.tabId){
        chrome.action.setBadgeText({text: postCount.toString()});
    }

    // save all the sent posts
    for (var post of tabData.extractedData.posts){

        var dbPost = await db.feedPosts
                             .where("uid")
                             .equals(post.id)
                             .first(),

            newPost = {
                uid: post.id,
                category: post.category,
                initiator: post.initiator,
                content: {
                    author: post.content.author,
                    text: post.content.text,
                },
            };

        if (!dbPost){

            db.transaction('rw', db.feedPosts, function() {
                // saving the post
                db.feedPosts.add(newPost);
            }).then(function() {
                console.log("Transaction committed");
            }).catch(function(err) {
                console.error(err);
            });

        }
        else{

            await db.feedPosts
                    .update(dbPost.id, newPost);

        }

        var postView = await db.feedPostViews
                               .where({uid: post.id, tabId: tabData.tabId})
                               .first(); 

        if (!postView){

            // saving the post view
            await db.feedPostViews.add({
                uid: post.id,
                date: new Date().toISOString(),
                tabId: tabData.tabId, 
                reactions: post.content.reactions,
                commentsCount: post.content.commentsCount,
                repostsCount: post.content.repostsCount,
            });
            
        }
        
    }

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
                        visit.timeCount += appParams.TIME_COUNT_INC_VALUE;
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

            if (currentTabId == tabData.tabId){
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

        if (currentTabId == tabData.tabId){
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

        case messageMeta.header.REQUEST_POST_VIEWS_DATA:{
            // acknowledge receipt
            sendResponse({
                status: "ACK"
            });
            
            // Saving the new notification setting state
            const postUid = message.data.postUid,
                  tabId = message.data.tabId;
            fetchPostViews(tabId, postUid);
            break;
        }

    }
}


async function fetchPostViews(tabId, postUid){

    const feedPostViews = await db.feedPostViews
                                  .where("uid")
                                  .equals(postUid)
                                  .toArray();

    const settings = await db.settings
                             .where("id")
                             .equals(1)
                             .first();

    chrome.tabs.sendMessage(tabId, {header: messageMeta.header.RESPONSE_POST_VIEWS_DATA, data: {lastDataResetDate: settings.lastDataResetDate, objects: feedPostViews}}, (response) => {
        console.log('post views data response sent', response);
    }); 

}