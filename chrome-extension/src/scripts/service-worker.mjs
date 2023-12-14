// Script of extension database creation
import { 
  appParams, 
  dbData,
  messageParams,
  ack,
  testTabUrl
} from "../popup/Local_library";
import { v4 as uuidv4 } from 'uuid';

let db = null,
    tabID = null,
    currentTabCheckContext = null;

const dbName = "LinkBeamDB";
const dbVersion = 1;
let timeCountInterval = null;
let tabIds = [];

const settingData = [{
    id: 1,
    notifications: true,
    lastDataResetDate: new Date().toISOString(),
    installedOn: new Date().toISOString(),
    productID: uuidv4(), 
    currentPageTitle: "Activity",
    userIcon: "default",
    timeCount: {value: 0, lastCheck: (new Date()).toISOString()},
    automaticTabOpening: true,
}];


function createDatabase(context) {

    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = function (event) {
        console.log("An error occured when opening the database");

        // notifying the user of this error
        sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_PROCESS_FAILED, null);
    }

    request.onupgradeneeded = function (event) {
        db = event.target.result;

        // Search object store
        let searchObjectStore = db.createObjectStore(dbData.objectStoreNames.SEARCHES, { autoIncrement: true });
        searchObjectStore.createIndex("url", "url", { unique: false });

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

        // NewsFeed object store
        let newsFeedObjectStore = db.createObjectStore(dbData.objectStoreNames.NEWSFEED, { keyPath: "id" });

        newsFeedObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Newsfeed' created.");
        }
    }

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("Database successfully initialized and opened");

        // once, the database obtained, execute the sent request in a runtime context
        if (context.status == "INSTALL"){
            initializeDatabase(context.params.data);
        }

        db.onerror = function (event) {
            console.log("Failed to open database.")
        }
    }
}

// Extension installation script

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {

        // checking if a previous instance already exists before showing the setup page

        dbExists(
            null,
            () => {
                // on install, open a web page for information
                chrome.tabs.create({ url: "install.html" });
            }
        );

        // Setting the process when uninstalling the extension
        chrome.runtime.setUninstallURL(null, () => {
            deleteDatabase();
        });
    }

    if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {

    }
});

// Script for deleting the whole database

function deleteDatabase(onSuccessCallback = null){

    var req = indexedDB.deleteDatabase(dbName);

    req.onsuccess = function () {
        console.log("Deleted database successfully");
        if (onSuccessCallback){
            onSuccessCallback();
        }
    };
    req.onerror = function () {
        console.log("Couldn't delete database");
    };
    req.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
    };

}

// Script for initializing the database

function initializeDatabase(initialData = null){

    if (!initialData){
        // initialize settings
        initSettings();
    }
    else{
        initDBWithData(initialData);
    }
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
        sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_DB_CREATED, null);
      };
    });
}

// Script for intializing the "Setting" object store

function initDBWithData(initialData){

    var objectStoreNames = Object.keys(initialData);

    // removing dbVersion from the list
    objectStoreNames.splice(objectStoreNames.indexOf("dbVersion"), 1);

    recursiveDbInit(objectStoreNames, initialData);

}

function recursiveDbInit(objectStoreNames, initialData){

    if (objectStoreNames.length == 0){
        sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_DB_CREATED, null);
        return;
    }

    var objectStoreName = objectStoreNames[0];
    var objectStoreData = initialData[objectStoreName];

    let objectStoreTransaction = db
        .transaction(objectStoreName, "readwrite");

    for (var rowIndex in objectStoreData){
        var rowData = objectStoreData[rowIndex];
        let request = objectStoreTransaction.objectStore(objectStoreName).add(rowData);
    }   

    objectStoreTransaction.oncomplete = (event) => {
        console.log("Successfull data addition to ["+objectStoreName+"] : ", event);

        objectStoreNames.shift();

        // looping
        recursiveDbInit(objectStoreNames, initialData);
    }; 

    objectStoreTransaction.onerror = () => {
    console.log(`Error adding items`);

    // then, the whole db is deleted for the process to restart
    deleteDatabase(
        onSuccessCallback = () => {
            sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_PROCESS_FAILED, null);
    });

  };

}













