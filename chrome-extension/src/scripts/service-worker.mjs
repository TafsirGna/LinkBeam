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
    currentPageTitle: appParams.COMPONENT_CONTEXT_NAMES.HOME,
    userIcon: "default",
    timeCount: {value: 0, lastCheck: (new Date()).toISOString()},
    autoTabOpening: true,
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
        let searchObjectStore = db.createObjectStore(dbData.objectStoreNames.SEARCHES, { keyPath: 'id', autoIncrement: true });
        searchObjectStore.createIndex("url", "url", { unique: false });
        // searchObjectStore.createIndex("urlIndex", "url", { unique: false });

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
        let notificationObjectStore = db.createObjectStore(dbData.objectStoreNames.NOTIFICATIONS, { keyPath: "id", autoIncrement: true  });

        notificationObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Notification' created.");
        }

        // bookmarks object store
        let bookmarkObjectStore = db.createObjectStore(dbData.objectStoreNames.BOOKMARKS, { keyPath: "url" });

        bookmarkObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Bookmark' created.");
        }

        // Profile_Activity object store
        let profileActivityObjectStore = db.createObjectStore(dbData.objectStoreNames.PROFILE_ACTIVITY, { keyPath: "id", autoIncrement: true });

        profileActivityObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Profile Activity' created.");
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

    console.log("''''''''''''''''' : ", objectStoreName);

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

    objectStoreTransaction.onerror = (event) => {
    console.log(`Error adding items`, event);

    // then, the whole db is deleted for the process to restart
    deleteDatabase(
        () => {
            sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_PROCESS_FAILED, null);
        }
    );

  };

}













function getAssociatedProfiles(objects, callback){

    if (objects.length == 0){
        callback(objects);
        return;
    }

    // For each url, create a request to retrieve the corresponding profile
    let objectStore = db
                        .transaction(dbData.objectStoreNames.PROFILES, "readonly")
                        .objectStore(dbData.objectStoreNames.PROFILES);
    let results = [];

    const pairObjectProfile = (objects) => {

        if (objects.length == 0){
            callback(results);
            return;
        }

        var object  = objects[0];
        var params = {
            context: "only_object",
            criteria: {
                props: {
                    url: object.url,
                }
            }
        }
        getProfileObject(params, (profile) => {

            object.profile = profile;
            results.push(object);

            objects.shift();
            pairObjectProfile(objects);

        });

    };

    pairObjectProfile(objects);
}

function getAssociatedSearches(objects, callback){

    if (objects.length == 0){
        callback(objects);
        return;
    }

    let results = [];
    let objectStore = db
                        .transaction(dbData.objectStoreNames.SEARCHES, "readonly")
                        .objectStore(dbData.objectStoreNames.SEARCHES);
    let index = objectStore.index("url");

    const pairProfileSearches = (profiles) => {

        if (profiles.length == 0){
            callback(results);
            return;
        }

        var profile  = profiles[0];
        index.openCursor(IDBKeyRange.only(profile.url)).onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                var search = cursor.value;
                search.profile = profile;
                results.push(search);
                cursor.continue();
            } else {
                // console.log("Entries all displayed.");
                profiles.shift();
                pairProfileSearches(profiles);
            }
        };

    };

    pairProfileSearches(objects);

}

// Script for providing all the bookmarked profiles

function getBookmarkList(params, callback){

    if (Object.hasOwn(params, 'criteria')){
        var filteredCallback = callback;
        if (["data_export", "data_deletion"].indexOf(params.context) == -1){
            filteredCallback = (objects) => {
                getAssociatedProfiles(objects, callback);
            }
        }
        getFilteredList(params, dbData.objectStoreNames.BOOKMARKS, filteredCallback);
    }
    else{

        var allCallback = callback;
        if (["data_export", "data_deletion"].indexOf(params.context) == -1){
            allCallback = (objects) => {
                getAssociatedProfiles(objects, callback);
            }
        }

        getObjectStoreAllData(dbData.objectStoreNames.BOOKMARKS, (results) => {
            allCallback(results);
        });

    }

}

