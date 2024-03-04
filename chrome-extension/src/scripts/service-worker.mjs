
import { db } from "../db";
import { 
    appParams, 
    messageParams,
    getTodayReminders,
} from "../popup/Local_library";
import Dexie from 'dexie';

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
    // console.log("POOOOOOOOOOOO : ", url, testTabBaseUrl(url));
    if (url && testTabBaseUrl(url)){

        async function injectDataExtractorParams(tabId){

            // Inject tab id
            chrome.tabs.sendMessage(tabId, {header: messageParams.responseHeaders.WEB_UI_APP_SETTINGS_DATA, data: {tabId: tabId}}, (response) => {
                console.log('tabId sent', response);
            }); 

            var settings = await db.settings
                                    .where('id')
                                    .equals(1)
                                    .first();

            if (settings.notifications){
                getTodayReminders(db, (reminders) => {
                    if (reminders.length != 0){
                        chrome.tabs.sendMessage(tabId, {header: messageParams.responseHeaders.WEB_UI_APP_SETTINGS_DATA, data: {reminders: reminders}}, (response) => {
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

// Script for processing linkedin data

function processTabData(tabData){

    // console.log("linkedInData : ", tabData);

    if (!tabData.extractedData){

        const visits = await db
                                .visits
                                .where('[url+tabId]')
                                .equals([tabData.tabUrl, tabData.tabId])
                                .toArray();
        
        var visit = visits.length ? visits[0] : null;
        if (visit){
            incVisitTimeCount(visit);
        }

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