function getAssociatedProfiles(objects, objectStoreName, context){

    if (objects.length == 0){
        sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, objectStoreName, {context: context, list: objects});
        return;
    }

    // For each url, create a request to retrieve the corresponding profile
    let objectStore = db
                        .transaction(dbData.objectStoreNames.PROFILES, "readonly")
                        .objectStore(dbData.objectStoreNames.PROFILES);
    let results = [];

    objects.forEach((object) => {
        
        let profileRequest = objectStore.get(object.url);
        profileRequest.onsuccess = (event) => {
            let profile = event.target.result;
            console.log('Got corresponding profile: ', profile);
            
            object.profile = profile;
            results.push(object);

            // keep going to the next object
            if(results.length == objects.length) {
                // only continue if under limit
                sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, objectStoreName, {context: context, list: results});
            }

        };

        profileRequest.onerror = (event) => {
            console.log('An error occured when requesting the corresponding profile : ', event);
        };

    });
}

function getAssociatedSearches(objects, objectStoreName, context){

    if (objects.length == 0){
        sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.SEARCHES, {context: context, list: objects});
        return;
    }

    let results = {list: [], count: 0};
    objects.forEach((profile) => {
        
        getOffsetLimitList(
            {url: profile.url}, 
            dbData.objectStoreNames.SEARCHES, 
            (objects_bis, objectStoreName_bis, context_bis) => {
                for (var search of objects_bis){
                    search.profile = profile;
                }
                results.list = results.list.concat(objects_bis);
                results.count++;
                if (results.count == objects.length){
                    sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.SEARCHES, {context: context, list: results.list});
                }
            }
        );

    });
}

// Script for providing all the bookmarked profiles

function getBookmarkList(params, callback = null){

    if (params){
        callback = (callback ? callback : getAssociatedProfiles);
        getOffsetLimitList(params, dbData.objectStoreNames.BOOKMARKS, callback);
    }
    else{
        getObjectStoreAllData(dbData.objectStoreNames.BOOKMARKS, (results) => {
            // sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.BOOKMARKS, results);
            if (callback){
                callback(results);
            }
        });
    }
    // results.sort((a,b) => (new Date(b.createdOn)) - (new Date(a.createdOn)));

    // request.onerror = (event) => {
    //     console.log("An error occured when retrieving all bookmarks");
    // };

}

// Script for getting all saved searches

function getSearchList(params, callback = null) {

    if (params){
        callback = (callback ? callback : getAssociatedProfiles); // TO BE UPDATED
        getOffsetLimitList(params, dbData.objectStoreNames.SEARCHES, callback);
    }
    else{
        getObjectStoreAllData(dbData.objectStoreNames.SEARCHES, (results) => {
            // sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.SEARCHES, results);
            if (callback){
                callback(results);
            }
        });
    }

}

function getNotificationList(params, callback = null){

    if (params){
        getOffsetLimitList(params, dbData.objectStoreNames.NOTIFICATIONS, callback);
    }
    else{
        getObjectStoreAllData(dbData.objectStoreNames.NOTIFICATIONS, (results) => {
            // sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.NOTIFICATIONS, results);
            if (callback){
                callback(results);
            }
        });
    }

}

function getSettingsList(params, callback = null){

    // if (params){
    //     // callback = (callback ? callback : getAssociatedProfiles); // TO BE UPDATED
    //     getOffsetLimitList(params, dbData.objectStoreNames.SETTINGS, callback);
    // }
    // else{
        getObjectStoreAllData(dbData.objectStoreNames.SETTINGS, (results) => {
            // sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.SETTINGS, results);
            if (callback){
                callback(results);
            }
        });
    // }

}