// Script for getting all saved searches

function getSearchList(params, callback) {

    if (Object.hasOwn(params, 'criteria')){
        var filteredCallback = callback;
        if (["data_export", "data_deletion"].indexOf(params.context) == -1){
            filteredCallback = (objects) => {
                getAssociatedProfiles(objects, callback);
            }
        }
        getFilteredList(params, dbData.objectStoreNames.SEARCHES, filteredCallback);
    }
    else{
        getObjectStoreAllData(dbData.objectStoreNames.SEARCHES, (results) => {
            callback(results);
        });
    }

}

function getNotificationList(params, callback){

    if (Object.hasOwn(params, 'criteria')){
        getFilteredList(params, dbData.objectStoreNames.NOTIFICATIONS, callback);
    }
    else{
        getObjectStoreAllData(dbData.objectStoreNames.NOTIFICATIONS, (results) => {
            callback(results);
        });
    }

}

function getProfileList(params, callback) {

    if (Object.hasOwn(params, 'criteria')){
        var filteredCallback = callback;
        if (["data_export", "data_deletion"].indexOf(params.context) == -1){
            filteredCallback = (objects) => {
                getAssociatedSearches(objects, callback);
            }
        }
        getFilteredList(params, dbData.objectStoreNames.PROFILES, filteredCallback);
    }
    else{
        getObjectStoreAllData(dbData.objectStoreNames.PROFILES, (results) => {
            callback(results);
        });
    }

}


function getFilteredList(params, objectStoreName, callback) {

    params.criteria.props = (Object.hasOwn(params.criteria, 'props') ? params.criteria.props : null);
    params.criteria.offset = (Object.hasOwn(params.criteria, 'offset') ? params.criteria.offset : 0);

    let results = [];
    var offsetApplied = false;
    let cursor = db.transaction(objectStoreName, "readonly").objectStore(objectStoreName).openCursor(null, 'prev');
    cursor.onsuccess = function(event) {
        let cursor = event.target.result;
        
        if(!cursor) {
            callback(results);
            return;
        }

        if(params.criteria.offset != 0 && !offsetApplied) {
          offsetApplied = true;
          cursor.advance(params.criteria.offset);
          return;
        }

        let object = cursor.value;
        var output = addToFilteredList(object, results, objectStoreName, params);
        results = output.list;

        // if an argument about a specific time is not passed then
        if (output.stop){
            callback(results);
            return;
        }
        
        cursor.continue();
    }

    cursor.onerror = (event) => {
        console.log("Failed to acquire the cursor !");
    };
}

function isObjectActionable(object, prop, critValue){

    if (["createdOn", "date"].indexOf(prop)){

        if (typeof critValue == "string"){ // a specific date
            if (critValue.split("T")[0] == object[prop].split("T")[0]){
                return true;
            }
        }
        else{
            if (critValue.length == 3 && critValue.indexOf("to") == 1){
                var objectDate = (new Date(object[prop])),
                    startDate = new Date(critValue[0]),
                    endDate = new Date(critValue[2]);
                if (startDate <= objectDate && objectDate <= endDate){
                    return true;
                }
            }
        }  

    }

    return false;

}

function addToFilteredReminderList(object, list, objectStoreName, params){

    var stop = false;

    if (params.criteria.props){
        if (Object.hasOwn(params.criteria.props, "createdOn") || Object.hasOwn(params.criteria.props, "date")){
            var date = Object.hasOwn(params.criteria.props, "createdOn") ? params.criteria.props.createdOn : null;
            if (isObjectActionable(object, "createdOn", date)){
                list.push(object);
            }
        }
        if (Object.hasOwn(params.criteria.props, "text")){
            var searchText = params.criteria.props.text;
            var searchTextIndex = object.text.toLowerCase().indexOf(searchText.toLowerCase());
            if (searchTextIndex >= 0){
                var text = object.text.slice(0, searchTextIndex);
                text += '<span class="border rounded shadow-sm bg-info-subtle text-muted border-primary">'+object.text.slice(searchTextIndex, searchTextIndex + searchText.length)+'</span>';
                text += object.text.slice(searchTextIndex + searchText.length);
                object.text = text;
                list.push(object);
            }
        }
    }
    else{
        list.push(object);
    }

    return {list: list, stop: stop};

}

