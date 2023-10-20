// Script of extension database creation
import { 
  appParams, 
  dbData,
  messageParams,
  ack,
  testTabUrl
} from "../react_components/Local_library";
import { v4 as uuidv4 } from 'uuid';

let db = null,
    tabID = null,
    currentTabCheckContext = null;

const settingData = [{
    id: 1,
    notifications: true,
    lastDataResetDate: new Date().toISOString(),
    installedOn: new Date().toISOString(),
    productID: uuidv4(), 
    currentPageTitle: "Activity",
    userIcon: "default",
}];

function createDatabase(context) {

    const dbName = "LinkBeamDB";
    const request = indexedDB.open(dbName, 1);

    request.onerror = function (event) {
        console.log("An error occured when opening the database");
    }

    request.onupgradeneeded = function (event) {
        db = event.target.result;

        // Search object store
        let searchObjectStore = db.createObjectStore(dbData.objectStoreNames.SEARCHES, { autoIncrement: true });

        searchObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Search' created.");
        }

        // Profile Object store
        let profileObjectStore = db.createObjectStore(dbData.objectStoreNames.PROFILES, { keyPath: "url" });

        // profileObjectStore.createIndex("bookmarked", "bookmarked", { unique: false });

        profileObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Profile' created.");
        }

        // keyword Object store
        let keywordObjectStore = db.createObjectStore(dbData.objectStoreNames.KEYWORDS, { keyPath: "name" });

        keywordObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Keyword' created.");
        }

        // Reminder Object store
        let reminderObjectStore = db.createObjectStore(dbData.objectStoreNames.REMINDERS, { keyPath: "url" });

        reminderObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Reminder' created.");
        }

        // setting object store
        let settingObjectStore = db.createObjectStore(dbData.objectStoreNames.SETTINGS, { keyPath: "id" });

        settingObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Setting' created.");
        }

        // notification object store
        let notificationObjectStore = db.createObjectStore(dbData.objectStoreNames.NOTIFICATIONS, { keyPath: "id" });

        notificationObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Notification' created.");
        }

        // bookmarks object store
        let bookmarkObjectStore = db.createObjectStore(dbData.objectStoreNames.BOOKMARKS, { keyPath: "url" });

        bookmarkObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Bookmark' created.");
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
    const objectStore = db.transaction(dbData.objectStoreNames.SETTINGS, "readwrite").objectStore(dbData.objectStoreNames.SETTINGS);
    settingData.forEach((setting) => {
      const request = objectStore.add(setting);
      request.onsuccess = (event) => {
        console.log("Setting data set");
      };
    });
}













function getSearchProfiles(searches, context){

    if (searches.length == 0){
        sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.SEARCHES, {context: context, list: searches});
        return;
    }

    // For each url, create a request to retrieve the corresponding profile
    let objectStore = db
                        .transaction(dbData.objectStoreNames.PROFILES, "readonly")
                        .objectStore(dbData.objectStoreNames.PROFILES);
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
                sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.SEARCHES, {context: context, list: results});
            }

        };

        profileRequest.onerror = (event) => {
            console.log('An error occured when requesting the corresponding profile : ', event);
        };

    });
}

// Script for providing all the bookmarked profiles

function getBookmarkList(){

    let request = db
                    .transaction(dbData.objectStoreNames.BOOKMARKS, "readonly")
                    .objectStore(dbData.objectStoreNames.BOOKMARKS)
                    .getAll();
    let results = [];
    request.onsuccess = (event) => {
        console.log('Got all bookmarks:', event.target.result);
        // Sending the retrieved data
        var bookmarks = event.target.result;

        if (bookmarks.length == 0){
            sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.BOOKMARKS, results);
            return;
        }

        bookmarks.forEach((bookmark) => {
            let profileRequest = db
                    .transaction(dbData.objectStoreNames.PROFILES, "readonly")
                    .objectStore(dbData.objectStoreNames.PROFILES)
                    .get(bookmark.url);
            profileRequest.onsuccess = (event) => {
                var profile = event.target.result;
                bookmark.profile = profile;

                results.push(bookmark);

                if (results.length == bookmarks.length){
                    results.sort((a,b) => (new Date(b.createdOn)) - (new Date(a.createdOn)));
                    sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.BOOKMARKS, results);
                }
            };

            profileRequest.onerror = (event) => {
                console.log("An error occured when retrieving profile of url : ", bookmark.url);
            };
        });
    };

    request.onerror = (event) => {
        console.log("An error occured when retrieving all bookmarks");
    };

}