function getProfileList(params, callback = null) {

    if (params){
        callback = (callback ? callback : getAssociatedSearches); // TO BE UPDATED
        getOffsetLimitList(params, dbData.objectStoreNames.PROFILES, callback);
    }
    else{
        getObjectStoreAllData(dbData.objectStoreNames.PROFILES, (results) => {
            // sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.PROFILES, results);
            if (callback){
                callback(results);
            }
        });
    }

}


function getOffsetLimitList(params, objectStoreName, callback) {


    var params = (params ? params : {});
    params.timePeriod = (params.timePeriod ? params.timePeriod : null);
    params.offset = (params.offset ? params.offset : 0);
    // params.inArea = (params.timePeriod ? [false, false] : null);

    let results = [];
    var offsetApplied = false;
    let cursor = db.transaction(objectStoreName, "readonly").objectStore(objectStoreName).openCursor(null, 'prev');
    cursor.onsuccess = function(event) {
        let cursor = event.target.result;
        
        if(!cursor) {
            callback(results, objectStoreName, params.context);
            return;
        }

        if(params.offset != 0 && !offsetApplied) {
          offsetApplied = true;
          cursor.advance(params.offset);
          return;
        }

        let object = cursor.value;
        var output = addToOffsetLimitList(object, results, objectStoreName, params);
        results = output.list;

        // if an argument about a specific time is not passed then
        if (output.stop){
            callback(results, objectStoreName, params.context);
            return;
        }
        
        cursor.continue();
    }

    cursor.onerror = (event) => {
        console.log("Failed to acquire the cursor !");
    };
}

function addReminderToOffsetLimitList(object, list, objectStoreName, params){

    var stop = false;
    // if the user is requesting all the reminders set for today then only activated reminders are selected
    if (params.context == "Notifications"){
        if (object.activated && (new Date()).toISOString().split("T")[0] == object.date.split("T")[0]){
            list.push(object);
        }
    }
    else{
        if (!params.timePeriod){
            list.push(object);
        }
        else{
            if (typeof params.timePeriod == "string"){ // a specific date
                if (params.timePeriod.split("T")[0] == object.date.split("T")[0]){
                    list.push(object);
                }
            }
            else{
                if (params.timePeriod.length == 3 && params.timePeriod.indexOf("to") == 1){
                    var objectDate = (new Date(object.date)),
                        startDate = new Date(params.timePeriod[0]),
                        endDate = new Date(params.timePeriod[2]);
                    if (startDate <= objectDate && objectDate <= endDate){
                        list.push(object);
                    }
                }
            }            
        }
    }

    return {list: list, stop: stop};

}

function addSearchToOffsetLimitList(object, list, objectStoreName, params){

    var stop = false;
    if (!params.timePeriod){
        if (params.url){
            if (params.url == object.url){
                list.push(object);
            }
        }
        else{ // list previous day searches
            if (list.length == 0 || list[0].date.split("T")[0] == object.date.split("T")[0]){
                list.push(object);
            }
            else{
                if (list[0].date.split("T")[0] != object.date.split("T")[0]){
                    stop = true;
                }
            }
        } 
    }
    else{
        if (typeof params.timePeriod == "string"){ // a specific date
            if (params.timePeriod.split("T")[0] == object.date.split("T")[0]){
                list.push(object);
            }
        }
        else{
            if (params.timePeriod.length == 3 && params.timePeriod.indexOf("to") == 1){
                var objectDate = (new Date(object.date)),
                    startDate = new Date(params.timePeriod[0]),
                    endDate = new Date(params.timePeriod[2]);
                if (startDate <= objectDate && objectDate <= endDate){
                    list.push(object);
                }
            }
        }            
    }

    return {list: list, stop: stop}; 

}

