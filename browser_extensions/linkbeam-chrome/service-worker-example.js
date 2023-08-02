// Script of extension database creation

let db = null;
const searchObjectStoreName = "searches";
const keywordObjectStoreName = "keywords";
const settingObjectStoreName = "settings";
const appParams = {appVersion: "0.1.0", keywordCountLimit: 5, searchPageLimit: 2};
const settingData = [{
    id: 1,
    notifications: true,
    lastDataResetDate: new Date().toISOString(),
}];

function createDatabase(context) {

    const dbName = "LinkBeamDB"
    const request = indexedDB.open(dbName, 1);

    request.onerror = function (event) {
        console.log("An error occured when opening the database");
    }

    request.onupgradeneeded = function (event) {
        db = event.target.result;

        let searchObjectStore = db.createObjectStore(searchObjectStoreName, { autoIncrement: true });

        searchObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Search' created.");
        }

        let keywordObjectStore = db.createObjectStore(keywordObjectStoreName, { keyPath: "name" });

        // creating indices on this objectStore
        //keywordObjectStore.createIndex("name", "name", { unique: true });

        keywordObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Keyword' created.");
        }

        let settingObjectStore = db.createObjectStore(settingObjectStoreName, { keyPath: "id" });

        settingObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Setting' created.");
        }
    }

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("Database successfully initialized and opened");

        // once, the database obtained, execute the sent request in a runtime context
        if (context.status == "INSTALL"){
            initializeDatabase();
        }
        if (context.status == "RUNTIME-MESSAGE-EVENT"){
            processMessageEvent(context.params.message, context.params.sender, context.params.sendResponse)
        }
        else if (context.status == "RUNTIME-TAB-EVENT"){
            processTabEvent(context.params.tabId, context.params.changeInfo, context.params.tab);
        }

        db.onerror = function (event) {
            console.log("Failed to open database.")
        }
    }
}

// Extension installation script

chrome.runtime.onInstalled.addListener(details => {
    createDatabase({status: "INSTALL"})
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        // chrome.runtime.setUninstallURL('https://example.com/extension-survey');
    }
});

// Script for initializing the database

function initializeDatabase(){

    // initialize settings
    initSettings();
}

// Script for intializing the "Setting" object store

function initSettings(){

    // Checking first that the settings are already set 

    // if nothing is set then proceed to set it up
    const objectStore = db.transaction(settingObjectStoreName, "readwrite").objectStore(settingObjectStoreName);
    settingData.forEach((setting) => {
      const request = objectStore.add(setting);
      request.onsuccess = (event) => {
        console.log("Setting data set");
      };
    });
}

// Script for getting all saved searches

function provideSearchList(offset=0) {
    /*db
    .transaction(searchObjectStoreName, "readonly")
    .objectStore(searchObjectStoreName)
    .getAll()
    .onsuccess = (event) => {
        let results = event.target.result;
        results.reverse();

        console.log('Got all searches:', results);
        // Sending the retrieved data
        chrome.runtime.sendMessage({header: 'search-list', data: results}, (response) => {
          console.log('Search list response sent', response);
        });
    };*/

    let counter = 0; let searches = [];
    var offsetApplied = false;
    let cursor = db.transaction(searchObjectStoreName, "readonly").objectStore(searchObjectStoreName).openCursor(null, 'prev');
    cursor.onsuccess = function(event) {
        var cursor = event.target.result;

        if(!cursor) {
            // searches.reverse();
            sendSearchList(searches);
            return;
        }

        if(offset != 0 && !offsetApplied) {
          offsetApplied = true;
          cursor.advance(offset);
          return;
        }

        searches.push(cursor.value);
        // console.log(value);

        counter++;
        if(counter < appParams.searchPageLimit) {
            // only continue if under limit
            cursor.continue();
        }
        else{
            sendSearchList(searches);
            return;
        }
    }
}

// Script for sending the retrieved search list

