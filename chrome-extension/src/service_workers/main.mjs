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
    getProfileDataFrom,
    getDiffProfileData,
    categoryVerbMap,
    isLinkedinFeed,
    isLinkedinProfilePage,
    isLinkedinFeedPostPage,
    isLinkedinProfileSectionDetailsPage,
    deactivateTodayReminders,
    popularityValue,
    getVisitsTotalTime,
    isUrlOfInterest,
    areProfileDataObjectsDifferent,
} from "../popup/Local_library";
import { v4 as uuidv4 } from 'uuid';
import { stringSimilarity } from "string-similarity-js";
import Dexie from 'dexie';
// import { DateTime as LuxonDateTime } from "luxon";

const app_logo_path = "/assets/app_logo.png";

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


/** this function listens to any tabs change
 * to check if the change is related to linkedin
 * and then injects the appropriate script into the concerned tab
 */

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    if (!tab.url){      
        return;
    }

    if (isUrlOfInterest(tab.url)){

        await refreshAppSettingsObject();

        var loadingTabs = ((await chrome.storage.session.get(["loadingTabs"])).loadingTabs || []);
        // console.log('**************** : ', loadingTabs, changeInfo.status);

        switch(changeInfo.status){

            case "loading":{

                async function isTabUrlAlreadyLoading(){

                    // checking that i'm not already processing this signal
                    if (loadingTabs.findIndex(t => t.id == tabId && t.url == tab.url) != -1){
                        return true;
                    }
                    loadingTabs.push({id: tabId, url: tab.url});
                    await chrome.storage.session.set({ loadingTabs: loadingTabs });
                    return false;

                }

                try{

                    Dexie.exists(appParams.appDbName).then(function (exists) {
                        if (exists) {

                            chrome.tabs.query({active: true, currentWindow: true}, async function(tabs){

                                if (!tabs[0]){
                                    return;
                                }

                                const result = await handleInterestingTab(tabId);

                                if (tabs[0].id == tabId){

                                    // if (changeInfo.url === undefined){ // in case of a tab's page reload
                                    //     // if (!(await isTabUrlAlreadyLoading())){
                                    //         injectScriptsInTab(tabId, tab.url);
                                    //     // }
                                    // }
                                    // else{

                                        // updating the badge text
                                        chrome.action.setBadgeText({text: result.badgeText});

                                        // conditionally injecting the script 
                                        if (result.inject/* && !(await isTabUrlAlreadyLoading())*/){
                                            injectScriptsInTab(tabId, tab.url);
                                        }

                                    // }

                                    // Updating the context menu items
                                    updateContextualMenuActions(tab.url);

                                }

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

                const index = loadingTabs.findIndex(t => t.id == tabId && t.url == tab.url);
                if (index != -1){
                    loadingTabs.splice(index, 1);
                    await chrome.storage.session.set({ loadingTabs: loadingTabs });
                }

                break;
            }

        }

    }
    else{

        chrome.tabs.query({active: true, currentWindow: true}, async function(tabs){
            console.log("################### : ", tabs, tabs[0]);
            if (tabs[0].id == tabId){
                chrome.action.setBadgeText({text: null});

                // var sessionItem = await chrome.storage.session.get(["myTabs"]);
                // if (sessionItem.myTabs 
                //         && Object.hasOwn(sessionItem.myTabs, tabId) 
                //         && sessionItem.myTabs[tabId].prevTabUrlInterestStatus){
                //     sessionItem.myTabs[tabId].prevTabUrlInterestStatus = false;
                //     chrome.storage.session.set({ myTabs: sessionItem.myTabs });
                // }

                // Updating the context menu items
                updateContextualMenuActions(tab.url);

            }
        });

    }

  }
);

function notifyUser(message, uuid = null){
    
    if (!uuid){
        uuid = uuidv4();
    }

    chrome.notifications.create(uuid, {
      title: 'Linkbeam',
      message: message,
      iconUrl: chrome.runtime.getURL(app_logo_path),
      type: 'basic',
    });

    return uuid;

}

async function getPostFromPostUrl(url){

    var postUid = url.slice(url.indexOf("urn:li:")).replaceAll("/", "");

    var post = await db.feedPostViews
                       .where({uid: postUid})
                       .first();

    if (!post){
        return null;
    }

    post = await db.feedPosts
                   .where({id: post.feedPostId})
                   .first();

    // post = post || {};

    post.reminder = await db.reminders
                             .where({objectId: post.id})
                             .first();

    post.viewsCount = 0;

    await db.feedPostViews
             .where({feedPostId: post.id})
             .each(postView => {
                post.viewsCount++;
             });

    return post;

}

/** This function injects the content scripts into the page
 * along with some setup data in order to harverst the necessary data
 * or displays visuals for the user to interact with
 */

function injectScriptsInTab(tabId, url){

    // const linkedInPattern = /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)/gm;

    // If the user is browsing linkedin's feed
    const dataExtractorPath = "./assets/main_content_script.js";

    chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: [dataExtractorPath],
        }, 
        () => {
            injectDataExtractorParams(tabId, url);
        }
    );

};

async function injectDataExtractorParams(tabId, url){

    // Inject tab id
    const settings = await getAppSettingsObject();

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
            postHighlightColor: settings.postHighlightColor,
            immersiveMode: settings.immersiveMode,
            browseFeedForMePostCount: settings.browseFeedForMePostCount,
        },
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
        getTodayReminders(db, async (reminders) => {
            if (reminders.length){

                // making sure not to bother the user with to much reminder notification
                var sessionItem = await chrome.storage.session.get(["reminderSessionData"]);
                const today = new Date().toISOString().split("T")[0];
                if (!sessionItem.reminderSessionData 
                        || (sessionItem.reminderSessionData 
                                && sessionItem.reminderSessionData.date != today)){
                    sessionItem.reminderSessionData = { date: today, alertDisplayCount: 1, reminders: reminders};
                }
                else{
                    if (sessionItem.reminderSessionData 
                            && sessionItem.reminderSessionData.date == today){

                        if (JSON.stringify(reminders.map(r => r.id).toSorted()) != JSON.stringify(sessionItem.reminderSessionData.reminders.map(r => r.id).toSorted())){
                            sessionItem.reminderSessionData.alertDisplayCount = 1;
                            sessionItem.reminderSessionData.reminders = reminders;
                        }
                        else{
                            if (sessionItem.reminderSessionData.alertDisplayCount == appParams.REMINDER_ALERT_DISPLAY_LIMIT){
                                return;
                            }
                            sessionItem.reminderSessionData.alertDisplayCount++;
                        }
                    }
                }
                chrome.storage.session.set({ reminderSessionData: sessionItem.reminderSessionData });

                // if everything's ok, then proceed to notify the user
                const uuid = uuidv4();
                chrome.notifications.create(uuid, {
                    title: 'Linkbeam',
                    message: `${reminders.length} waiting reminder${reminders.length <= 1 ? "" : "s"}`,
                    iconUrl: chrome.runtime.getURL(app_logo_path),
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

            }
        });
    }     

};

async function handleInterestingTab(tabId){

    var sessionItem = await chrome.storage.session.get(["myTabs"]),
        result = { badgeText: "!", inject: true };

    if (!sessionItem.myTabs){

        sessionItem.myTabs = {};  
        sessionItem.myTabs[tabId] = {badgeText: result.badgeText/*, prevTabUrlInterestStatus: true*/};

    }
    else{

        if (Object.hasOwn(sessionItem.myTabs, tabId)){

            result.badgeText = sessionItem.myTabs[tabId].badgeText;
            // if (sessionItem.myTabs[tabId].visits
            //         && sessionItem.myTabs[tabId].prevTabUrlInterestStatus){
            //     result.inject = false;
            // }

        }
        else{
            sessionItem.myTabs[tabId] = {badgeText: result.badgeText/*, prevTabUrlInterestStatus: true*/};
        }

    }

    chrome.storage.session.set({ myTabs: sessionItem.myTabs });

    return result;

}

function immersiveModeMenuAction(action){

    switch(action){
        case "add":{
            chrome.contextMenus.create({
                id: appParams.immersiveModeMenuActionId,
                title: "Toggle immersive mode",
                contexts: ["all"]
            });
            break;
        }
        case "remove":{
            chrome.contextMenus.remove(appParams.immersiveModeMenuActionId, () => {});
            break;
        }
    }

}

function contextMenuItem(menuItem, action){

    function contextMenuItemLabel(menuItemId){

        switch(menuItemId){
            case appParams.immersiveModeMenuActionId: {
                return "Toggle immersive mode";
                // break;
            }
            case appParams.browseFeedForMeMenuActionId: {
                return "Browse feed for me";
                // break;
            }
        }

    }


    try{

        switch(action){
            case "on":{
                chrome.contextMenus.create({
                    id: appParams[`${menuItem}MenuActionId`],
                    title: contextMenuItemLabel(appParams[`${menuItem}MenuActionId`]),
                    contexts: ["all"]
                });
                break;
            }
            case "off":{
                chrome.contextMenus.remove(appParams[`${menuItem}MenuActionId`], () => {});
                break;
            }
        }

    }
    catch(error){
        console.log("An error occured when updating the contextual menu items", error);
    }

}

function updateContextualMenuActions(url){

    if (isUrlOfInterest(url)){
        // immersive mode menu action
        contextMenuItem("immersiveMode", "on");
        if (isLinkedinFeed(url)){
            // browse for me menu action
            contextMenuItem("browseFeedForMe", "off");
        }
        return;
    }
    
    // immersive mode menu action
    contextMenuItem("immersiveMode", "off");
    // browse for me menu action
    contextMenuItem("browseFeedForMe", "on");

}

// on click of the context menu items
chrome.contextMenus.onClicked.addListener((clickData, tab) => {

    switch(clickData.menuItemId){
        case appParams.immersiveModeMenuActionId: {
            chrome.tabs.sendMessage(tab.id, {header: "CONTEXT_MENU_ITEM_CLICKED", data: {menuItemId: appParams.immersiveModeMenuActionId}}, (response) => {
                console.log('Context menu item clicked signal sent', response);
            }); 
            break;
        }
        case appParams.browseFeedForMeMenuActionId: {
            // Opening a new tab in a new window
            chrome.windows.create({
                // focused: false,
                url: `${appParams.LINKEDIN_FEED_URL()}?automated=true`,
            }, () => {
                // notify the user of the start of the automatic feed scrolling session
                notifyUser(`Starting an automatic feed session !`);
            });
            break;
        }
    }
})

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

chrome.tabs.onActivated.addListener(async function(activeInfo) {

    // console.log(activeInfo.tabId);
    // windowId = info.windowId

    console.log("changing tab : ", activeInfo.tabId);

    chrome.tabs.query({}, function(tabs){

        // notifying to all linkedin tabs the change of the active tab
        tabs.forEach(tab => {
            if (tab.url && isUrlOfInterest(tab.url)){
                chrome.tabs.sendMessage(tab.id, {header: messageMeta.header.CS_SETUP_DATA, data: {tabId: activeInfo.tabId}}, (response) => {
                    console.log('activated tab id sent', response);
                }); 
            }
        });
    });


    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){

        var url = tabs[0].url;

        if (url && isUrlOfInterest(url)){

            Dexie.exists(appParams.appDbName).then(async function(exists) {
                if (exists) {
                    var result = await handleInterestingTab(activeInfo.tabId);

                    // updating the badge text
                    chrome.action.setBadgeText({text: result.badgeText});

                    // conditionally injecting the script 
                    if (result.inject){
                        console.log("<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>> : ", url);
                        injectScriptsInTab(activeInfo.tabId, url);
                    }
                }
            });

        }
        else{
            chrome.action.setBadgeText({text: null});
        }

        // Updating the context menu items
        updateContextualMenuActions(url);

    });

});

