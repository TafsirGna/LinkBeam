// Script of extension database creation

let db = null;
const searchObjectStoreName = "searches";
const keywordObjectStoreName = "keywords";
const settingObjectStoreName = "settings";
const profileObjectStoreName = "profiles";
const reminderObjectStoreName = "reminders";
const notificationObjectStoreName = "notifications";
const bookmarkObjectStoreName = "bookmarks";
const appParams = {appVersion: "0.1.0", keywordCountLimit: 5, searchPageLimit: 2, bookmarkCountLimit: 5};
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

        // profileObjectStore.createIndex("bookmarked", "bookmarked", { unique: false });

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

        // notification object store
        let notificationObjectStore = db.createObjectStore(notificationObjectStoreName, { keyPath: "id" });

        notificationObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Notification' created.");
        }

        // bookmarks object store
        let bookmarkObjectStore = db.createObjectStore(bookmarkObjectStoreName, { keyPath: "url" });

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
    const objectStore = db.transaction(settingObjectStoreName, "readwrite").objectStore(settingObjectStoreName);
    settingData.forEach((setting) => {
      const request = objectStore.add(setting);
      request.onsuccess = (event) => {
        console.log("Setting data set");
      };
    });
}













function getSearchProfiles(searches, context){

    if (searches.length == 0){
        sendBackResponse("OBJECT-LIST", searchObjectStoreName, {context: context, list: searches});
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
                sendBackResponse("OBJECT-LIST", searchObjectStoreName, {context: context, list: results});
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
                    .transaction(bookmarkObjectStoreName, "readonly")
                    .objectStore(bookmarkObjectStoreName)
                    .getAll();
    let results = [];
    request.onsuccess = (event) => {
        console.log('Got all bookmarks:', event.target.result);
        // Sending the retrieved data
        var bookmarks = event.target.result;

        if (bookmarks.length == 0){
            sendBackResponse("OBJECT-LIST", bookmarkObjectStoreName, results);
            return;
        }

        bookmarks.forEach((bookmark) => {
            let profileRequest = db
                    .transaction(profileObjectStoreName, "readonly")
                    .objectStore(profileObjectStoreName)
                    .get(bookmark.url);
            profileRequest.onsuccess = (event) => {
                var profile = event.target.result;
                bookmark.profile = profile;

                results.push(bookmark);

                if (results.length == bookmarks.length){
                    results.sort((a,b) => (new Date(b.createdOn)) - (new Date(a.createdOn)));
                    sendBackResponse("OBJECT-LIST", bookmarkObjectStoreName, results);
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
    let cursor = db.transaction(searchObjectStoreName, "readonly").objectStore(searchObjectStoreName).openCursor(null, 'prev');
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
                .transaction(reminderObjectStoreName, "readonly")
                .objectStore(reminderObjectStoreName)
                .getAll();

    request.onsuccess = (event) => {
        console.log('Got all reminders:', event.target.result);
        // Sending the retrieved data
        let reminders = event.target.result;

        if (reminders.length == 0){
            sendBackResponse("OBJECT-LIST", reminderObjectStoreName, results);
        }

        reminders.forEach((reminder) => {

            reminder.profile = null;

            let profileRequest = db
                .transaction(profileObjectStoreName, "readonly")
                .objectStore(profileObjectStoreName)
                .get(reminder.url);

            profileRequest.onsuccess = (event) => {
                // console.log('Got all reminders:', event.target.result);
                // Sending the retrieved data
                let profile = event.target.result;
                if (profile != undefined){
                    reminder.profile = profile;
                }
                results.push(reminder);

                sendBackResponse("OBJECT-LIST", reminderObjectStoreName, results);
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
                .transaction(keywordObjectStoreName, "readonly")
                .objectStore(keywordObjectStoreName)
                .getAll();

    request.onsuccess = (event) => {
        console.log('Got all keywords:', event.target.result);
        // Sending the retrieved data
        let results = event.target.result;
        sendBackResponse("OBJECT-LIST", keywordObjectStoreName, results);
    };

    request.onerror = (event) => {
        console.log("An error occured when retrieving keyword list : ", event);
    };
}

// Script for getting any objectStore list

function getList(objectStoreName, objectData){

    switch(objectStoreName){
        case searchObjectStoreName:{
            getSearchList(objectData);
            break;
        }

        case bookmarkObjectStoreName:{
            getBookmarkList();
            break;
        }

        case keywordObjectStoreName:{
            getKeywordList();
            break;
        }

        case reminderObjectStoreName:{
            getReminderList();
            break;
        }
    }

}













// Script for count any object store elements

function getObjectCount(objectStoreName, objectData){

    switch(objectStoreName){

        case keywordObjectStoreName:{
            getKeywordCount(objectData);
            break;
        }

        case reminderObjectStoreName:{
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
                    .transaction(reminderObjectStoreName, "readonly")
                    .objectStore(reminderObjectStoreName)
                    .count();
    request.onsuccess = (event) => {
        console.log('Got reminder count:', event.target.result);
        // Sending the retrieved data
        var result = event.target.result;
        sendBackResponse("OBJECT-COUNT", reminderObjectStoreName, result);
    };

    request.onerror = (event) => {
        console.log("An error occured when counting reminders : ", event);
    };
}


// Script for getting keyword count

function getKeywordCount() {

    var request = db
                    .transaction(keywordObjectStoreName, "readonly")
                    .objectStore(keywordObjectStoreName)
                    .count();
    request.onsuccess = (event) => {
        console.log('Got keyword count:', event.target.result);
        // Sending the retrieved data
        var result = event.target.result;
        sendBackResponse("OBJECT-COUNT", keywordObjectStoreName, result);
    };

    request.onerror = (event) => {
        console.log("An error occured when counting keywords : ", event);
    };
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
    };

    request.onerror = (event) => {
        console.log("An error occured when adding search data");
    };

}

// Script for adding a reminder

function addReminderObject(reminder){

    reminder.createdOn = (new Date()).toISOString();

    const objectStore = db.transaction(reminderObjectStoreName, "readwrite").objectStore(reminderObjectStoreName);
    const request = objectStore.add(reminder);
    request.onsuccess = (event) => {
        console.log("New reminder added");
        sendBackResponse("ADD", reminderObjectStoreName, reminder);
    };

    request.onerror = (event) => {
        console.log("An error occured when adding a reminder ", event);
    };

}

// Script for adding a bookmark

function addBookmarkObject(url){

    var bookmark = {url: url, createdOn: (new Date()).toISOString()};

    const objectStore = db.transaction(bookmarkObjectStoreName, "readwrite").objectStore(bookmarkObjectStoreName);
    const request = objectStore.add(bookmark);
    request.onsuccess = (event) => {
        console.log("New bookmark added");
        sendBackResponse("ADD", bookmarkObjectStoreName, bookmark);
    };

    request.onerror = (event) => {
        console.log("An error occured when adding a bookmark");
    };

}

// Script for adding any object instance

function addObject(objectStoreName, objectData){

    switch(objectStoreName){
        case bookmarkObjectStoreName:{
            addBookmarkObject(objectData);
            break;
        }

        case keywordObjectStoreName:{
            addKeywordObject(objectData);
            break;
        }

        case reminderObjectStoreName:{
            addReminderObject(objectData);
            break;
        }
    }

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

function addKeywordObject(keywordData) {
    const objectStore = db.transaction(keywordObjectStoreName, "readwrite").objectStore(keywordObjectStoreName);
    
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

    const objectStore = db.transaction(reminderObjectStoreName, "readwrite").objectStore(reminderObjectStoreName);
    const request = objectStore.delete(reminderData);
    request.onsuccess = (event) => {
        console.log("A reminder deleting");
        sendBackResponse("DELETE", reminderObjectStoreName, reminderData);
    };

    request.onerror = (event) => {
        console.log("An error occured when deleting a reminder ", event);
    };

}

// Script for deleting a bookmark 

function deleteBookmarkObject(bookmarkData){

    const objectStore = db.transaction(bookmarkObjectStoreName, "readwrite").objectStore(bookmarkObjectStoreName);
    const request = objectStore.delete(bookmarkData);
    request.onsuccess = (event) => {
        console.log("Bookmark deleted");
        sendBackResponse("DELETE", bookmarkObjectStoreName, bookmarkData)
    };

    request.onerror = (event) => {
        console.log("An error occured when deleting a bookmark");
    };

}

// Script for deleting any object instance

function deleteObject(objectStoreName, objectData){

    switch(objectStoreName){
        case bookmarkObjectStoreName:{
            deleteBookmarkObject(objectData);
            break;
        }

        case keywordObjectStoreName:{
            deleteKeywordObject(objectData);
            break;
        }

        case reminderObjectStoreName:{
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
    const objectStore = db.transaction(keywordObjectStoreName, "readwrite").objectStore(keywordObjectStoreName);
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
        if (typeof data[key] === "string" && data[key] != settingObjectStoreName){
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
        getList(objectStoreNames[0], null);
        objectStoreNames.shift()
        clearObjectStores(objectStoreNames)
    }

}













// Script for getting any object instance

function getObject(objectStoreName, objectData){

    switch(objectStoreName){
        case profileObjectStoreName:{
            getProfileObject(objectData);
            break;
        }

        case settingObjectStoreName:{
            getSettingsData(objectData);
            break;
        }

        case "feedback": {
            getFeedbackData(objectData);
            break;
        }

        case "app-params": {
            sendBackResponse("GET-OBJECT", "app-params", appParams);
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

    let objectStore = db.transaction(profileObjectStoreName, "readonly").objectStore(profileObjectStoreName);
    let request = objectStore.get(url);

    request.onsuccess = (event) => {

        let profile = event.target.result;
        profile.bookmark = null;
        profile.reminder = null;

        let bookmarkObjectStore = db.transaction(bookmarkObjectStoreName, "readonly").objectStore(bookmarkObjectStoreName);
        let bookmarkRequest = bookmarkObjectStore.get(url);

        bookmarkRequest.onsuccess = (event) => {

            let bookmark = event.target.result;

            if (bookmark != undefined){
                profile.bookmark = bookmark;
            }

            let reminderObjectStore = db.transaction(reminderObjectStoreName, "readonly").objectStore(reminderObjectStoreName);
            let reminderRequest = reminderObjectStore.get(url);

            reminderRequest.onsuccess = (event) => {

                let reminder = event.target.result;
                if (reminder != undefined){
                    profile.reminder = reminder;
                }
                sendBackResponse("GET-OBJECT", profileObjectStoreName, profile);

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

function getSettingsData(properties){
    
    var request = db
                    .transaction(settingObjectStoreName, "readonly")
                    .objectStore(settingObjectStoreName)
                    .get(1);

    request.onsuccess = (event) => {
        console.log('Got settings:', event.target.result);
        // Sending the retrieved data
        let settings = event.target.result;
        properties.forEach((property) => {
            sendBackResponse("GET-OBJECT", settingObjectStoreName, {property: property, value: settings[property]});
        });
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
    let cursor = db.transaction(searchObjectStoreName, "readonly").objectStore(searchObjectStoreName).openCursor(null, 'prev');
    cursor.onsuccess = function(event) {
        var cursor = event.target.result;

        if(!cursor) {
            sendBackResponse("GET-PROCESSED-DATA", "views-timeline-chart", results);
            return;
        }

        let searchDate = cursor.value.date.split("T")[0];
        if (typeof chartData[0] == "string"){

            let index = chartData.indexOf(searchDate);

            if (index == -1){
                sendBackResponse("GET-PROCESSED-DATA", "views-timeline-chart", results);
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
                sendBackResponse("GET-PROCESSED-DATA", "views-timeline-chart", results);
                return;
            }
        }
        

        cursor.continue();        
    }

}













// Script for updating any object instance

function updateObject(objectStoreName, objectData){

    switch(objectStoreName){
        case settingObjectStoreName:{
            updateSettingObject(objectData.property, objectData.value);
            break;
        }

        case profileObjectStoreName: {
            updateProfileObject(objectData);
            break;
        }
    }

}

// Script for updating a profile object

function updateProfileObject(params){

    let objectStore = db.transaction(profileObjectStoreName, "readwrite").objectStore(profileObjectStoreName);
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

    switch(action){
        case "ADD": {
            header = 'object-added';
            break;
        }

        case "GET-OBJECT": {
            header = 'object-data';
            break;
        }

        case "DELETE": {
            header = 'object-deleted';
            break;
        }

        case "OBJECT-LIST": {
            header = 'object-list';
            break;
        }

        case "OBJECT-COUNT": {
            header = 'object-count';
            break;
        }

        case "GET-PROCESSED-DATA": {
            header = 'processed-data';
            break;
        }
    }

    chrome.runtime.sendMessage({header: header, data: responseData}, (response) => {
      console.log(action + " " + objectStoreName + ' response sent', response, responseData);
    });
}

// Script for processing linkedin data

function processLinkedInData(linkedInData){
    if (linkedInData == null){
        console.log("Not a valid linkedin page");
        return;
    }

    let datetime = new Date().toISOString();
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
            education: {},
            experience: {},
            certifications: {},
            newsFeed: {},
            languages: {},
        },
    };
    add_search(search);
}

// Script handling the message execution

function processMessageEvent(message, sender, sendResponse){

    console.log("Message received : ", message)
    // Script for getting all the searches done so far
    switch(message.header){

        case 'get-list':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // providing the result
            getList(message.data.objectStoreName, message.data.objectData);
            break;
        }

        case 'get-object':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // providing the result
            getObject(message.data.objectStoreName, message.data.objectData);
            break;
        }

        case 'add-object':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // providing the result
            addObject(message.data.objectStoreName, message.data.objectData);
            break;
        }

        case 'update-object':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // providing the result
            updateObject(message.data.objectStoreName, message.data.objectData);
            break;
        }

        case 'delete-object':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // providing the result
            deleteObject(message.data.objectStoreName, message.data.objectData);
            break;
        }
        
        case 'get-count':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Providing the keyword count to the front 
            getObjectCount(message.data.objectStoreName, message.data.objectData);
            break;
        }

        case 'get-processed-data':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Saving the new notification setting state
            getProcessedData(message.data.objectStoreName, message.data.objectData);
            break;
        }
        /*case 'linkedin-data':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Saving the new notification setting state
            processLinkedInData(message.data);
            break;
        }*/

        default:{
            // TODO
        }
    }
};

// Script for processing tab event
function processTabEvent(tabId, changeInfo, tab){

    // console.log("in processTabEvent function !");

    // const linkedInPattern = /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)/gm;
    const linkedInPattern = /github.com/;
    if (changeInfo.url && linkedInPattern.test(changeInfo.url)) 
    {
        // Sending a signal to the content script for confirmation and data extraction
        /*chrome.runtime.sendMessage({header: 'check-linkedin-page', data: null}, (response) => {
          console.log('check-linkedin-page request sent', response);
        });*/

        /*chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["./assets/bootstrap.min.css", "./assets/bootstrap.min.js", "content.js"]
        });*/

        processLinkedInData({});
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