// Script for getting all saved searches

function getSearchList(params) {


    var params = (params ? params : {});
    var offset = (params.offset ? params.offset : 0);
    var date = (params.date ? params.date : null);
    var context = params.context;

    let searches = [];
    var offsetApplied = false;
    let cursor = db.transaction(dbData.objectStoreNames.SEARCHES, "readonly").objectStore(dbData.objectStoreNames.SEARCHES).openCursor(null, 'prev');
    cursor.onsuccess = function(event) {
        let cursor = event.target.result;
        
        if(!cursor) {
            getSearchProfiles(searches, context);
            return;
        }

        if(offset != 0 && !offsetApplied) {
          offsetApplied = true;
          cursor.advance(offset);
          return;
        }

        let search = cursor.value;
        if (date){
            if (date == search.date.split("T")[0]){
                searches.push(search);
            }
        }
        else{
            searches.push(search);
        }

        if(searches.length < appParams.searchPageLimit) {
            cursor.continue();
        }
        else{
            getSearchProfiles(searches, context);
            return;
        }
    }

    cursor.onerror = (event) => {
        console.log("Failed to acquire the cursor !");
    };
}


// Script for getting all saved searches

function getReminderList() {

    let results = [];
    let request = db
                .transaction(dbData.objectStoreNames.REMINDERS, "readonly")
                .objectStore(dbData.objectStoreNames.REMINDERS)
                .getAll();

    request.onsuccess = (event) => {
        console.log('Got all reminders:', event.target.result);
        // Sending the retrieved data
        let reminders = event.target.result;

        if (reminders.length == 0){
            sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.REMINDERS, results);
        }

        reminders.forEach((reminder) => {

            reminder.profile = null;

            let profileRequest = db
                .transaction(dbData.objectStoreNames.PROFILES, "readonly")
                .objectStore(dbData.objectStoreNames.PROFILES)
                .get(reminder.url);

            profileRequest.onsuccess = (event) => {
                // console.log('Got all reminders:', event.target.result);
                // Sending the retrieved data
                let profile = event.target.result;
                if (profile != undefined){
                    reminder.profile = profile;
                }
                results.push(reminder);

                sendBackResponse("OBJECT-LIST", dbData.objectStoreNames.REMINDERS, results);
            };

            profileRequest.onerror = (event) => {
                console.log("An error occured when retrieving profile with url : ", event);
            };

        });
    };

    request.onerror = (event) => {
        console.log("An error occured when retrieving reminder list : ", event);
    };
}

// Script for getting all saved searches

function getKeywordList() {

    let request = db
                .transaction(dbData.objectStoreNames.KEYWORDS, "readonly")
                .objectStore(dbData.objectStoreNames.KEYWORDS)
                .getAll();

    request.onsuccess = (event) => {
        console.log('Got all keywords:', event.target.result);
        // Sending the retrieved data
        let results = event.target.result;
        sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.KEYWORDS, results);
    };

    request.onerror = (event) => {
        console.log("An error occured when retrieving keyword list : ", event);
    };
}

// Script for getting all db data

function getAllData(){

    const data = db.objectStoreNames;
    var results = [], objectStoreNames = [];

    for (var key in data){
        if (typeof data[key] === "string"){
            objectStoreNames.push(data[key]);
        }
    }

    getObjectStoresBareData(objectStoreNames, results);

}

function getObjectStoresBareData(objectStoreNames, results){

    if (objectStoreNames.length == 0){
        // Sending the data back to the content script
        sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, "all", results);
        return;
    }

    let request = db
        .transaction(objectStoreNames[0], "readonly")
        .objectStore(objectStoreNames[0])
        .getAll();

    request.onsuccess = (event) => {
        console.log('Got all data ['+objectStoreNames[0]+']:', event.target.result);
        // Sending the retrieved data
        results.push(event.target.result);

        objectStoreNames.shift()

        // looping
        getObjectStoresBareData(objectStoreNames, results);
        // if (Object.keys(results).length == objectStoreNames.length){

    };

    request.onerror = (event) => {
        console.log("An error occured when retrieving all data ["+objectStoreNames[0]+"] : ", event);
    };

}

// Script for getting any objectStore list