// Script for processing linkedin data

function processTabData(tabData){
    
    console.log("linkedInData : ", tabData);

    if (tabData.extractedData){
        if (isLinkedinFeed(tabData.tabUrl)){ // feed data
            recordFeedVisit(tabData);
        }
        else if (isLinkedinProfilePage(tabData.tabUrl)){ // profile data
            if (isLinkedinProfileSectionDetailsPage(tabData.tabUrl)){
                enrichProfileSectionData(tabData);
            }
            else{
                recordProfileVisit(tabData);
            }
        }
    }

}

async function enrichProfileSectionData(tabData){

    tabData.tabUrl = isLinkedinProfilePage(tabData.tabUrl)[0];

    var profileData = await getProfileDataFrom(db, tabData.tabUrl);

    if (!profileData || (profileData && JSON.stringify(profileData[tabData.extractedData.label]) == JSON.stringify(tabData.extractedData.list))){
        return;
    }

    // updating the profiledata object in the session myTabs property
    var sessionItem = await chrome.storage.session.get(["myTabs"]);
    if (sessionItem.myTabs){

        for (const tabId in sessionItem.myTabs){
            if (sessionItem.myTabs[tabId].visits){
                var index = 0;
                for (const visit of sessionItem.myTabs[tabId].visits){
                    if (visit.url == tabData.tabUrl){
                        sessionItem.myTabs[tabId].visits[index].profileData[tabData.extractedData.label] = tabData.extractedData.list;
                        // signaling the related tabs of the change
                        chrome.tabs.sendMessage(parseInt(tabId), {header: "PROFILE_ENRICHED_SECTION_DATA", data: {sectionName: tabData.extractedData.label, sectionData: tabData.extractedData.list}}, (response) => {
                            console.log('profile enriched section data sent', response);
                        }); 
                    }
                    index++;
                }

            }
        }

    }
    chrome.storage.session.set({ myTabs: sessionItem.myTabs });

    // console.log("AAAAAAAAAAAAAAAAAAAAAAA : ", sessionItem.myTabs);

    // updating the last view object in the browser indexeddb
    var lastView = await db.visits.where("url").anyOf([tabData.tabUrl, encodeURI(tabData.tabUrl), decodeURI(tabData.tabUrl)]).last();
    lastView.profileData[tabData.extractedData.label] = tabData.extractedData.list;

    await db.visits.update(lastView.id, lastView);

    // notify the user of the update
    notifyUser(`Profile ${tabData.extractedData.label} data updated !`);

}

