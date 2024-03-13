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
} from "../popup/Local_library";
import Dexie from 'dexie';

let currentTabId = null;

// Extension installation script

chrome.runtime.onInstalled.addListener(details => {

    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {

        // checking if a previous instance already exists before showing the setup page
        Dexie.exists(appParams.appDbName).then(function (exists) {
            if (!exists) {
                // on install, open a web page for information
                chrome.tabs.create({ url: "install.html" });
            }
        });

        // Setting the process when uninstalling the extension
        chrome.runtime.setUninstallURL(null, () => {
            
            // Removing local storage data
            localStorage.removeItem("currentPageTitle");

            // deleting the whole database
            db.delete().then(() => {
                console.log("Database successfully deleted");
            }).catch((err) => {
                console.error("Could not delete database");
            }).finally(() => {
                // Do what should be done next...
            });
            
        });
    }

    if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {

    }

});


// Script for listening to all tab updates

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    // check first if the app has been correctly set up before proceeding
    Dexie.exists(appParams.appDbName).then(function (exists) {
        if (exists) {
            processTabEvent(tabId, changeInfo, tab);
        }
    });

  }
);

// Script for processing tab event

function processTabEvent(tabId, changeInfo, tab){

    // const linkedInPattern = /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)/gm;
    checkCurrentTab(tab, changeInfo);

};

function checkCurrentTab(tab, changeInfo){

    var url = (changeInfo ? changeInfo.url : tab.url);
    if (url && testTabBaseUrl(url)){

        async function injectDataExtractorParams(tabId){

            // Inject tab id
            chrome.tabs.sendMessage(tabId, {header: messageMeta.header.CS_SETUP_DATA, data: {tabId: tabId}}, (response) => {
                console.log('tabId sent', response);
            }); 

            var settings = await db
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
        var dataExtractorPath = (url.indexOf("/feed") != -1) ? "./assets/feed_data_extractor.js" : "./assets/profile_data_extractor.js";
        chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: [dataExtractorPath],
            }, 
            () => {
                injectDataExtractorParams(tab.id);
            }
        );

    }

}

chrome.tabs.onActivated.addListener(function(activeInfo) {

    // console.log(activeInfo.tabId);
    currentTabId = activeInfo.tabId;

    // check if this tab has already been visited 

    (async () => {
        const visit = await db.visits
                        .where("tabId")
                        .equals(activeInfo.tabId)
                        .first();

        if (visit){
            if (visit.url.indexOf("/feed") != -1){

                var badgeText = 0;
                for (var metric in visit.itemsMetrics){
                    badgeText += visit.itemsMetrics[metric];
                }

                if (currentTabId == activeInfo.tabId){
                    chrome.action.setBadgeText({text: badgeText.toString()});
                }

            }
            else{
                if (currentTabId == activeInfo.tabId){
                    chrome.action.setBadgeText({text: "1"});
                }
            }
        }
        else{
            if (currentTabId == activeInfo.tabId){
                chrome.action.setBadgeText({text: null});
            }
        }

    })();

});

// Script for processing linkedin data

async function processTabData(tabData){
    
    // console.log("linkedInData : ", tabData);
    if (currentTabId != tabData.tabId){
        return;
    }

    if (!tabData.extractedData){

        await db
                .visits
                .where({url: tabData.tabUrl, tabId: tabData.tabId})
                .modify(visit => {
                    visit.timeCount += appParams.TIME_COUNT_INC_VALUE;
                });

    }
    else{
        if (tabData.tabUrl.indexOf("/feed") != -1){ // feed data
            recordFeedVisit(tabData);
        }
        else{ // profile data
            recordProfileVisit(tabData);
        }
    }

    // checking that the setting allows the injection
    // getSettingsData(["notifications", "productID"], (results) => {
    //     var notificationSetting = results[0];

    //     if (notificationSetting){

    //         injectWebApp(results[1]);

    //     }
    // });
}


async function recordFeedVisit(tabData){

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
                });

    }
    else{
        const dateTime = new Date().toISOString();

        await db.visits.add({
            date: dateTime,
            url: tabData.tabUrl,
            timeCount: 1, 
            tabId: tabData.tabId,
            itemsMetrics: tabData.extractedData.metrics,
        });

        var badgeText = 0;
        for (var metric in tabData.extractedData.metrics){
            badgeText += tabData.extractedData.metrics[metric];
        }

        if (currentTabId == tabData.tabId){
            chrome.action.setBadgeText({text: badgeText.toString()});
        }
    }

}

async function recordProfileVisit(tabData){



    const openNewTab = (profile) => {
        // open new tab
        if (settings.autoTabOpening){

            chrome.tabs.create({
              active: true,
              url:  `/index.html?view=Profile&data=${profile.url}`,
            }, null);

        }
    }

    async function checkKeywordOccurence(profile, tabId){

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

    const profile = await db
                        .profiles
                        .where('url')
                        .equals(tabData.tabUrl)
                        .first();

    if (profile){
        await db.profiles.update(profile.id, tabData.extractedData);

        const visit = await db
                            .visits
                            .where({url:tabData.tabUrl, tabId:tabData.tabId})
                            .first();

       if (visit){
            // Incrementing the time count
            await db
                    .visits
                    .where({url: tabData.tabUrl, tabId: tabData.tabId})
                    .modify(visit => {
                        visit.timeCount += appParams.TIME_COUNT_INC_VALUE;
                    });

        }
        else{

            var settings = await db
                               .settings
                               .where('id')
                               .equals(1)
                               .first();

            // checking the occurence of any predefined keyword in the profile
            checkKeywordOccurence(tabData.extractedData, tabData.tabId);

            await db.visits.add({
                date: new Date().toISOString(),
                url: tabData.tabUrl,
                timeCount: 1, 
                tabId: tabData.tabId,
            });

            if (currentTabId == tabData.tabId){
                chrome.action.setBadgeText({text: "1"});
            }

            openNewTab(tabData.extractedData);
        }
    }
    else{

        var settings = await db
                               .settings
                               .where('id')
                               .equals(1)
                               .first();

        await db.profiles.add(tabData.extractedData);

        // checking the occurence of any predefined keyword in the profile
        checkKeywordOccurence(tabData.extractedData, tabData.tabId);

        var visit = {
            date: new Date().toISOString(),
            url: tabData.tabUrl,
            timeCount: 1, 
            tabId: tabData.tabId,
        };

        await db.visits.add(visit);

        if (currentTabId == tabData.tabId){
            chrome.action.setBadgeText({text: "1"});
        }

        openNewTab(tabData.extractedData);

    }

}

// Script for listening to all events related to the content scripts

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // acknowledge receipt
    sendResponse({
        status: "ACK"
    });

    processMessageEvent(message, sender, sendResponse);

});


// Script handling the message execution

function processMessageEvent(message, sender, sendResponse){

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
            processTabData(tabData);
            break;
        }

    }
}