function addProfileToOffsetLimitList(object, list, objectStoreName, params){

    var stop = false;
    
    if (params.context.indexOf("search") >= 0){
        var searchTextIndex = object.fullName.toLowerCase().indexOf(params.searchText.toLowerCase());
        if (searchTextIndex >= 0){
            var fullName = object.fullName.slice(0, searchTextIndex);
            fullName += '<span class="border rounded shadow-sm bg-info-subtle text-muted border-primary">'+object.fullName.slice(searchTextIndex, searchTextIndex + params.searchText.length)+'</span>';
            fullName += object.fullName.slice(searchTextIndex + params.searchText.length);
            object.fullName = fullName;
            list.push(object);
        }
    }
    else{
        if (params.timePeriod){
            if (typeof params.timePeriod == "string"){ // a specific date
                if (params.timePeriod.split("T")[0] == object.date.split("T")[0]){
                    list.push(object);
                }
            }
            else{
                if (params.timePeriod.length == 3 && params.timePeriod.indexOf("to") == 1){
                    var objectDate = (new Date(object.date)),
                        startDate = new Date(params.timePeriod[0]),
                        endDate = new Date(params.timePeriod[2]);
                    if (startDate <= objectDate && objectDate <= endDate){
                        list.push(object);
                    }
                }
            }  
        }
    }

    return {list: list, stop: stop}; 

}

function addBookmarkToOffsetLimitList(object, list, objectStoreName, params){

    var stop = false;
    
    if (!params.timePeriod){
        list.push(object);
    }
    else{
        if (typeof params.timePeriod == "string"){ // a specific date
            if (params.timePeriod.split("T")[0] == object.createdOn.split("T")[0]){
                list.push(object);
            }
        }
        else{
            if (params.timePeriod.length == 3 && params.timePeriod.indexOf("to") == 1){
                var objectDate = (new Date(object.createdOn)),
                    startDate = new Date(params.timePeriod[0]),
                    endDate = new Date(params.timePeriod[2]);
                if (startDate <= objectDate && objectDate <= endDate){
                    list.push(object);
                }
            }
        }            
    }

    return {list: list, stop: stop}; 

}

function addKeywordToOffsetLimitList(object, list, objectStoreName, params){

    var stop = false;
    
    if (!params.timePeriod){
        list.push(object);
    }
    else{
        if (typeof params.timePeriod == "string"){ // a specific date
            if (params.timePeriod.split("T")[0] == object.createdOn.split("T")[0]){
                list.push(object);
            }
        }
        else{
            if (params.timePeriod.length == 3 && params.timePeriod.indexOf("to") == 1){
                var objectDate = (new Date(object.createdOn)),
                    startDate = new Date(params.timePeriod[0]),
                    endDate = new Date(params.timePeriod[2]);
                if (startDate <= objectDate && objectDate <= endDate){
                    list.push(object);
                }
            }
        }            
    }

    return {list: list, stop: stop}; 

}

function addNotificationToOffsetLimitList(object, list, objectStoreName, params){

    var stop = false;
    
    if (!params.timePeriod){
        list.push(object);
    }
    else{
        if (typeof params.timePeriod == "string"){ // a specific date
            if (params.timePeriod.split("T")[0] == object.date.split("T")[0]){
                list.push(object);
            }
        }
        else{
            if (params.timePeriod.length == 3 && params.timePeriod.indexOf("to") == 1){
                var objectDate = (new Date(object.date)),
                    startDate = new Date(params.timePeriod[0]),
                    endDate = new Date(params.timePeriod[2]);
                if (startDate <= objectDate && objectDate <= endDate){
                    list.push(object);
                }
            }
        }            
    }

    return {list: list, stop: stop}; 

}

function addNewsFeedToOffsetLimitList(object, list, objectStoreName, params){

    var stop = false;
    
    if (!params.timePeriod){
        list.push(object);
    }
    else{
        if (typeof params.timePeriod == "string"){ // a specific date
            if (params.timePeriod.split("T")[0] == object.date.split("T")[0]){
                list.push(object);
            }
        }
        else{
            if (params.timePeriod.length == 3 && params.timePeriod.indexOf("to") == 1){
                var objectDate = (new Date(object.date)),
                    startDate = new Date(params.timePeriod[0]),
                    endDate = new Date(params.timePeriod[2]);
                if (startDate <= objectDate && objectDate <= endDate){
                    list.push(object);
                }
            }
        }            
    }

    return {list: list, stop: stop}; 

}