async function recordFeedVisit(tabData){

    if (await isPostToBeHidden(tabData.extractedData.id)){

        /*chrome.tabs.sendMessage(message.data.tabId, {header: "FEED_POSTS_HIDE_STATUS_RESPONSE", data: [tabData.extractedData.id]}, (response) => {
            console.log('Individual feed post hide status response sent', response, tabData.extractedData.id);
        });*/

        return;
    }

    const dateTime = new Date().toISOString();

    var sessionItem = await chrome.storage.session.get(["myTabs"]);
    sessionItem.myTabs[tabData.tabId].visits = sessionItem.myTabs[tabData.tabId].visits || [];
    const visitIndex = sessionItem.myTabs[tabData.tabId].visits.findIndex(v => v.url == tabData.tabUrl);
    var visitId = null;

    if (visitIndex == -1){
        visitId = await addFreshFeedVisit({ automated: tabData.extractedData.fromAutomatedVisit });
        sessionItem.myTabs[tabData.tabId].visits.push({id: visitId, url: tabData.tabUrl});

        chrome.tabs.sendMessage(tabData.tabId, {
                header: messageMeta.header.CS_SETUP_DATA, 
                data: {visitId: visitId},
            }, 
            (response) => {
                console.log('visitId sent', response, visitId);
            }
        );

    }
    else{
        visitId = sessionItem.myTabs[tabData.tabId].visits[visitIndex].id;
    }

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
            innerContentHtml: post.content.innerHtml.replaceAll("\n", ""),
            text: post.content.text,
            media: post.content.media 
                    ? (post.content.media.length
                        ? post.content.media
                        : null) 
                    : null,
            estimatedDate: post.content.estimatedDate,
            references: post.content.references
                            ? (post.content.references.length
                                    ? post.content.references
                                    : null)
                            : null,
        };

        if (post.content.subPost){

            var subPost = {
                uid: post.content.subPost.uid,
                author: post.content.subPost.author,
                innerContentHtml: post.content.subPost.innerHtml.replaceAll("\n", ""),
                text: post.content.subPost.text,
                media: post.content.subPost.media
                        ? (post.content.subPost.media.length
                            ? post.content.subPost.media
                            : null)
                        : null,
                estimatedDate: post.content.subPost.estimatedDate,
                references: post.content.subPost.references
                                ? (post.content.subPost.references.length
                                        ? post.content.subPost.references
                                        : null)
                                : null,
            }

            var dbSubPost = await db.feedPosts
                                   .filter(entry => areFeedPostsTheSame(entry, subPost))
                                   .first();

            if (dbSubPost){

                await db.feedPosts
                        .update(dbSubPost.id, subPost);

            }
            else{

                await db.feedPosts
                        .add(subPost)
                        .then((id) => {
                            subPost.id = id;
                            dbSubPost = subPost;
                        });

            }

            newFeedPost["linkedPostId"] = dbSubPost.id;
            
        }

        function areFeedPostsTheSame(entry, newFeedPost){
            return (newFeedPost.uid && entry.uid && newFeedPost.uid == entry.uid)
                                                        || ((!newFeedPost.uid || !entry.uid) 
                                                                && entry.author.url == newFeedPost.author.url
                                                                && entry.text.replaceAll("\n", "").replaceAll(/\s/g,"").slice(0, 20) == newFeedPost.text.replaceAll("\n", "").replaceAll(/\s/g,"").slice(0, 20)
                                                                    /*(() => {
                                                                        const entryText = entry.text.replaceAll("\n", "").replaceAll(/\s/g,""),
                                                                              postText = newFeedPost.text.replaceAll("\n", "").replaceAll(/\s/g,"");
                                                                        const minLength = Math.min(entryText.length, postText.length);
                                                                        return entryText.slice(0, minLength) == postText.slice(0, 20);
                                                                    })() == true*/);
        }

        var dbFeedPost = await db.feedPosts
                                   .filter(entry => areFeedPostsTheSame(entry, newFeedPost))
                                   .first();

        if (dbFeedPost){

            newFeedPost.uid = dbFeedPost.uid || newFeedPost.uid; // avoid overwritting a previous valid uid
            await db.feedPosts
                    .update(dbFeedPost.id, newFeedPost);

        }
        else{

            await db.feedPosts
                    .add(newFeedPost).then((id) => {
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

            sessionItem.myTabs[tabData.tabId].badgeText = sessionItem.myTabs[tabData.tabId].badgeText == "!" ? "1" : (parseInt(sessionItem.myTabs[tabData.tabId].badgeText) + 1).toString();
            
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
        post.visitId = visitId;
        post.bookmarked = (await db.bookmarks.where("url").anyOf([post.content.author.url, encodeURI(post.content.author.url), decodeURI(post.content.author.url)]).first())
                            || (post.initiator 
                                    && post.initiator.url 
                                    && await db.bookmarks.where("url").anyOf([post.initiator.url, encodeURI(post.initiator.url), decodeURI(post.initiator.url)]).first())
                            || (post.content.subPost
                                    && await db.bookmarks.where("url").anyOf([post.content.subPost.author.url, encodeURI(post.content.subPost.author.url), decodeURI(post.content.subPost.author.url)]).first());

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

        chrome.storage.session.set({ myTabs: sessionItem.myTabs }).then(() => {
            chrome.action.setBadgeText({text: sessionItem.myTabs[tabData.tabId].badgeText});
            // console.log("Value was set");
        });

        // update the rankedPostsByPopularity session variable
        sessionItem = await chrome.storage.session.get(["rankedPostsByPopularity"]);
        sessionItem.rankedPostsByPopularity = sessionItem.rankedPostsByPopularity || await setPostsRankingInSession();

        const index = sessionItem.rankedPostsByPopularity.findIndex(p => p.id == dbFeedPost.id);
        if (index != -1){
            post.rank = {
                index1: index + 1, 
                count: sessionItem.rankedPostsByPopularity.length,
                topValue: sessionItem.rankedPostsByPopularity[0].popularity,
            };
        }
        else{
            sessionItem.rankedPostsByPopularity.push({id: dbFeedPost.id, popularity: popularity.value});
            sessionItem.rankedPostsByPopularity.sort(function(a, b){ return b.popularity - a.popularity; });
            post.rank = {
                index1: sessionItem.rankedPostsByPopularity.findIndex(p => p.id == dbFeedPost.id) + 1,
                count: sessionItem.rankedPostsByPopularity.length,
                topValue: sessionItem.rankedPostsByPopularity[0].popularity,
            };
            await chrome.storage.session.set({ rankedPostsByPopularity: sessionItem.rankedPostsByPopularity }).then(function(){
                // console.log("--- rankedPostsByPopularity set ", sessionItem.rankedPostsByPopularity);
            });
        }

        chrome.tabs.sendMessage(tabData.tabId, {header: messageMeta.header.CRUD_OBJECT_RESPONSE, data: {action: "read", objectStoreName: "feedPosts", objects: [post]}}, (response) => {
            console.log('post data response sent', [post], response);
        });  

    });

    async function addFreshFeedVisit(params){

        const visit = {
            date: dateTime,
            url: appParams.LINKEDIN_FEED_URL(),
            ...(params.automated ? { automated: true } : null),
        };

        var visitId = null;
        await db.visits.add(visit).then(id => {
            visitId = id;
        });
        return visitId;

    }

}