function getList(objectStoreName, objectData){

    switch(objectStoreName){
        case dbData.objectStoreNames.SEARCHES:{
            getSearchList(objectData);
            break;
        }

        case dbData.objectStoreNames.BOOKMARKS:{
            getBookmarkList();
            break;
        }

        case dbData.objectStoreNames.KEYWORDS:{
            getKeywordList();
            break;
        }

        case dbData.objectStoreNames.REMINDERS:{
            getReminderList();
            break;
        }

        case "all":{
            getAllData();
            break;
        }
    }

}













// Script for count any object store elements

function getObjectCount(objectStoreName, objectData){

    switch(objectStoreName){

        case dbData.objectStoreNames.KEYWORDS:{
            getKeywordCount(objectData);
            break;
        }

        case dbData.objectStoreNames.REMINDERS:{
            getReminderCount(objectData);
            break;
        }
    }

}

// Sorting the list before sending it
// searches.sort((a,b) => a.date - b.date);
// searches.sort((a,b) => (new Date(a.date)) - (new Date(b.date)));

// Script for getting reminder count

function getReminderCount() {

    var request = db
                    .transaction(dbData.objectStoreNames.REMINDERS, "readonly")
                    .objectStore(dbData.objectStoreNames.REMINDERS)
                    .count();
    request.onsuccess = (event) => {
        console.log('Got reminder count:', event.target.result);
        // Sending the retrieved data
        var result = event.target.result;
        sendBackResponse(messageParams.responseHeaders.OBJECT_COUNT, dbData.objectStoreNames.REMINDERS, result);
    };

    request.onerror = (event) => {
        console.log("An error occured when counting reminders : ", event);
    };
}


// Script for getting keyword count

function getKeywordCount() {

    var request = db
                    .transaction(dbData.objectStoreNames.KEYWORDS, "readonly")
                    .objectStore(dbData.objectStoreNames.KEYWORDS)
                    .count();
    request.onsuccess = (event) => {
        console.log('Got keyword count:', event.target.result);
        // Sending the retrieved data
        var result = event.target.result;
        sendBackResponse(messageParams.responseHeaders.OBJECT_COUNT, dbData.objectStoreNames.KEYWORDS, result);
    };

    request.onerror = (event) => {
        console.log("An error occured when counting keywords : ", event);
    };
}













// Script for adding a new search

function add_search(search) {

    console.log("Initiating insertion");

    if (search.profile == undefined){
        return;
    }

    add_profile(search.profile, search);

}

function add_search_data(searchData){

    delete searchData.profile;

    const objectStore = db.transaction(dbData.objectStoreNames.SEARCHES, "readwrite").objectStore(dbData.objectStoreNames.SEARCHES);
    const request = objectStore.add(searchData);
    request.onsuccess = (event) => {
        console.log("New search data added");
    };

    request.onerror = (event) => {
        console.log("An error occured when adding search data");
    };

}

// Script for adding a reminder

function addReminderObject(reminder){

    reminder.createdOn = (new Date()).toISOString();

    const objectStore = db.transaction(dbData.objectStoreNames.REMINDERS, "readwrite").objectStore(dbData.objectStoreNames.REMINDERS);
    const request = objectStore.add(reminder);
    request.onsuccess = (event) => {
        console.log("New reminder added");
        sendBackResponse(messageParams.responseHeaders.OBJECT_ADDED, dbData.objectStoreNames.REMINDERS, reminder);
    };

    request.onerror = (event) => {
        console.log("An error occured when adding a reminder ", event);
    };

}

// Script for adding a bookmark

function addBookmarkObject(url){

    var bookmark = {url: url, createdOn: (new Date()).toISOString()};

    const objectStore = db.transaction(dbData.objectStoreNames.BOOKMARKS, "readwrite").objectStore(dbData.objectStoreNames.BOOKMARKS);
    const request = objectStore.add(bookmark);
    request.onsuccess = (event) => {
        console.log("New bookmark added");
        sendBackResponse(messageParams.responseHeaders.OBJECT_ADDED, dbData.objectStoreNames.BOOKMARKS, bookmark);
    };

    request.onerror = (event) => {
        console.log("An error occured when adding a bookmark");
    };

}

// Script for adding any object instance

function addObject(objectStoreName, objectData){

    switch(objectStoreName){
        case dbData.objectStoreNames.BOOKMARKS:{
            addBookmarkObject(objectData);
            break;
        }

        case dbData.objectStoreNames.KEYWORDS:{
            addKeywordObject(objectData);
            break;
        }

        case dbData.objectStoreNames.REMINDERS:{
            addReminderObject(objectData);
            break;
        }
    }

}