function addToOffsetLimitList(object, list, objectStoreName, params){

    var result = null;
    switch(objectStoreName){
        case dbData.objectStoreNames.REMINDERS:{
            result = addReminderToOffsetLimitList(object, list, objectStoreName, params);
            break;
        }

        case dbData.objectStoreNames.PROFILES:{
            result = addProfileToOffsetLimitList(object, list, objectStoreName, params);
            break;
        }

        case dbData.objectStoreNames.SEARCHES:{
            result = addSearchToOffsetLimitList(object, list, objectStoreName, params);
            break;
        }

        case dbData.objectStoreNames.BOOKMARKS:{
            result = addBookmarkToOffsetLimitList(object, list, objectStoreName, params);
            break;
        }

        case dbData.objectStoreNames.KEYWORDS:{
            result = addKeywordToOffsetLimitList(object, list, objectStoreName, params);
            break;
        }

        case dbData.objectStoreNames.NOTIFICATIONS:{
            result = addNotificationToOffsetLimitList(object, list, objectStoreName, params);
            break;
        }

        case dbData.objectStoreNames.NEWSFEED:{
            result = addNewsFeedToOffsetLimitList(object, list, objectStoreName, params);
            break;
        }

    }    

    return result;
}


// Script for getting all saved reminders

function getReminderList(params, callback = null) {

    if (params){
        callback = (callback ? callback : getAssociatedProfiles);
        getOffsetLimitList(params, dbData.objectStoreNames.REMINDERS, callback);
    }
    else{
        getObjectStoreAllData(dbData.objectStoreNames.REMINDERS, (results) => {
            // sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.REMINDERS, results);
            if (callback){
                callback(results);
            }
        });
    }

}

// Script for getting all saved keywords

function getKeywordList(params, callback = null) {

    if (params){
        getOffsetLimitList(params, dbData.objectStoreNames.KEYWORDS, callback);
    }
    else{
        getObjectStoreAllData(dbData.objectStoreNames.KEYWORDS, (results) => {
            // sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.KEYWORDS, results);
            if (callback){
                callback(results);
            }
        });
    }
}

// Script for getting the newsfeed

function getNewsFeedList(params, callback = null) {

    if (params){
        getOffsetLimitList(params, dbData.objectStoreNames.NEWSFEED, callback);
    }
    else{
        getObjectStoreAllData(dbData.objectStoreNames.NEWSFEED, (results) => {
            // sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.NEWSFEED, results);
            if (callback){
                callback(results);
            }
        });
    }
}

// Script for getting all db data

function getMyData(params){

    const data = db.objectStoreNames;
    var results = {dbVersion: dbVersion}, objectStoreNames = [];

    for (var key in data){
        if (typeof data[key] === "string"){
            objectStoreNames.push(data[key]);
        }
    }

    getObjectStoresSpecifiedData(objectStoreNames, results, params);

}

function getObjectStoresSpecifiedData(objectStoreNames, results, params){

    if (objectStoreNames.length == 0){
        // Sending the data back to the content script
        sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, "all", results);
        return;
    }

    var objectStoreName = objectStoreNames[0];

    const callback = (objects) => {

        console.log('Got the specified data ['+objectStoreName+']:', objects);
        // Sending the retrieved data
        results[objectStoreName] = objects;

        objectStoreNames.shift();

        // looping back
        getObjectStoresSpecifiedData(objectStoreNames, results, params);

    };

    var reqParams = (params ? { ...params } : null);
    getList(objectStoreName, reqParams, callback);

}

function getObjectStoreAllData(objectStoreName, callback = null){

    let request = db
        .transaction(objectStoreName, "readonly")
        .objectStore(objectStoreName)
        .getAll();

    request.onsuccess = (event) => {
        var objects = event.target.result;
        if (callback){
            callback(objects);
        }
    };

    request.onerror = (event) => {
        console.log("An error occured when retrieving all data of ["+objectStoreName+"] : ", event);
    };

}