function addToFilteredSearchList(object, list, objectStoreName, params){

    var stop = false;

    if (params.criteria.props){
        if (Object.hasOwn(params.criteria.props, "date")){
            var date = params.criteria.props.date;
            if (isObjectActionable(object, "date", date)){
                list.push(object);
            }
        }
    }
    else{
        if (list.length == 0 || list[0].date.split("T")[0] == object.date.split("T")[0]){
            list.push(object);
        }
        else{
            if (list[0].date.split("T")[0] != object.date.split("T")[0]){
                stop = true;
            }
        }
    }

    return {list: list, stop: stop}; 

}

function addToFilteredProfileList(object, list, objectStoreName, params){

    var stop = false;

    if (params.criteria.props){
        if (Object.hasOwn(params.criteria.props, "fullName")){
            var searchText = params.criteria.props.fullName;
            var searchTextIndex = object.fullName.toLowerCase().indexOf(searchText.toLowerCase());
            if (searchTextIndex >= 0){
                var fullName = object.fullName.slice(0, searchTextIndex);
                fullName += '<span class="border rounded shadow-sm bg-info-subtle text-muted border-primary">'+object.fullName.slice(searchTextIndex, searchTextIndex + searchText.length)+'</span>';
                fullName += object.fullName.slice(searchTextIndex + searchText.length);
                object.fullName = fullName;
                list.push(object);
            }
        }
        else if (Object.hasOwn(params.criteria.props, "date")){
            var date = params.criteria.props.date;
            if (isObjectActionable(object, "date", date)){
                list.push(object);
            }
        }
    }

    return {list: list, stop: stop}; 

}

function addToFilteredBookmarkList(object, list, objectStoreName, params){

    var stop = false;

    if (params.criteria.props){
        if (Object.hasOwn(params.criteria.props, "createdOn") || Object.hasOwn(params.criteria.props, "date")){
            var date = Object.hasOwn(params.criteria.props, "createdOn") ? params.criteria.props.createdOn : null;
            date = date ? date : params.criteria.props.date;
            if (isObjectActionable(object, "createdOn", date)){
                list.push(object);
            }
        }
    }
    else{
        list.push(object);
    }

    return {list: list, stop: stop}; 

}

function addToFilteredKeywordList(object, list, objectStoreName, params){

    var stop = false;
    
    if (params.criteria.props){
        if (Object.hasOwn(params.criteria.props, "createdOn") || Object.hasOwn(params.criteria.props, "date")){
            var date = Object.hasOwn(params.criteria.props, "createdOn") ? params.criteria.props.createdOn : null;
            if (isObjectActionable(object, "createdOn", date)){
                list.push(object);
            }
        }
    }
    else{
        list.push(object);
    }

    return {list: list, stop: stop}; 

}

function addToFilteredNotificationList(object, list, objectStoreName, params){

    var stop = false;
    
    if (params.criteria.props){
        if (Object.hasOwn(params.criteria.props, "date")){
            var date = params.criteria.props.date;
            if (isObjectActionable(object, "date", date)){
                list.push(object);
            }
        }
    }
    else{
        list.push(object);
    }

    return {list: list, stop: stop}; 

}

function addToFilteredProfileActivityList(object, list, objectStoreName, params){

    var stop = false;
    
    if (params.criteria.props){
        if (Object.hasOwn(params.criteria.props, "date")){
            var date = params.criteria.props.date;
            if (isObjectActionable(object, "date", date)){
                list.push(object);
            }
        }
    }
    else{
        list.push(object);
    }

    return {list: list, stop: stop}; 

}