// Script for adding the new profile

function add_profile(profile, search){

    // checking first that a profile with the same id doesn't exist yet
    let objectStore = db.transaction(dbData.objectStoreNames.PROFILES, "readwrite").objectStore(dbData.objectStoreNames.PROFILES);
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
            const objectStore = db.transaction(dbData.objectStoreNames.PROFILES, "readwrite").objectStore(dbData.objectStoreNames.PROFILES);
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

function addKeywordObject(keywordData) {
    const objectStore = db.transaction(dbData.objectStoreNames.KEYWORDS, "readwrite").objectStore(dbData.objectStoreNames.KEYWORDS);
    
    // setting the date of insertion
    var keyword = {name: keywordData, createdOn: new Date().toISOString()}
    const request = objectStore.add(keyword);
    request.onsuccess = (event) => {
        // console.log("New keyword added")
        // Sending the new list
        getKeywordList() 
    };

    request.onerror = function (event) {
        console.log("An error when inserting the new keyword", event);
        let errorData = "An error occured most likely due to duplicated data. Check again before trying again !";
        chrome.runtime.sendMessage({header: 'add-keyword-error', data: errorData}, (response) => {
          console.log('Add keyword error message sent', response);
        });
    };

}













// Script for deleting a reminder

function deleteReminderObject(reminderData){

    const objectStore = db.transaction(dbData.objectStoreNames.REMINDERS, "readwrite").objectStore(dbData.objectStoreNames.REMINDERS);
    const request = objectStore.delete(reminderData);
    request.onsuccess = (event) => {
        console.log("A reminder deleting");
        sendBackResponse(messageParams.responseHeaders.OBJECT_DELETED, dbData.objectStoreNames.REMINDERS, reminderData);
    };

    request.onerror = (event) => {
        console.log("An error occured when deleting a reminder ", event);
    };

}

// Script for deleting a bookmark 

function deleteBookmarkObject(bookmarkData){

    const objectStore = db.transaction(dbData.objectStoreNames.BOOKMARKS, "readwrite").objectStore(dbData.objectStoreNames.BOOKMARKS);
    const request = objectStore.delete(bookmarkData);
    request.onsuccess = (event) => {
        console.log("Bookmark deleted");
        sendBackResponse(messageParams.responseHeaders.OBJECT_DELETED, dbData.objectStoreNames.BOOKMARKS, bookmarkData)
    };

    request.onerror = (event) => {
        console.log("An error occured when deleting a bookmark");
    };

}

// Script for deleting any object instance

function deleteObject(objectStoreName, objectData){

    switch(objectStoreName){
        case dbData.objectStoreNames.BOOKMARKS:{
            deleteBookmarkObject(objectData);
            break;
        }

        case dbData.objectStoreNames.KEYWORDS:{
            deleteKeywordObject(objectData);
            break;
        }

        case dbData.objectStoreNames.REMINDERS:{
            deleteReminderObject(objectData);
            break;
        }

        case "all":{
            truncateDB();
            break;
        }
    }

}

// Script for deleting a keyword

function deleteKeywordObject(keywordData) {
    const objectStore = db.transaction(dbData.objectStoreNames.KEYWORDS, "readwrite").objectStore(dbData.objectStoreNames.KEYWORDS);
    let request = objectStore.delete(keywordData);
    request.onsuccess = (event) => {
        console.log("Keyword deleted")
        // Sending the new list
        getKeywordList() 
    }

    request.onerror = function (event) {
        console.log("An error when deleting the keyword", event);
        let errorData = "An error occured !";
        chrome.runtime.sendMessage({header: 'delete-keyword-error', data: errorData}, (response) => {
          console.log('Delete keyword error message sent', response);
        });
    }
}

// Script for truncating the database 

function truncateDB(){

    // Erasing all data
    const data = db.objectStoreNames;
    let objectStoreNames = [];
    for (var key in data){
        if (typeof data[key] === "string" && data[key] != dbData.objectStoreNames.SETTINGS){
            objectStoreNames.push(data[key]);
        }
    }
    clearObjectStores(objectStoreNames);
    
}

// Script for clearing an objectStore

function clearObjectStores(objectStoreNames){

    if (objectStoreNames.length == 0){
        // updating the last reset date before notifying the content script
        updateSettingObject("lastDataResetDate", (new Date()).toISOString());
        return;
    }

    const objectStore = db.transaction(objectStoreNames[0], "readwrite").objectStore(objectStoreNames[0]);
    objectStore.clear().onsuccess = (event) => {
        // Clearing the next objectStore
        // getList(objectStoreNames[0], null);
        objectStoreNames.shift()
        clearObjectStores(objectStoreNames)
    }

}













// Script for getting any object instance

function getObject(objectStoreName, objectData){

    switch(objectStoreName){
        case dbData.objectStoreNames.PROFILES:{
            getProfileObject(objectData);
            break;
        }

        case dbData.objectStoreNames.SETTINGS:{
            getSettingsData(objectData);
            break;
        }

        case "feedback": {
            getFeedbackData(objectData);
            break;
        }
    }

}

// Script for getting processed data usually for statistics

function getProcessedData(objectStoreName, objectData){

    switch(objectStoreName){

        case "views-timeline-chart":{
            getViewsTimelineData(objectData);
            break;
        }

    }

}

// Script for providing a profile given its url

function getProfileObject(url){

    let objectStore = db.transaction(dbData.objectStoreNames.PROFILES, "readonly").objectStore(dbData.objectStoreNames.PROFILES);
    let request = objectStore.get(url);

    request.onsuccess = (event) => {

        let profile = event.target.result;
        profile.bookmark = null;
        profile.reminder = null;

        let bookmarkObjectStore = db.transaction(dbData.objectStoreNames.BOOKMARKS, "readonly").objectStore(dbData.objectStoreNames.BOOKMARKS);
        let bookmarkRequest = bookmarkObjectStore.get(url);

        bookmarkRequest.onsuccess = (event) => {

            let bookmark = event.target.result;

            if (bookmark != undefined){
                profile.bookmark = bookmark;
            }

            let reminderObjectStore = db.transaction(dbData.objectStoreNames.REMINDERS, "readonly").objectStore(dbData.objectStoreNames.REMINDERS);
            let reminderRequest = reminderObjectStore.get(url);

            reminderRequest.onsuccess = (event) => {

                let reminder = event.target.result;
                if (reminder != undefined){
                    profile.reminder = reminder;
                }
                sendBackResponse(messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.PROFILES, profile);

            };

            bookmarkRequest.onerror = (event) => {
                // Handle errors!
                console.log("An error occured when retrieving the reminder with url : ", url);
            };

        };

        bookmarkRequest.onerror = (event) => {
            // Handle errors!
            console.log("An error occured when retrieving the bookmark with url : ", url);
        };
    };

    request.onerror = (event) => {
        // Handle errors!
        console.log("An error occured when retrieving the profile with url : ", profile.url);
    };

}

// Script for providing setting data

function getSettingsData(properties, callback = null){
    
    var request = db
                    .transaction(dbData.objectStoreNames.SETTINGS, "readonly")
                    .objectStore(dbData.objectStoreNames.SETTINGS)
                    .get(1);

    var results = [];
    request.onsuccess = (event) => {
        console.log('Got settings:', event.target.result);
        // Sending the retrieved data
        let settings = event.target.result;
        properties.forEach((property) => {
            var propValue = settings[property]; 

            if (property == "feedback"){
                // checking the diff between two dates

                var diffTime = Math.abs((new Date()) - (new Date(propValue.createdAt)));
                const diffDays = Math.ceil(diffTime / (1000 * 60)); 
                // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                console.log(diffTime + " milliseconds");
                // console.log(diffDays + " days");

                if (diffTime > appParams.INTERVAL_FEEDBACK){
                    propValue = null;
                }
            }

            results.push(propValue);
            if (!callback){
                sendBackResponse(messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.SETTINGS, {property: property, value: propValue});
            }
        });

        //Executing the callback if exists
        if (callback){
            callback(results);
        }
    };

    request.onerror = (event) => {
        console.log("An error occured when getting the settings data");
    };
}

// Script for providing search chart data

function getViewsTimelineData(chartData){

    let results = [];
    for (let i = 0; i < chartData.length; i++){
        results.push(0);
    }

    // populating the chart data Array
    let cursor = db.transaction(dbData.objectStoreNames.SEARCHES, "readonly").objectStore(dbData.objectStoreNames.SEARCHES).openCursor(null, 'prev');
    cursor.onsuccess = function(event) {
        var cursor = event.target.result;

        if(!cursor) {
            sendBackResponse(messageParams.responseHeaders.PROCESSED_DATA, "views-timeline-chart", results);
            return;
        }

        let searchDate = cursor.value.date.split("T")[0];
        if (typeof chartData[0] == "string"){

            let index = chartData.indexOf(searchDate);

            if (index == -1){
                sendBackResponse(messageParams.responseHeaders.PROCESSED_DATA, "views-timeline-chart", results);
                return;
            }
            
            results[index]++;
        }
        else{ // if object
            searchDate = new Date(searchDate);
            var found = false;
            for (var i = (chartData.length - 1); i >= 0 ; i--){
                if ((new Date((chartData[i]).beg)) < searchDate && searchDate <= (new Date((chartData[i]).end))){
                    results[i]++;
                    found = true;
                }
            }

            if (!found){
                sendBackResponse(messageParams.responseHeaders.PROCESSED_DATA, "views-timeline-chart", results);
                return;
            }
        }
        

        cursor.continue();        
    }

}













// Script for updating any object instance

function updateObject(objectStoreName, objectData){

    switch(objectStoreName){
        case dbData.objectStoreNames.SETTINGS:{
            updateSettingObject(objectData.property, objectData.value);
            break;
        }

        case dbData.objectStoreNames.PROFILES: {
            updateProfileObject(objectData);
            break;
        }
    }

}

// Script for updating a profile object

function updateProfileObject(params){

    let objectStore = db.transaction(dbData.objectStoreNames.PROFILES, "readwrite").objectStore(dbData.objectStoreNames.PROFILES);
    let request = objectStore.get(params.url);

    request.onsuccess = (event) => {
        console.log('Got profile object:', event.target.result);

        let profile = event.target.result;
        for (var i = 0; i < params.properties.length; i++){
            let property = params.properties[i];
            let value = params.values[i];

            profile[property] = value;

            /*switch(property){
                case "": {
                    break;
                }
            };*/
        }

        let updateRequest = objectStore.put(profile);
        updateRequest.onsuccess = (event) => {

            for (var i = 0; i < params.properties.length; i++){

                let property = params.properties[i];
                let value = params.values[i];
                chrome.runtime.sendMessage({header: 'profile-updated', data: {url: params.url, property: property, value: value}}, (response) => {
                  console.log('Update profile response sent', response);
                });

            }
        };

        updateRequest.onerror = (event) => {
            console.log("An error occured when updating the profile with url : ", params.url);
        };

    };

    request.onerror = (event) => {
        // Handle errors!
        console.log("An error occured when retrieving the profile with url : ", params.url);
    };

}

// Script for setting the new date of data reset

function updateSettingObject(propKey, propValue){

    // Retrieving the data first for later update
    let objectStore = db.transaction(dbData.objectStoreNames.SETTINGS, "readwrite").objectStore(dbData.objectStoreNames.SETTINGS);
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

            getSettingsData([propKey]);
        };
    };

    request.onerror = (event) => {
        // Handle errors!
        console.log("An error occured when retrieving the settings for later update")
    };
} 