// Script for getting any objectStore list

function getList(objectStoreName, objectData, callback = null){

    switch(objectStoreName){
        case dbData.objectStoreNames.SEARCHES:{
            getSearchList(objectData, callback);
            break;
        }

        case dbData.objectStoreNames.BOOKMARKS:{
            getBookmarkList(objectData, callback);
            break;
        }

        case dbData.objectStoreNames.KEYWORDS:{
            getKeywordList(objectData, callback);
            break;
        }

        case dbData.objectStoreNames.REMINDERS:{
            getReminderList(objectData, callback);
            break;
        }

        case dbData.objectStoreNames.NEWSFEED:{
            getNewsFeedList(objectData, callback);
            break;
        }

        case dbData.objectStoreNames.PROFILES:{
            getProfileList(objectData, callback);
            break;
        }

        case dbData.objectStoreNames.NOTIFICATIONS:{
            getNotificationList(objectData, callback);
            break;
        }

        case dbData.objectStoreNames.SETTINGS:{
            getSettingsList(objectData, callback);
            break;
        }

        case "all":{
            getMyData(objectData);
            break;
        }
    }

}













// Script for count any object store elements

function getObjectCount(objectStoreName, objectData){

    var request = db
                .transaction(objectStoreName, "readonly")
                .objectStore(objectStoreName)
                .count();
    request.onsuccess = (event) => {
        console.log('Got '+objectStoreName+' count:', event.target.result);
        // Sending the retrieved data
        var result = event.target.result;
        sendBackResponse(messageParams.responseHeaders.OBJECT_COUNT, objectStoreName, result);
    };

    request.onerror = (event) => {
        console.log("An error occured when counting "+objectStoreName+" : ", event);
    };

}













// Script for adding a new search

function add_search(search) {

    console.log("Initiating insertion");

    if (search.profile == undefined){
        return;
    }

    add_profile_data(search.profile, search);

}