function sendSearchList(searches){
    chrome.runtime.sendMessage({header: 'search-list', data: searches}, (response) => {
      console.log('Search list response sent', response);
    });
}

// Script for getting keyword count

function provideKeywordCount() {

    db
    .transaction(keywordObjectStoreName, "readonly")
    .objectStore(keywordObjectStoreName)
    .count()
    .onsuccess = (event) => {
        console.log('Got keyword count:', event.target.result);
        // Sending the retrieved data
        chrome.runtime.sendMessage({header: 'keyword-count', data: event.target.result}, (response) => {
          console.log('Keyword count response sent', response);
        });
    };
}

// Script for getting all saved searches

function provideKeywordList() {
    db
    .transaction(keywordObjectStoreName, "readonly")
    .objectStore(keywordObjectStoreName)
    .getAll()
    .onsuccess = (event) => {
        console.log('Got all keywords:', event.target.result);
        // Sending the retrieved data
        chrome.runtime.sendMessage({header: 'keyword-list', data: event.target.result}, (response) => {
          console.log('Keyword list response sent', response);
        });
    };
}

// Script for providing all the app parameters

function provideAppParams() {
    chrome.runtime.sendMessage({header: 'app-params-list', data: appParams}, (response) => {
      console.log('App params list response sent', response);
    });
}

// Script for adding a new search

function add_search(searchData) {
    const objectStore = db.transaction(searchObjectStoreName, "readwrite").objectStore(searchObjectStoreName);
    searchData.forEach((search) => {
      const request = objectStore.add(search);
      request.onsuccess = (event) => {
        // console.log("New keyword added")
        // Sending the new list immediately 'cause it's a one-item list
        provideSearchList() 
      };
    });
}

// Script for adding a new keyword

function add_keyword(keywordData) {
    const objectStore = db.transaction(keywordObjectStoreName, "readwrite").objectStore(keywordObjectStoreName);
    keywordData.forEach((keyword) => {
        // setting the date of insertion
        keyword.date = new Date().toISOString();
        const request = objectStore.add(keyword);
        request.onsuccess = (event) => {
            // console.log("New keyword added")
            // Sending the new list
            provideKeywordList() 
        };

        request.onerror = function (event) {
            console.log("An error when inserting the new keyword", event);
            let errorData = "An error occured most likely due to duplicated data. Check again before trying again !";
            chrome.runtime.sendMessage({header: 'add-keyword-error', data: errorData}, (response) => {
              console.log('Add keyword error message sent', response);
            });
        }
    });
}

// Script for deleting a keyword

function delete_keyword(keywordData) {
    const objectStore = db.transaction(keywordObjectStoreName, "readwrite").objectStore(keywordObjectStoreName);
    let request = objectStore.delete(keywordData);
    request.onsuccess = (event) => {
        console.log("Keyword deleted")
        // Sending the new list
        provideKeywordList() 
    }

    request.onerror = function (event) {
        console.log("An error when deleting the keyword", event);
        let errorData = "An error occured !";
        chrome.runtime.sendMessage({header: 'delete-keyword-error', data: errorData}, (response) => {
          console.log('Delete keyword error message sent', response);
        });
    }
}

// Script for setting the new date of data reset

function updateSettingObjectStore(propKey, propValue){



    // Retrieving the data first for later update
    let objectStore = db.transaction(settingObjectStoreName, "readwrite").objectStore(settingObjectStoreName);
    let request = objectStore.get(1);

    request.onsuccess = (event) => {
        console.log('Got settings:', event.target.result);
        // then, update the property
        let settings = event.target.result;

        settings[propKey] = propValue;

        let requestUpdate = objectStore.put(settings);
        requestUpdate.onerror = (event) => {
            // Do something with the error
            console.log("An error occured when updating "+propKey+" !");
        };
        requestUpdate.onsuccess = (event) => {
            // Success - the data is updated!
            console.log(propKey+" update processed successfully !");

            provideSettingsData(propKey);
        };
    };

    request.onerror = (event) => {
        // Handle errors!
        console.log("An error occured when retrieving the settings for later update")
    };
} 

