// Script of extension database creation

let db = null;
const searchObjectStoreName = "searches";
const keywordObjectStoreName = "keywords";
const settingObjectStoreName = "settings";
const profileObjectStoreName = "profiles";
const reminderObjectStoreName = "reminders";
const appParams = {appVersion: "0.1.0", keywordCountLimit: 5, searchPageLimit: 2};
const settingData = [{
    id: 1,
    notifications: true,
    lastDataResetDate: new Date().toISOString(),
    installedOn: new Date().toISOString(),
    productID: null, 
    currentPageTitle: "Activity",
}];

function createDatabase(context) {

    const dbName = "LinkBeamDB"
    const request = indexedDB.open(dbName, 1);

    request.onerror = function (event) {
        console.log("An error occured when opening the database");
    }

    request.onupgradeneeded = function (event) {
        db = event.target.result;

        // Search object store
        let searchObjectStore = db.createObjectStore(searchObjectStoreName, { autoIncrement: true });

        searchObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Search' created.");
        }

        // Profile Object store
        let profileObjectStore = db.createObjectStore(profileObjectStoreName, { keyPath: "url" });

        // profileObjectStore.createIndex("url", "url", { unique: true });

        profileObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Profile' created.");
        }

        // keyword Object store
        let keywordObjectStore = db.createObjectStore(keywordObjectStoreName, { keyPath: "name" });

        keywordObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Keyword' created.");
        }

        // Reminder Object store
        let reminderObjectStore = db.createObjectStore(reminderObjectStoreName, { keyPath: "url" });

        reminderObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Reminder' created.");
        }

        // setting object store
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

function provideSearchProfiles(searches){

    if (searches.length == 0){
        sendSearchList([]);
        return;
    }

    // For each url, create a request to retrieve the corresponding profile
    let objectStore = db
                        .transaction(profileObjectStoreName, "readonly")
                        .objectStore(profileObjectStoreName);
    let results = [];

    searches.forEach((search) => {
        
        let profileRequest = objectStore.get(search.url);
        profileRequest.onsuccess = (event) => {
            let profile = event.target.result;
            console.log('Got corresponding profile: ', profile);
            
            search.profile = profile;
            results.push(search);

            // keep going to the next search
            if(results.length == searches.length) {
                // only continue if under limit
                sendSearchList(results);
            }

        };

        profileRequest.onerror = (event) => {
            console.log('An error occured when requesting the corresponding profile : ', event);
        };

    });
}

// Script for providing all the bookmarked profiles

function provideBookmarkedList(){

    let request = db
                    .transaction(profileObjectStoreName, "readonly")
                    .objectStore(profileObjectStoreName)
                    .index('bookmarked').openCursor(IDBKeyRange.only('true'))
    request.onsuccess = (event) => {
        console.log('Got all bookmarked:', event.target.result);
        // Sending the retrieved data
        chrome.runtime.sendMessage({header: 'bookmarked-list', data: event.target.result}, (response) => {
          console.log('Bookmarked list response sent', response);
        });
    };

    request.onerror = (event) => {
        console.log("An error occured when retrieving the bookmarked");
    };

}

// Script for getting all saved searches

function provideSearchList(offset=0) {

    let searches = [];
    var offsetApplied = false;
    let cursor = db.transaction(searchObjectStoreName, "readonly").objectStore(searchObjectStoreName).openCursor(null, 'prev');
    cursor.onsuccess = function(event) {
        let cursor = event.target.result;
        
        if(!cursor) {
            provideSearchProfiles(searches);
            return;
        }

        if(offset != 0 && !offsetApplied) {
          offsetApplied = true;
          cursor.advance(offset);
          return;
        }

        let search = cursor.value;
        searches.push(search);

        if(searches.length < appParams.searchPageLimit) {
            cursor.continue();
        }
        else{
            provideSearchProfiles(searches);
            return;
        }
    }

    cursor.onerror = (event) => {
        console.log("Failed to acquire the cursor !");
    };
}

// Script for sending the retrieved search list