function addToFilteredList(object, list, objectStoreName, params){

    var result = null;
    switch(objectStoreName){
        case dbData.objectStoreNames.REMINDERS:{
            result = addToFilteredReminderList(object, list, objectStoreName, params);
            break;
        }

        case dbData.objectStoreNames.PROFILES:{
            result = addToFilteredProfileList(object, list, objectStoreName, params);
            break;
        }

        case dbData.objectStoreNames.SEARCHES:{
            result = addToFilteredSearchList(object, list, objectStoreName, params);
            break;
        }

        case dbData.objectStoreNames.BOOKMARKS:{
            result = addToFilteredBookmarkList(object, list, objectStoreName, params);
            break;
        }

        case dbData.objectStoreNames.KEYWORDS:{
            result = addToFilteredKeywordList(object, list, objectStoreName, params);
            break;
        }

        case dbData.objectStoreNames.NOTIFICATIONS:{
            result = addToFilteredNotificationList(object, list, objectStoreName, params);
            break;
        }

        case dbData.objectStoreNames.PROFILE_ACTIVITY:{
            result = addToFilteredProfileActivityList(object, list, objectStoreName, params);
            break;
        }

    }    

    return result;
}


// Script for getting all saved reminders

function getReminderList(params, callback) {

    if (Object.hasOwn(params, 'criteria')){
        var filteredCallback = callback;
        if (["data_export", "data_deletion"].indexOf(params.context) == -1){
            filteredCallback = (objects) => {
                getAssociatedProfiles(objects, callback);
            }
        }
        getFilteredList(params, dbData.objectStoreNames.REMINDERS, filteredCallback);
    }
    else{

        var allCallback = callback;
        if (["data_export", "data_deletion"].indexOf(params.context) == -1){
            allCallback = (objects) => {
                getAssociatedProfiles(objects, callback);
            }
        }

        getObjectStoreAllData(dbData.objectStoreNames.REMINDERS, (results) => {
            allCallback(results);
        });
    }

}

// Script for getting all saved keywords

function getKeywordList(params, callback) {

    if (Object.hasOwn(params, 'criteria')){
        getFilteredList(params, dbData.objectStoreNames.KEYWORDS, callback);
    }
    else{
        getObjectStoreAllData(dbData.objectStoreNames.KEYWORDS, (results) => {
            results.sort((a,b) => (new Date(b.createdOn)) - (new Date(a.createdOn)));
            callback(results);
        });
    }
}

// Script for getting all the profile's activities

function getProfileActivityList(params, callback) {

    if (Object.hasOwn(params, 'criteria')){
        getFilteredList(params, dbData.objectStoreNames.PROFILE_ACTIVITY, callback);
    }
    else{
        getObjectStoreAllData(dbData.objectStoreNames.PROFILE_ACTIVITY, (results) => {
            callback(results);
        });
    }
}

// Script for getting all db data

function getMyData(params, callback){

    var results = {dbVersion: dbVersion}, objectStoreNames = [];

    // convert DOMStringList to js array
    for (var key in db.objectStoreNames){ 
        if (typeof db.objectStoreNames[key] === "string"){ // avoiding the length key
            objectStoreNames.push(db.objectStoreNames[key]);
        } 
    }

    getExportObjectStoresData(objectStoreNames, results, params, callback);

}

function getExportObjectStoresData(objectStoreNames, results, params, callback){

    if (objectStoreNames.length == 0){
        // Sending the data back to the content script
        callback(results);
        return;
    }

    var objectStoreName = objectStoreNames[0];

    const rCallback = (objects) => {

        console.log('Got the specified data ['+objectStoreName+']:', objects);
        // Sending the retrieved data
        results[objectStoreName] = objects;

        objectStoreNames.shift();

        // looping back
        getExportObjectStoresData(objectStoreNames, results, params, callback);

    };

    getList(objectStoreName, { ...params }, rCallback);

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

function getList(objectStoreName, objectData, callback){

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

        case dbData.objectStoreNames.PROFILE_ACTIVITY:{
            getProfileActivityList(objectData, callback);
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
            getSettingsData(objectData, callback);
            break;
        }

        case "all":{
            getMyData(objectData, callback);
            break;
        }
    }

}