// Script for sending back responses

function sendBackResponse(action, objectStoreName, data){

    let responseData = {objectStoreName: objectStoreName, objectData: data};

    chrome.runtime.sendMessage({header: action, data: responseData}, (response) => {
      console.log(action + " " , objectStoreName , ' response sent', response, responseData);
    });
}

// Script for processing linkedin data

function processLinkedInData(linkedInData){

    console.log("linkedInData : ", linkedInData);

    if (currentTabCheckContext == "popup"){
        sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_WEB_PAGE_CHECKED, linkedInData);
        // resetting the variable
        currentTabCheckContext = null;
        return;   
    }

    if (!linkedInData){
        console.log("Not a valid linkedin page");
        return;
    }
    
    add_search(linkedInData);

    // checking that the setting allows the injection
    getSettingsData(["notifications", "productID"], (results) => {
        var notificationSetting = results[0];

        if (notificationSetting){

            injectWebApp(results[1]);

        }
    });
}

// Script for injecting web app into the current tab

function injectWebApp(productID){

    chrome.scripting.executeScript({
        target: { tabId: tabID },
        files: ["./assets/web_ui.js"],
    }, () => {

        /*chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {header: messageParams.responseHeaders.WEB_UI_APP_SETTINGS_DATA, data: {productID: results[1]}}, (response) => {
              console.log('On load, productID sent', response);
            });  
        });*/

        chrome.tabs.sendMessage(tabID, {header: messageParams.responseHeaders.WEB_UI_APP_SETTINGS_DATA, data: {productID: productID}}, (response) => {
          console.log('On load, productID sent', response);
        });  

    });

}