function add_search_data(searchData){

    delete searchData.profile;
    delete searchData.codeInjected;

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
    reminder.activated = true;

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

// Function for adding a profile object

function addProfileObject(profile, callback = null){

    // then adding the given profile into the database
    const objectStore = db.transaction(dbData.objectStoreNames.PROFILES, "readwrite").objectStore(dbData.objectStoreNames.PROFILES);
    const request = objectStore.add(profile);
    request.onsuccess = (event) => {
        console.log("New profile added");
        if (callback){
            callback();
        }
    };

    request.onerror = (event) => {
        console.log("An error occured when adding a new profile");
    };

}

// Function for updating a profile object

function updateProfileObject(profile, callback = null){

    // then adding the given profile into the database
    const objectStore = db.transaction(dbData.objectStoreNames.PROFILES, "readwrite").objectStore(dbData.objectStoreNames.PROFILES);
    const request = objectStore.put(profile);
    request.onsuccess = (event) => {
        console.log("Profile updated");
        if (callback){
            callback();
        }
    };

    request.onerror = (event) => {
        console.log("An error occured when updating a new profile");
    };

}

// Script for adding the new profile

function add_profile_data(profile, search){

    // checking first that a profile with the same id doesn't exist yet
    let objectStore = db.transaction(dbData.objectStoreNames.PROFILES, "readwrite").objectStore(dbData.objectStoreNames.PROFILES);
    let request = objectStore.get(profile.url);

    request.onsuccess = (event) => {
        console.log('Got profile:', event.target.result);

        if (event.target.result){
            
            updateProfileObject(profile, () => {
                // then add the search object
                add_search_data(search);
            });
            
        }
        else{

            addProfileObject(profile, () => {
                add_search_data(search);
            });

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

    var objectStoreName = objectStoreNames[0];

    const objectStore = db.transaction(objectStoreName, "readwrite").objectStore(objectStoreName);
    objectStore.clear().onsuccess = (event) => {
        // Clearing the next objectStore
        // getList(objectStoreName, null);
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

        case dbData.objectStoreNames.REMINDERS:{
            getReminderObject(objectData);
            break;
        }

        case "feedback": {
            getFeedbackData(objectData);
            break;
        }
    }

}

// Script for getting a specific reminder object

function getReminderObject(params){

    var url = params.url;

    let objectStore = db.transaction(dbData.objectStoreNames.REMINDERS, "readonly").objectStore(dbData.objectStoreNames.REMINDERS);
    let request = objectStore.get(url);

    request.onsuccess = (event) => {

        let reminder = event.target.result;
        sendBackResponse(messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.REMINDERS, reminder);
        
    };

    request.onerror = (event) => {
        // Handle errors!
        console.log("An error occured when retrieving the reminder with url : ", profile.url);
    };

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
    for (let i = 0; i < chartData.labelValues.length; i++){
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

        let searchObject = cursor.value;
        let searchDate = searchObject.date.split("T")[0];
        if (typeof chartData.labelValues[0] == "string"){

            let index = chartData.labelValues.indexOf(searchDate);

            if (index == -1){
                sendBackResponse(messageParams.responseHeaders.PROCESSED_DATA, "views-timeline-chart", results);
                return;
            }
            
            if (chartData.specificUrl){
                if (searchObject.url == chartData.specificUrl){
                    results[index]++;
                }
            }
            else{
                results[index]++;
            }
            
        }
        else{ // if object
            searchDate = new Date(searchDate);
            var found = false;
            for (var i = (chartData.labelValues.length - 1); i >= 0 ; i--){
                if ((new Date((chartData.labelValues[i]).beg)) < searchDate && searchDate <= (new Date((chartData.labelValues[i]).end))){
                    if (chartData.specificUrl){
                        if (searchObject.url == chartData.specificUrl){
                            results[i]++;
                        }
                    }
                    else{
                        results[i]++;
                    }
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
            // updateProfileObject(objectData);
            break;
        }

    case dbData.objectStoreNames.REMINDERS: {
            updateReminderObject(objectData);
            break;
        }
    }

}


// Function for updating reminder objects
function updateReminderObject(params){

    if (/*typeof params.criteria === "string" &&*/ params.criteria == "today"){
        deactivateTodayReminders();
        return;
    }

    // else
}

function deactivateTodayReminders(){

    let objectStore = db.transaction(dbData.objectStoreNames.REMINDERS, "readwrite").objectStore(dbData.objectStoreNames.REMINDERS);
    let cursor = objectStore.openCursor(null, 'prev');
    cursor.onsuccess = function(event) {
        let cursor = event.target.result;
        
        if(!cursor) {
            return;
        }

        let object = cursor.value;

        if ((new Date()).toISOString().split("T")[0] != object.date.split("T")[0]){
            cursor.continue();
        }

        object.activated = false;
        let requestUpdate = objectStore.put(object);
        requestUpdate.onerror = (event) => {
            // Do something with the error
            console.log("An error occured when updating reminder "+object.url+" !");
        };
        requestUpdate.onsuccess = (event) => {
            // Success - the data is updated!
            console.log("Reminder "+object.url+" update processed successfully !");
        };
        
        cursor.continue();
    }

    cursor.onerror = (event) => {
        console.log("Failed to acquire the cursor !");
        sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_PROCESS_FAILED, null);
    };

}

// Script for updating a profile object

// function updateProfileObject(params){

//     let objectStore = db.transaction(dbData.objectStoreNames.PROFILES, "readwrite").objectStore(dbData.objectStoreNames.PROFILES);
//     let request = objectStore.get(params.url);

//     request.onsuccess = (event) => {
//         console.log('Got profile object:', event.target.result);

//         let profile = event.target.result;
//         for (var i = 0; i < params.properties.length; i++){
//             let property = params.properties[i];
//             let value = params.values[i];

//             profile[property] = value;

//             /*switch(property){
//                 case "": {
//                     break;
//                 }
//             };*/
//         }

//         let updateRequest = objectStore.put(profile);
//         updateRequest.onsuccess = (event) => {

//             for (var i = 0; i < params.properties.length; i++){

//                 let property = params.properties[i];
//                 let value = params.values[i];
//                 chrome.runtime.sendMessage({header: 'profile-updated', data: {url: params.url, property: property, value: value}}, (response) => {
//                   console.log('Update profile response sent', response);
//                 });

//             }
//         };

//         updateRequest.onerror = (event) => {
//             console.log("An error occured when updating the profile with url : ", params.url);
//         };

//     };

//     request.onerror = (event) => {
//         // Handle errors!
//         console.log("An error occured when retrieving the profile with url : ", params.url);
//     };

// }

// Script for setting the new date of data reset

function updateSettingObject(propKey, propValue, callback = null){

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

            if (callback){
                callback();
                return;
            }

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

        case messageParams.requestHeaders.SW_CREATE_DB:{

            // acknowledge receipt
            ack(sendResponse);

            var data = message.data;

            // on install, create the database
            createDatabase({status: "INSTALL", params:{data: data}});

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

function timeCountIntervalFunction(){

    getSettingsData(["timeCount"], (results) => {
        var timeCount = results[0],
            lastCheck = new Date();
        timeCount.value += (lastCheck - (new Date(timeCount.lastCheck))) / 1000;
        timeCount.lastCheck = lastCheck;
        updateSettingObject("timeCount", timeCount);
    });

} 

// Script for starting the time counter
function startTimeCounter(){

    // start counting the time spent on the tab
    getSettingsData(["timeCount"], (results) => {
        var timeCount = results[0];
        timeCount.lastCheck = (new Date()).toISOString();
        updateSettingObject("timeCount", timeCount, () => {

            timeCountInterval = setInterval(timeCountIntervalFunction, appParams.TIMER_VALUE);

        });

    });

}


function checkCurrentTab(tab, changeInfo){

    var url = (changeInfo ? changeInfo.url : tab.url); 
    // console.log("POOOOOOOOOOOO : ", url, testTabUrl(url));
    if (url && testTabUrl(url)) 
    {

        if (currentTabCheckContext != "popup"){
            startTimeCounter();
        }

        if (tabIds.indexOf(tab.id) == -1){
            tabIds.push(tab.id);
        }

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

    // acknowledge receipt
    ack(sendResponse);

    dbExists(
        () => {

            processMessageEvent(message, sender, sendResponse);

        },
        () => {

            if (message.header != messageParams.requestHeaders.SW_CREATE_DB){
                sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_DB_NOT_CREATED_YET, null);
                return;
            }
            
            processMessageEvent(message, sender, sendResponse);

        }
    );

});

// Function for checking if the db already exists

function dbExists(onExistStatus = null, onNotExistStatus = null){

    // initialize db object
    // var dbExists = true;
    var request = indexedDB.open(dbName);
    request.onupgradeneeded = function (e){
        e.target.transaction.abort();
        // dbExists = false;
        if (onNotExistStatus){
            onNotExistStatus();
        }
    }

    request.onsuccess = function (event) {
        db = event.target.result;

        if (onExistStatus){
            onExistStatus();
        }

        db.onerror = function (event) {
            console.log("Failed to open database.")
        }
    }

}

// Script for listening to all tab updates

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    // check first if the app has been correctly set up before proceeding
    dbExists(
        () => {
            processTabEvent(tabId, changeInfo, tab);
        },
        () => {
            // then nothing is done
        }
    );

  }
);

chrome.tabs.onActivated.addListener(function(activeInfo) {
    // console.log(activeInfo.tabId);

    if (tabIds.indexOf(activeInfo.tabId) >= 0){

        startTimeCounter();

    }
    else{

        // resetting the interval
        if (timeCountInterval){
            clearInterval(timeCountInterval);
            timeCountInterval = null;
        }

    }

});