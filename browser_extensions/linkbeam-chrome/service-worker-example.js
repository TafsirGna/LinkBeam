// Script of extension database creation

let db = null;
const searchObjectStoreName = "searches";
const keywordObjectStoreName = "keywords";

function createDatabase(context) {

    const dbName = "LinkBeamDB"
    const request = indexedDB.open(dbName, 1);

    request.onerror = function (event) {
        console.log("An error occured when opening the database");
    }

    request.onupgradeneeded = function (event) {
        db = event.target.result;

        let searchObjectStore = db.createObjectStore(searchObjectStoreName, {
            keyPath: 'uid'
        });

        searchObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Search' created.");
        }

        // creating an index on this objectStore
        searchObjectStore.createIndex("uid", "uid", { unique: true });

        let keywordObjectStore = db.createObjectStore(keywordObjectStoreName, {
            keyPath: 'uid'
        });

        // creating indices on this objectStore
        keywordObjectStore.createIndex("name", "name", { unique: true });
        keywordObjectStore.createIndex("uid", "uid", { unique: true });

        keywordObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Keyword' created.");
        }
    }

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("Database successfully initialized and opened");

        // once, the database obtained, execute the sent request in a runtime context
        if (context.status == "RUNTIME"){
            processMessageEvent(context.params.message, context.params.sender, context.params.sendResponse)
        }

        db.onerror = function (event) {
            console.log("Failed to open database.")
        }
    }
}

// Extension installation script

/*chrome.runtime.onInstalled.addListener(details => {
    createDatabase({status: "INSTALL"})
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        // chrome.runtime.setUninstallURL('https://example.com/extension-survey');
    }
});*/

// Script for getting all saved searches

function provideSearchList() {
    db
    .transaction(searchObjectStoreName, "readonly")
    .objectStore(searchObjectStoreName)
    .getAll()
    .onsuccess = (event) => {
        console.log('Got all searches:', event.target.result);
        // Sending the retrieved data
        chrome.runtime.sendMessage({header: 'search-list', data: event.target.result}, (response) => {
          console.log('Search list response sent', response);
        });
    };
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

// Script for adding a new keyword

function add_keyword(keywordData) {
    const objectStore = db.transaction(keywordObjectStoreName, "readwrite").objectStore(keywordObjectStoreName);
    keywordData.forEach((keyword) => {
      const request = objectStore.add(keyword);
      request.onsuccess = (event) => {
        // console.log("New keyword added")
        // Sending the new list
        provideKeywordList() 
      };
    });
}

// Script for deleting a keyword

function delete_keyword(keywordData) {
    const objectStore = db.transaction(keywordObjectStoreName, "readwrite").objectStore(keywordObjectStoreName);
    objectStore.delete(keywordData).onsuccess = (event) => {
        // console.log("Keyword deleted")
        // Sending the new list
        provideKeywordList() 
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
            provideSearchList();
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
            // Adding the new keyword
            delete_keyword(message.data)       
            break;
        }
        case 'delete-keyword':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Adding the new keyword
            delete_keyword(message.data)       
            break;
        }
    case 'get-keyword-count':{
            // sending a response
            sendResponse({
                status: "ACK"
            });
            // Adding the new keyword
            provideKeywordCount()       
            break;
        }
        default:{
            // TODO
        }
    }
}

// Script for listening to the events

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
    // making the database is up and running
    if (!db){
        // sending a response
        sendResponse({
            status: "ACK"
        });
        createDatabase({status: "RUNTIME", params: {message: message, sender: sender, sendResponse: sendResponse}});
        return;
    }

    processMessageEvent(message, sender, sendResponse)    
});