// Script handling the message execution

function processMessageEvent(message, sender, sendResponse){

    console.log("Message received : ", message);
    // Script for getting all the searches done so far
    switch(message.header){

        case messageParams.requestHeaders.GET_LIST:{
            // acknowledge receipt
            ack(sendResponse);

            // providing the result
            getList(message.data.objectStoreName, message.data.objectData);
            break;
        }

        case messageParams.requestHeaders.GET_OBJECT:{
            // acknowledge receipt
            ack(sendResponse);

            // providing the result
            getObject(message.data.objectStoreName, message.data.objectData);
            break;
        }

        case messageParams.requestHeaders.ADD_OBJECT:{
            // acknowledge receipt
            ack(sendResponse);

            // providing the result
            addObject(message.data.objectStoreName, message.data.objectData);
            break;
        }

        case messageParams.requestHeaders.UPDATE_OBJECT:{
            // acknowledge receipt
            ack(sendResponse);

            // providing the result
            updateObject(message.data.objectStoreName, message.data.objectData);
            break;
        }

        case messageParams.requestHeaders.DEL_OBJECT:{
            // acknowledge receipt
            ack(sendResponse);

            // providing the result
            deleteObject(message.data.objectStoreName, message.data.objectData);
            break;
        }
        
        case messageParams.requestHeaders.GET_COUNT:{
            // acknowledge receipt
            ack(sendResponse);

            // Providing the keyword count to the front 
            getObjectCount(message.data.objectStoreName, message.data.objectData);
            break;
        }

        case messageParams.requestHeaders.GET_PROCESSED_DATA:{
            // acknowledge receipt
            ack(sendResponse);

            // Saving the new notification setting state
            getProcessedData(message.data.objectStoreName, message.data.objectData);
            break;
        }
        case messageParams.responseHeaders.CS_WEB_PAGE_DATA:{
            // acknowledge receipt
            ack(sendResponse);
            
            // Saving the new notification setting state
            var linkedInData = message.data;
            processLinkedInData(linkedInData);
            break;
        }
        case messageParams.requestHeaders.CS_EXPAND_MODAL_ACTION:{
            // acknowledge receipt
            ack(sendResponse);
            
            // expand modal to a new tab
            chrome.tabs.create({
              active: true,
              url:  'web_ui.html?profile-url-comment-list=true'
            }, null);
            break;
        }

        case messageParams.requestHeaders.CS_NOTIFY_LOAD_ACTION:{
            // acknowledge receipt
            ack(sendResponse);
            
            // notifying the load of the web app
            sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_WEB_PAGE_LOADED, null);
            break;
        }

        case messageParams.requestHeaders.SW_WEB_PAGE_CHECK:{
            // acknowledge receipt
            ack(sendResponse);
            
            currentTabCheckContext = "popup";
            getAndCheckCurrentTab();

            break;
        }

        case messageParams.requestHeaders.SW_WEB_PAGE_ACTIVATION:{
            // acknowledge receipt
            ack(sendResponse);
        
            var productID = message.data.productID;
            injectWebApp(productID);

            // notifying the web app activation
            sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_WEB_PAGE_ACTIVATED, null);

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

    // const linkedInPattern = /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)/gm;

    checkCurrentTab(tab, changeInfo);

};


function checkCurrentTab(tab, changeInfo){

    var url = (changeInfo ? changeInfo.url : tab.url); 
    // console.log("POOOOOOOOOOOO : ", url, testTabUrl(url));
    if (url && testTabUrl(url)) 
    {
        // Starting the verifier script in order to make sure this is a linkedin page
        tabID = tab.id;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["./assets/tab_verifier_cs.js"]
        });

    }
    else{
        if (currentTabCheckContext == "popup"){
            sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_WEB_PAGE_CHECKED, null);
        }
    }
}

// Script for checking the current tab for relevant information
function getAndCheckCurrentTab(){

    // getting current tab

    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
        if (chrome.runtime.lastError)
            console.error(chrome.runtime.lastError);
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        checkCurrentTab(tab);
    });

}

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