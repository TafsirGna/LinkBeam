// Script of extension database creation

let db = null;
const searchObjectStoreName = "searches";
const keywordObjectStoreName = "keywords";

function createDatabase() {

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

        let keywordObjectStore = db.createObjectStore(keywordObjectStoreName, {
            keyPath: 'uid'
        });

        keywordObjectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore 'Keyword' created.");
        }
    }

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("Database successfully initialized and opened");

        db.onerror = function (event) {
            console.log("Failed to open database.")
        }
    }
}

createDatabase();

// Extension installation script

/*chrome.runtime.onInstalled.addListener(details => {
    createDatabase()
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        // chrome.runtime.setUninstallURL('https://example.com/extension-survey');
    }
});*/

// Script for getting all saved searches

function provideSearchList() {
    if (db) {
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
    else{
        console.log("Database not found");
    }
}

// Script for getting all saved searches

function provideKeywordList() {
    if (db) {
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
    else{
        console.log("Database not found");
    }
}

// Script for adding a new keyword

function add_keyword(keywordData) {
    if (db) {
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
    else{
        console.log("Database not initialized for data insertion");
    }
}

// Script for listening to the events

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
  }
});