async function recordProfileVisit(tabData){

    const dateTime = new Date().toISOString(),
          badgeText = "1";
    var profileData = null,
        visitId = null;
    var sessionItem = await chrome.storage.session.get(["myTabs"]);

    if (sessionItem.myTabs[tabData.tabId].badgeText != badgeText){
        sessionItem.myTabs[tabData.tabId].badgeText = badgeText;
    }

    if (!sessionItem.myTabs[tabData.tabId].visits){
        visitId = await processPrimeVisit();
        sessionItem.myTabs[tabData.tabId].visits = [{
            id: visitId, 
            url: tabData.tabUrl, 
            profileData: profileData,
        }];
    }
    else{
        const index = sessionItem.myTabs[tabData.tabId].visits.findIndex(v => v.url == tabData.tabUrl);
        if (index == -1){
            visitId = await processPrimeVisit();
            sessionItem.myTabs[tabData.tabId].visits.push({
                id: visitId, 
                url: tabData.tabUrl, 
                profileData: profileData,
            });
        }
        else{

            profileData = sessionItem.myTabs[tabData.tabId].visits[index].profileData;

            if (areProfileDataObjectsDifferent.wholeObjects(profileData, tabData.extractedData)){

                // are there meaningful changes to be taken into account
                var diffProfileData = getDiffProfileData(profileData, tabData.extractedData);
                //if yes, integrate these meaningful changes
                for (const property in diffProfileData) { profileData[property] = diffProfileData[property] || profileData[property] }
                    
                const firstVisit = (await db.visits.where({url: tabData.tabUrl}).toArray()).length == 1;

                // update the variable in the session
                if (firstVisit) { sessionItem.myTabs[tabData.tabId].visits[index].profileData = profileData; }

                await db.visits
                        .where({id: sessionItem.myTabs[tabData.tabId].visits[index].id})
                        .modify(visit => {
                            visit.profileData = firstVisit ? profileData : diffProfileData;
                        });

            }

        }
    }

    // Only send the visit id for the first recording, no need to do that for the next ones
    if (visitId){

        // checking first that the user is on the linkedin tab before setting the badge text
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            if (tabs[0].id == tabData.tabId){
                chrome.action.setBadgeText({text: badgeText});
            }
        });

        chrome.tabs.sendMessage(tabData.tabId, {
                header: messageMeta.header.CS_SETUP_DATA, 
                data: {visitId: visitId},
            }, 
            (response) => {
                console.log('visitId sent', response, visitId);
            }
        );
    }

    await checkDataTabOpening();

    chrome.storage.session.set({ myTabs: sessionItem.myTabs });

    chrome.tabs.sendMessage(tabData.tabId, {header: "SAVED_PROFILE_OBJECT", data: profileData}, (response) => {
        console.log('profile data response sent', response, profileData);
    }); 

    async function checkDataTabOpening(){

        console.log("CCCCCCCCCCCCCCCC : ", sessionItem.myTabs);

        const index = sessionItem.myTabs[tabData.tabId].visits.findIndex(v => v.url == tabData.tabUrl);

        if (!Object.hasOwn(sessionItem.myTabs[tabData.tabId].visits[index], "tabOpen")
                && (await getAppSettingsObject()).autoTabOpening
                && sessionItem.myTabs[tabData.tabId].visits[index].profileData.experience){

            // Opening a new tab
            chrome.tabs.create({
              active: true,
              url:  `/index.html?view=Profile&data=${tabData.tabUrl}`,
            }, null);

            sessionItem.myTabs[tabData.tabId].visits[index].tabOpen = true;

        }

    }

    async function processPrimeVisit(){

        const profileVisits = await db.visits
                                      .where({url: tabData.tabUrl})
                                      .toArray();

        var visit = {
                date: dateTime,
                url: tabData.tabUrl,
                timeCount: 1, 
            };

        if (profileVisits.length){
            profileData = await getProfileDataFrom(db, tabData.tabUrl);
            visit.profileData = getDiffProfileData(profileData, tabData.extractedData);
        }
        else{
            profileData = tabData.extractedData;
            visit.profileData = profileData;
        }

        var visitId = null;
        await db.visits.add(visit).then(id => {
            visitId = id;
        });

        return visitId;

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

    // await testUpDb();

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

        case "NOTIFY_USER":{
            // acknowledge receipt
            sendResponse({
                status: "ACK"
            });
            
            if (message.data == "keywords"){
                notifyUser("Keyword detected !");
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

            // checking if it needs to warning the user about any threshold limit crossing
            checkDateTimeLeft()

            break;
        }

        case "TAB_IDLE_STATUS":{
            // acknowledge receipt
            sendResponse({
                status: "ACK"
            });

            notifyUser(message.data.idleStatus ? "Going inactive" : "Resuming activity");

            break;
        }

        case "FEED_POSTS_HIDE_STATUS":{
            // acknowledge receipt
            sendResponse({
                status: "ACK"
            });
            
            var results = {};
            for (const postUid of message.data.objects){ results[postUid] = (await isPostToBeHidden(postUid)); }

            chrome.tabs.sendMessage(message.data.tabId, {header: "FEED_POSTS_HIDE_STATUS_RESPONSE", data: results}, (response) => {
                console.log('Feed posts hide status response sent', response, results);
            });

            break;
        }

        case "PROFILE_VISIT_PING":{
            // acknowledge receipt
            sendResponse({
                status: "ACK"
            });

            incProfileVisitTimeCount(message.data);

            break;
        }

        case "AUTO_FEED_VISIT_ENDED":{
            // acknowledge receipt
            sendResponse({
                status: "ACK"
            });

            const sessionItem = await chrome.storage.session.get(["myTabs"]);
            const visitIndex = sessionItem.myTabs[message.data.tabId].visits.findIndex(v => v.url == message.data.tabUrl);
            const visitId = sessionItem.myTabs[message.data.tabId].visits[visitIndex].id;

            chrome.tabs.create(
                { url: `/index.html?view=${appParams.COMPONENT_CONTEXT_NAMES.FEED_VISIT.replaceAll(" ", "")}&visitId=${visitId}` }, 
                () => {

                    chrome.tabs.remove(
                        [message.data.tabId], 
                        () => {
                            notifyUser("Automatic feed visit ended");
                        }
                    );
                }
            );

            break;
        }

        case "PREVIOUS_RELATED_POSTS":{

            const posts = await getPreviousRelatedPosts(message.data.payload);

            chrome.tabs.sendMessage(message.data.tabId, {header: "PREVIOUS_RELATED_POSTS_LIST", data: {objects: posts, viewIndex: message.data.payload.viewIndex}}, (response) => {
                console.log('Previous related posts response sent', response, posts);
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

async function incProfileVisitTimeCount(tabData){

    var sessionItem = await chrome.storage.session.get(["myTabs"]);
            
    if (!sessionItem.myTabs[tabData.tabId].visits){
        return;
    }
    
    const index = sessionItem.myTabs[tabData.tabId].visits.findIndex(v => v.url == tabData.tabUrl);
    if (index == -1){
        return;
    }

    await db.visits
            .where({id: sessionItem.myTabs[tabData.tabId].visits[index].id})
            .modify(visit => {
                visit.timeCount += (appParams.TIMER_VALUE_2 / 1000);
            });

    checkDateTimeLeft();

}

async function refreshAppSettingsObject(){

    var sessionItem = await chrome.storage.session.get(["appSettings"]);
    sessionItem.appSettings = await db.settings.where({id: 1}).first();
    await chrome.storage.session.set({ appSettings: sessionItem.appSettings });
    // console.log(await db.settings.where({id: 1}).first(), (await chrome.storage.session.get(["appSettings"])).appSettings);

}

async function getAppSettingsObject(){

    var sessionItem = await chrome.storage.session.get(["appSettings"]);
    if (!sessionItem.appSettings){
        sessionItem.appSettings = await db.settings.where({id: 1}).first();
        await chrome.storage.session.set({ appSettings: sessionItem.appSettings });
    }

    return sessionItem.appSettings;

}

async function isPostToBeHidden(postUid){

    const settings = await getAppSettingsObject();

    if (settings.hidePostViewCount == "Never"){
        return false;
    }

    const viewCount = Number(settings.hidePostViewCount.replace(" views", ""));
    return (await db.feedPostViews.where({uid: postUid}).toArray()).length > viewCount;

}

async function checkDateTimeLeft(){

    var sessionItem = await chrome.storage.session.get(["dateTimeData"]);
    if (!sessionItem.dateTimeData){
        await chrome.storage.session.set({ dateTimeData: { lastUpdate: new Date().toISOString() } });
        sessionItem = await chrome.storage.session.get(["dateTimeData"]); 
    }

    if ((Math.abs(new Date() - new Date(sessionItem.dateTimeData.lastUpdate)) / (1000 * 60)) < 5 /* mins */){
        return;
    }

    // update this data before proceeding
    await chrome.storage.session.set({ dateTimeData: { lastUpdate: new Date().toISOString() } });

    const settings = await getAppSettingsObject();

    if (settings.maxTimeAlarm == "Never"){
      return;
    }

    const maxTimeValue = settings.maxTimeAlarm == "1 hour" ? 60 : Number(settings.maxTimeAlarm.slice(0, 2));

    const visits = await db.visits
                           .where("date")
                           .startsWith(new Date().toISOString().split("T")[0])
                           .toArray();

    var totalTime = 0; // in minutes
    for (const visit of visits){
      totalTime += Object.hasOwn(visit, "profileData") ? (visit.timeCount / 60) : getVisitsTotalTime(await db.feedPostViews.where({visitId: visit.id}).toArray());
    }

    if (totalTime >= (maxTimeValue * (3/4))){
        notifyUser(`Time limit${totalTime >= maxTimeValue ? "" : " almost"} reached`);
    }

}

async function getPreviousRelatedPosts(payload){

    var posts = [];
    const limit = 5;

    var postUrl = null;

    if (Object.hasOwn(payload, "url")){

        const profileUrl = payload.url;

        // feed posts, this user authored
        const feedPosts = await db.feedPosts
                                  .filter(post => post.author.url == profileUrl && ((post.uid && (post.uid != payload.uid)) || (!post.uid && true)))
                                  .offset(payload.offset)
                                  .limit(limit)
                                  .toArray();

        for (const feedPost of feedPosts){

            if (feedPost.uid){
                postUrl = `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${feedPost.uid}`;
            }
            else{
                const view = (await db.feedPostViews.where({feedPostId: feedPost.id}).last());
                if (view.uid == payload.uid){
                    continue;
                }
                postUrl = `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${view.uid}`;
            }

            posts.push({
                text: feedPost.innerContentHtml,
                url: postUrl,
                date: feedPost.estimatedDate,
                media: feedPost.media,
            });
        }

        // feed post views, this given user triggered the viewing
        const feedPostViews = await db.feedPostViews
                                      .filter(view => view.initiator && view.initiator.url == profileUrl && view.uid != payload.uid)
                                      .offset(payload.offset)
                                      .limit(limit)
                                      .toArray();
    
        var uids = [];
        for (const feedPostView of feedPostViews){

            if (uids.indexOf(feedPostView.uid) != -1){
                continue;
            }

            const feedPost = (await db.feedPosts.where({id: feedPostView.feedPostId}).first());
            posts.push({
                text: feedPost.innerContentHtml,
                url: `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${feedPostView.uid}`,
                date: feedPostView.date,
                media: feedPost.media,
            });
            uids.push(feedPostView.uid);
        }

    }

    if (Object.hasOwn(payload, "text")){

        const feedPosts = await db.feedPosts
                                  .filter(post => post.innerContentHtml && (stringSimilarity(payload.text, post.text) > .9) && ((post.uid && post.uid != payload.uid) || (!post.uid && true)))
                                  .offset(payload.offset)
                                  .limit(limit)
                                  .toArray();

        for (const feedPost of feedPosts){

            if (feedPost.uid){
                postUrl = `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${feedPost.uid}`;
            }
            else{
                const view = (await db.feedPostViews.where({feedPostId: feedPost.id}).last());
                if (view.uid == payload.uid){
                    continue;
                }
                postUrl = `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${view.uid}`;
            }

            posts.push({
                text: feedPost.innerContentHtml,
                url: postUrl,
                date: feedPost.estimatedDate,
                media: feedPost.media,
                profile: feedPost.author,
            });
        }

    }

    return posts;

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

        // const feedPostView = await db.feedPostViews
        //                              .where({uid: postUid})
        //                              .first();

        // if (!feedPostView.category){
        //     reminder.objectId = feedPostView.uid;
        // }
        // else{
        //     if (feedPostView.category == "suggestions"){
        //         reminder.objectId = feedPostView.uid;
        //     }
        //     else{
        //         const feedPost = await db.feedPosts
        //                                  .where({id: feedPostView.feedPostId})
        //                                  .first();
        //         reminder.objectId = feedPost.uid || feedPostView.uid;
        //     }
        // }

        reminder.objectId = (await db.feedPostViews
                                     .where({uid: reminder.objectId})
                                     .first()).feedPostId;
        
        await db.reminders
                .add(reminder)
                .then(function(id){
                    reminder.id = id;
                });

        reminder.postUid = postUid;
        return reminder;

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

        const feedPostId = (await db.feedPostViews
                                    .where({uid: props.uid})
                                    .first()).feedPostId;

        const feedPostViews = await db.feedPostViews
                                      .where({feedPostId: feedPostId})
                                      .toArray();

        return {views: feedPostViews};

    }
    catch(error){
        console.error("Error : ", error);
        return null;
    }

}

// async function testUpDb(){

//     await db.settings.where({id: 1}).modify(settings => {
//         settings.hidePostViewCount = "Never";
//     });

//     // await db.feedPosts.filter(post => true).modify(post => {
//     //     if (post.date){
//     //         post.estimatedDate = post.date;
//     //         delete post.date;
//     //     }
//     // });

// }