function sendSearchList(searches){

    // Sorting the list before sending it
    searches.sort((a,b) => a.date - b.date);
    // searches.sort((a,b) => (new Date(a.date)) - (new Date(b.date)));

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

function add_search(search) {

    console.log("Initiating insertion");

    add_profile(search.profile, search);

}

function add_search_data(searchData){

    delete searchData.profile;

    const objectStore = db.transaction(searchObjectStoreName, "readwrite").objectStore(searchObjectStoreName);
    const request = objectStore.add(searchData);
    request.onsuccess = (event) => {
        console.log("New search data added");
        provideSearchList();
    };

    request.onerror = (event) => {
        console.log("An error occured when adding search data");
    };

}

// Script for providing a profile given its url

function provideProfile(url){

    let objectStore = db.transaction(profileObjectStoreName, "readwrite").objectStore(profileObjectStoreName);
    let request = objectStore.get(url);

    request.onsuccess = (event) => {
        console.log('Got profile:', event.target.result);

        let profile = event.target.result;
        chrome.runtime.sendMessage({header: 'profile-object', data: profile}, (response) => {
          console.log('Profile object response sent', response);
        });

    };

    request.onerror = (event) => {
        // Handle errors!
        console.log("An error occured when retrieving the profile with url : ", profile.url);
    };

}

// Script for adding the new profile

function add_profile(profile, search){

    // checking first that a profile with the same id doesn't exist yet
    let objectStore = db.transaction(profileObjectStoreName, "readwrite").objectStore(profileObjectStoreName);
    let request = objectStore.get(profile.url);

    request.onsuccess = (event) => {
        console.log('Got profile:', event.target.result);

        if (event.target.result){
            let dbProfile = event.target.result;
            // then add the search object
            add_search_data(search);
        }
        else{

            // then adding the given profile into the database
            const objectStore = db.transaction(profileObjectStoreName, "readwrite").objectStore(profileObjectStoreName);
            const request = objectStore.add(profile);
            request.onsuccess = (event) => {
                console.log("New profile added");
                add_search_data(search);
            };

            request.onerror = (event) => {
                console.log("An error occured when adding a new profile");
            };

        }
        
    };

    request.onerror = (event) => {
        // Handle errors!
        console.log("An error occured when retrieving the profile with url : ", profile.url);
    };
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

            provideSettingsData([propKey]);
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

function provideSettingsData(properties){
    db
    .transaction(settingObjectStoreName, "readonly")
    .objectStore(settingObjectStoreName)
    .get(1)
    .onsuccess = (event) => {
        console.log('Got settings:', event.target.result);
        // Sending the retrieved data
        let settings = event.target.result;
        properties.forEach((property) => {
            chrome.runtime.sendMessage({header: 'settings-data', data: {property: property, value: settings[property]}}, (response) => {
              console.log('Settings data response sent', response);
            });
        });
    };
}

// Script for sending search chart data

function sendSearchChartData(chartData){
    chartData.reverse();
    
    chrome.runtime.sendMessage({header: 'search-chart-data', data: chartData}, (response) => {
      console.log('Search chart data response sent', response);
    });
}

// Script for providing search chart data

function provideSearchChartData(chartData){

    let results = [];
    for (let i = 0; i < chartData.length; i++){
        results.push(0);
    }

    // populating the chart data Array
    let cursor = db.transaction(searchObjectStoreName, "readonly").objectStore(searchObjectStoreName).openCursor(null, 'prev');
    cursor.onsuccess = function(event) {
        var cursor = event.target.result;

        if(!cursor) {
            sendSearchChartData(results);
            return;
        }

        let searchDate = cursor.value.date.split("T")[0];
        let index = chartData.indexOf(searchDate);
        if (index != -1){
            results[index]++;
        }
        else{
            sendSearchChartData(results);
            return;
        }

        cursor.continue();        
    }

}

// Script for processing linkedin data

function processLinkedInData(linkedInData){
    if (linkedInData == null){
        console.log("Not a valid linkedin page");
        return;
    }
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
    case 'get-bookmarked-list':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // providing the result
            provideBookmarkedList();
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
            add_keyword(message.data);
            break;
        }

        case 'get-profile':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Adding the new keyword
            let profileUrl = message.data;
            provideProfile(profileUrl);
            break;
        }

        case 'delete-keyword':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Deleting a keyword
            delete_keyword(message.data);     
            break;
        }
        case 'get-keyword-count':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Providing the keyword count to the front 
            provideKeywordCount();
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
        case 'get-settings-data':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Providing the last reset date to the front 
            provideSettingsData(message.data);
            break;
        }
        case 'set-settings-data':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Providing the last reset date to the front 
            updateSettingObjectStore(message.data.property, message.data.value);
            break;
        }

        case 'get-search-chart-data':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Saving the new notification setting state
            provideSearchChartData(message.data);
            break;
        }
        case 'linkedin-data':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Saving the new notification setting state
            processLinkedInData(message.data);
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

    // console.log("in processTabEvent function !");

    const linkedInPattern = /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)/gm;
    if (changeInfo.url && linkedInPattern.test(changeInfo.url)) 
    {
        /*let datetime = new Date().toISOString();
        let search = {
            date: datetime,
            url: datetime,
            profile: {
                url: datetime,
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
                languages: {},
            },
        };
        add_search(search);*/

        // Sending a signal to the content script for confirmation and data extraction
        chrome.runtime.sendMessage({header: 'check-linkedin-page', data: null}, (response) => {
          console.log('check-linkedin-page request sent', response);
        });
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