// Script for count any object store elements

function getObjectCount(objectStoreName, objectData, callback){

    var request = db
                .transaction(objectStoreName, "readonly")
                .objectStore(objectStoreName)
                .count();
    request.onsuccess = (event) => {
        console.log('Got '+objectStoreName+' count:', event.target.result);
        // Sending the retrieved data
        var result = event.target.result;
        callback(result);
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

function addObject(objectStoreName, objectData, callback){

    switch(objectStoreName){
        case dbData.objectStoreNames.BOOKMARKS:{
            addBookmarkObject(objectData, callback);
            break;
        }

        case dbData.objectStoreNames.KEYWORDS:{
            addKeywordObject(objectData, callback);
            break;
        }

        case dbData.objectStoreNames.REMINDERS:{
            addReminderObject(objectData, callback);
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

function addKeywordObject(params, callback) {

    var name = params.criteria.props.name;

    const objectStore = db.transaction(dbData.objectStoreNames.KEYWORDS, "readwrite").objectStore(dbData.objectStoreNames.KEYWORDS);
    
    // setting the date of insertion
    var keyword = {name: name, createdOn: new Date().toISOString()};
    const request = objectStore.add(keyword);
    request.onsuccess = (event) => {
        // console.log("New keyword added")
        callback(keyword);
    };

    request.onerror = function (event) {
        console.log("An error when inserting the new keyword", event);

        // let errorData = "An error occured most likely due to duplicated data. Check again before trying again !";
        sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_PROCESS_FAILED, null);
    };

}













function deleteObjectSet(objectStoreName, objectData, callback){

    const deleteResults = (results) => {

        if (results.length == 0){
            callback();
            return;
        }

        objectData.criteria.props.object = results[0];
        deleteObject(objectStoreName, objectData, () => {
            results.shift();
            deleteResults(results);
        });

    }

    getList(objectStoreName, objectData, (results) => {
        deleteResults(results);
    });

}

// Script for deleting any object instance

function deleteObject(objectStoreName, objectData, callback){

    if (objectStoreName == "all"){
        truncateDB(objectData, callback);
        return;
    }

    var id = null, params = objectData;
    switch(objectStoreName){
        case dbData.objectStoreNames.REMINDERS:{
            id =  (Object.hasOwn(params.criteria.props, "object")) ? params.criteria.props.object.url : params.criteria.props.url;
            break;
        }

        case dbData.objectStoreNames.KEYWORDS:{
            id = (Object.hasOwn(params.criteria.props, "object")) ? params.criteria.props.object.name : params.criteria.props.name;
            break;
        }

        case dbData.objectStoreNames.PROFILES:{
            id = (Object.hasOwn(params.criteria.props, "object")) ? params.criteria.props.object.url : params.criteria.props.url;
            break;
        }

        case dbData.objectStoreNames.SEARCHES:{
            id = (Object.hasOwn(params.criteria.props, "object")) ? params.criteria.props.object.id : params.criteria.props.id;
            break;
        }

        case dbData.objectStoreNames.NOTIFICATIONS:{
            id = (Object.hasOwn(params.criteria.props, "object")) ? params.criteria.props.object.id : params.criteria.props.id;
            break;
        }

        case dbData.objectStoreNames.PROFILE_ACTIVITY:{
            id = (Object.hasOwn(params.criteria.props, "object")) ? params.criteria.props.object.id : params.criteria.props.id;
            break;
        }

        case dbData.objectStoreNames.BOOKMARKS:{
            id = (Object.hasOwn(params.criteria.props, "object")) ? params.criteria.props.object.url : params.criteria.props.url;
            break;
        }
    }

    const objectStore = db.transaction(objectStoreName, "readwrite").objectStore(objectStoreName);
    let requestUpdate = objectStore.delete(id);
    requestUpdate.onsuccess = (event) => {
        // Success - the data is updated!
        console.log(objectStoreName+" deleted successfully !");
        callback();
    };
    requestUpdate.onerror = (event) => {
        // Do something with the error
        console.log("An error occured when deleting  "+objectStoreName+"!");
        sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_PROCESS_FAILED, null);
    };

}

function deleteObjectStoreSpecificData(objectStoreNames, params, callback){

    if (objectStoreNames.length == 0){
        // updating the last reset date before notifying the content script
        callback();
        return;
    }

    var objectStoreName = objectStoreNames[0];

    console.log("obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb : ", objectStoreName);

    deleteObjectSet(objectStoreName, params, () => {
        objectStoreNames.shift();
        deleteObjectStoreSpecificData(objectStoreNames, params, callback);
    });

}

// Script for truncating the database 

function truncateDB(params, callback){

    // convert DOMStringList to js array
    let objectStoreNames = [];
    for (var key in db.objectStoreNames){
        if (typeof db.objectStoreNames[key] === "string" && db.objectStoreNames[key] != dbData.objectStoreNames.SETTINGS){
            objectStoreNames.push(db.objectStoreNames[key]);
        }
    }

    if (!Object.hasOwn(params, "criteria")){
        deleteAllObjectStoresData(objectStoreNames, callback);
    }
    else{
        deleteObjectStoreSpecificData(objectStoreNames, params, callback);
    }
    
}

function deleteAllObjectStoreData(objectStoreName, callback){

    const objectStore = db.transaction(objectStoreName, "readwrite").objectStore(objectStoreName);
    var request = objectStore.clear();
    request.onsuccess = (event) => {
        // Clearing the next objectStore
        console.log(`successfully deleted all ${objectStoreName} data`);
        // console.error(`successfully deleted all ${objectStoreName} data`);
        callback();
    }

    request.onerror = (err)=> {
        console.error(`Failed to delete all ${objectStoreName} data: ${err}`);
    }

}

// Script for clearing an objectStore

function deleteAllObjectStoresData(objectStoreNames, callback){

    if (objectStoreNames.length == 0){
        // updating the last reset date before notifying the content script
        var lastDataResetDate = (new Date()).toISOString();
        updateSettingObject({
            context: "App",
            criteria: {
                props: {
                    lastDataResetDate: lastDataResetDate,
                }
            }
        }, (object) => {
            callback();
        });
        return;
    }

    var objectStoreName = objectStoreNames[0];

    deleteAllObjectStoreData(objectStoreName, () => {
        objectStoreNames.shift();
        deleteAllObjectStoresData(objectStoreNames, callback);
    });

}













// Script for getting any object instance

function getObject(objectStoreName, objectData, callback){

    switch(objectStoreName){
        case dbData.objectStoreNames.PROFILES:{
            getProfileObject(objectData, callback);
            break;
        }

        case dbData.objectStoreNames.SETTINGS:{
            getSettingsData(objectData, callback);
            break;
        }

        case dbData.objectStoreNames.REMINDERS:{
            getReminderObject(objectData, callback);
            break;
        }

        case "feedback": {
            getFeedbackData(objectData, callback);
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

function getProfileObject(params, callback){

    var url = params.criteria.props.url;

    let objectStore = db.transaction(dbData.objectStoreNames.PROFILES, "readonly").objectStore(dbData.objectStoreNames.PROFILES);
    let request = objectStore.get(url);

    request.onsuccess = (event) => {

        let profile = event.target.result;
        profile.bookmark = null;
        profile.reminder = null;

        if (params.context.indexOf("only_object") != -1){
            callback(profile);
            return;
        }

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

function getSettingsData(params, callback){
    
    var request = db
                    .transaction(dbData.objectStoreNames.SETTINGS, "readonly")
                    .objectStore(dbData.objectStoreNames.SETTINGS)
                    .get(1);

    request.onsuccess = (event) => {
        console.log('Got settings:', event.target.result);
        // Sending the retrieved data
        let settings = event.target.result;

        var props = (Object.hasOwn(params, "criteria") ? params.criteria.props : null);
        if (!props){
            callback( (params.context.indexOf("data_export") >= 0 ? [settings] : settings) );
            return;
        }

        if (params.context.indexOf("data_export") != -1){
            callback([settings]);
            return;
        }

        var result = {};
        for (var prop of props){

            result[prop] = settings[prop]; 

            // if (property == "feedback"){
            //     // checking the diff between two dates

            //     var diffTime = Math.abs((new Date()) - (new Date(propValue.createdAt)));
            //     const diffDays = Math.ceil(diffTime / (1000 * 60)); 
            //     // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            //     console.log(diffTime + " milliseconds");
            //     // console.log(diffDays + " days");

            //     if (diffTime > appParams.INTERVAL_FEEDBACK){
            //         propValue = null;
            //     }
            // }
        }

        callback(result);
    };

    request.onerror = (event) => {
        console.log("An error occured when getting the settings data");
    };
}













// Script for updating any object instance

function updateObject(objectStoreName, params, callback){

    if (objectStoreName == dbData.objectStoreNames.SETTINGS){
        updateSettingObject(params, callback);
        return;
    }

    const updateOb = (object, params, fCallback) => {

        for (var prop in params.criteria.props){ 
            if (prop != "object"){
                object[prop] = params.criteria.props[prop]; 
            }
        }

        let objectStore = db.transaction(objectStoreName, "readwrite").objectStore(objectStoreName);
        let requestUpdate = objectStore.put(object);
        requestUpdate.onsuccess = (event) => {
            // Success - the data is updated!
            console.log(objectStoreName+" updated successfully !");
            fCallback(object);
        };
        requestUpdate.onerror = (event) => {
            // Do something with the error
            console.log("An error occured when updating  "+objectStoreName+"!");
        };

    }

    if (Object.hasOwn(params.criteria.props, "object")){

        var object = params.criteria.props.object;
        updateOb(object, params, callback);

    }
    else{

        getObject(objectStoreName, params, (object) => {
            updateOb(object, params, callback);
        });

    }

}

// function deactivateTodayReminders(){

//     let objectStore = db.transaction(dbData.objectStoreNames.REMINDERS, "readwrite").objectStore(dbData.objectStoreNames.REMINDERS);
//     let cursor = objectStore.openCursor(null, 'prev');
//     cursor.onsuccess = function(event) {
//         let cursor = event.target.result;
        
//         if(!cursor) {
//             return;
//         }

//         let object = cursor.value;

//         if ((new Date()).toISOString().split("T")[0] != object.date.split("T")[0]){
//             cursor.continue();
//         }

//         object.activated = false;
//         let requestUpdate = objectStore.put(object);
//         requestUpdate.onerror = (event) => {
//             // Do something with the error
//             console.log("An error occured when updating reminder "+object.url+" !");
//         };
//         requestUpdate.onsuccess = (event) => {
//             // Success - the data is updated!
//             console.log("Reminder "+object.url+" update processed successfully !");
//         };
        
//         cursor.continue();
//     }

//     cursor.onerror = (event) => {
//         console.log("Failed to acquire the cursor !");
//         sendBackResponse(messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_PROCESS_FAILED, null);
//     };

// }

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

function updateSettingObject(params, callback){

    var object = params.criteria.props;

    // Retrieving the data first for later update
    let objectStore = db.transaction(dbData.objectStoreNames.SETTINGS, "readwrite").objectStore(dbData.objectStoreNames.SETTINGS);
    let request = objectStore.get(1);

    request.onsuccess = (event) => {
        console.log('Got settings:', event.target.result);
        // then, update the property
        let settings = event.target.result;

        for (var prop in object){ settings[prop] = object[prop]; }

        let requestUpdate = objectStore.put(settings);
        requestUpdate.onerror = (event) => {
            // Do something with the error
            console.log("An error occured when updating settings !");
        };
        requestUpdate.onsuccess = (event) => {
            // Success - the data is updated!
            console.log("Settings updated successfully !");

            callback(object);

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

    // testUpDb();

    // Script for getting all the searches done so far
    switch(message.header){

        case messageParams.requestHeaders.GET_LIST:{
            // acknowledge receipt
            ack(sendResponse);

            // providing the result
            getList(message.data.objectStoreName, message.data.objectData, (results) => {
                sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, message.data.objectStoreName, {context: message.data.objectData.context, list: results});
            });
            break;
        }

        case messageParams.requestHeaders.GET_OBJECT:{
            // acknowledge receipt
            ack(sendResponse);

            // providing the result
            getObject(message.data.objectStoreName, message.data.objectData, (object) => {
                sendBackResponse(messageParams.responseHeaders.OBJECT_DATA, message.data.objectStoreName, { context: message.data.objectData.context, object: object});
            });
            break;
        }

        case messageParams.requestHeaders.ADD_OBJECT:{
            // acknowledge receipt
            ack(sendResponse);

            // providing the result
            addObject(message.data.objectStoreName, message.data.objectData, (object) => {
                sendBackResponse(messageParams.responseHeaders.OBJECT_DATA, message.data.objectStoreName, { context: message.data.objectData.context, object: object});
            });
            break;
        }

        case messageParams.requestHeaders.UPDATE_OBJECT:{
            // acknowledge receipt
            ack(sendResponse);

            // providing the result
            updateObject(message.data.objectStoreName, message.data.objectData, (object) => {
                sendBackResponse(messageParams.responseHeaders.OBJECT_DATA, message.data.objectStoreName, { context: message.data.objectData.context, object: object});
            });
            break;
        }

        case messageParams.requestHeaders.DEL_OBJECT:{
            // acknowledge receipt
            ack(sendResponse);

            // providing the result
            deleteObject(message.data.objectStoreName, message.data.objectData, () => {
                sendBackResponse(messageParams.responseHeaders.OBJECT_DELETED, message.data.objectStoreName, { context: message.data.objectData.context } );
                if (message.data.objectData.context == "data_deletion"){
                    getSettingsData({ 
                            context: message.data.objectData.context, 
                            criteria: {
                                props: ["lastDataResetDate"],
                            }
                        },
                        (object) => {
                            sendBackResponse(messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.SETTINGS, { context: message.data.objectData.context, object: object});
                        }
                    );
                }
                else{
                    getList(message.data.objectStoreName, { context: message.data.objectData.context }, (results) => {
                        sendBackResponse(messageParams.responseHeaders.OBJECT_LIST, message.data.objectStoreName, {context: message.data.objectData.context, list: results});
                    });
                }
            });
            break;
        }
        
        case messageParams.requestHeaders.GET_COUNT:{
            // acknowledge receipt
            ack(sendResponse);

            // Providing the keyword count to the front 
            getObjectCount(message.data.objectStoreName, message.data.objectData, (value) => {
                sendBackResponse(messageParams.responseHeaders.OBJECT_COUNT, message.data.objectStoreName, { context: message.data.objectData.context, count: value});
            });
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
        updateSettingObject({
            context: "App",
            criteria: {
                props: {
                    timeCount: timeCount,
                }
            }
        }, (object) => {

        });
    });

} 

// Script for starting the time counter
function startTimeCounter(){

    // start counting the time spent on the tab
    getSettingsData(["timeCount"], (results) => {
        var timeCount = results[0];
        timeCount.lastCheck = (new Date()).toISOString();
        updateSettingObject({
            context: "App",
            criteria: {
                props: {
                    timeCount: timeCount,
                }
            }
        }, (object) => {

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



// function testUpDb(){

//     var params = { context: "" };
//     getList(dbData.objectStoreNames.SEARCHES, params, (results) => {
//         for (var search of results){
//             params = { context: "", criteria: { props: { object: search, timeCount: { value: (Math.random() * (180 - 30) + 30)/*.toFixed(1)*/, lastCheck: (new Date()).toISOString() } } } };
//             updateObject(dbData.objectStoreNames.SEARCHES, params, () => {});
//         }
//     });

// }