// Script for clearing an objectStore

function clearObjectStores(objectStoreNames){
    if (objectStoreNames.length == 0){
        // updating the last reset date before notifying the content script
        updateSettingObjectStore("lastDataResetDate", (new Date().toISOString()));
        return;
    }

    const objectStore = db.transaction(objectStoreNames[0], "readwrite").objectStore(objectStoreNames[0]);
    objectStore.clear().onsuccess = (event) => {
        // Clearing the next objectStore
        objectStoreNames.shift()
        clearObjectStores(objectStoreNames)
    }
}

// Script for providing setting data

function provideSettingsData(property){
    db
    .transaction(settingObjectStoreName, "readonly")
    .objectStore(settingObjectStoreName)
    .get(1)
    .onsuccess = (event) => {
        console.log('Got settings:', event.target.result);
        // Sending the retrieved data
        let settings = event.target.result;
        chrome.runtime.sendMessage({header: 'settings-data', data: {property: property, value: settings[property]}}, (response) => {
          console.log('Settings data response sent', response);
        });
    };
}

// Script handling the message execution

function processMessageEvent(message, sender, sendResponse){

    console.log("Message received : ", message)
    // Script for getting all the searches done so far
    switch(message.header){
        case 'get-search-list':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // providing the result
            provideSearchList(message.data);
            break;
        }
        case 'get-keyword-list':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // providing the result
            provideKeywordList();
            break;
        }
        case 'add-keyword':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Adding the new keyword
            add_keyword(message.data)       
            break;
        }
        case 'delete-keyword':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Deleting a keyword
            delete_keyword(message.data)       
            break;
        }
        case 'get-keyword-count':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Providing the keyword count to the front 
            provideKeywordCount()       
            break;
        }
        case 'get-app-params':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Providing the app parameters to the front 
            provideAppParams();       
            break;
        }
        case 'get-last-reset-date':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Providing the last reset date to the front 
            provideSettingsData("lastDataResetDate")
            break;
        }
        case 'save-notification-checkbox-setting':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Saving the new notification setting state
            updateSettingObjectStore("notifications", message.data)
            break;
        }
        case 'erase-all-data':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Erasing all data
            const data = db.objectStoreNames;
            let objectStoreNames = [];
            for (var key in data){
                if (typeof data[key] === "string" && data[key] != settingObjectStoreName){
                    objectStoreNames.push(data[key]);
                }
            }
            clearObjectStores(objectStoreNames);
            break;
        }
        default:{
            // TODO
        }
    }
};

// Script for processing tab event
function processTabEvent(tabId, changeInfo, tab){
    const linkedInPattern = /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)/gm;
    if (changeInfo.url && linkedInPattern.test(changeInfo.url)) 
    {
        searches = [
            {
                fullName: "John Doe",
                title: "Software Engineer",
                info: "About",
                imageUrl: "ok",
                coverImageUrl: "ok",
                date: new Date().toISOString(),
                nFollowers: 1,
                nConnections: 1, 
                location: "",
                bookmarked: true,
                education: {},
                experience: {},
                certifications: {},
                newsFeed: {},
                languages: {}
            }
        ];
        add_search(searches);
    }
};

// Script for listening to all events related to the content scripts

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
    // making sure the database is up and running
    if (!db){
        // sending a response
        sendResponse({
            status: "ACK"
        });
        createDatabase({status: "RUNTIME-MESSAGE-EVENT", params: {message: message, sender: sender, sendResponse: sendResponse}});
        return;
    }

    processMessageEvent(message, sender, sendResponse)    
});

// Script for linstening to all tab updates

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    // making the database is up and running
    if (!db){
        createDatabase({status: "RUNTIME-TAB-EVENT", params: {tabId: tabId, changeInfo: changeInfo, tab: tab}});
        return;
    }

    processTabEvent(tabId, changeInfo, tab);
  }
);