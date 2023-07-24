// Script of extension database creation

let db = null;
const searchObjectStoreName = "searches";
const keywordObjectStoreName = "keywords";

function createDatabase() {

    const dbName = "LinkBeamDB"
    const request = indexedDB.open(dbName);

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

// Extension installation script

chrome.runtime.onInstalled.addListener(details => {
    createDatabase()
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        /*chrome.runtime.setUninstallURL('https://example.com/extension-survey');*/
    }
});

// Script for getting all saved searches

function getSearchList() {
    if (db) {
        if (db.objectStoreNames.contains(searchObjectStoreName)){
            const objectStore = db.transaction(searchObjectStoreName, "readonly").objectStore(searchObjectStoreName);

            return new Promise((resolve, reject) => {
                get_transaction.oncomplete = function () {
                    console.log("Getting all transactions completed");
                }

                get_transaction.onerror = function () {
                    console.log("An error occured when retrieving the data");
                }

                let request = objectStore.getAll();

                request.onsuccess = function (event) {
                    resolve(event.target.result);
                }
            });
        }
        else{
            console.log("ObjectStore 'Search' empty")
            return null;
        }
    }
    else{
        console.log("Database not initialized for data retrieving");
    }
}

// Script for getting all saved searches

function getKeywordList() {
    if (db) {
        if (db.objectStoreNames.contains(keywordObjectStoreName)){
            const objectStore = db.transaction(keywordObjectStoreName, "readonly").objectStore(keywordObjectStoreName);

            return new Promise((resolve, reject) => {
                get_transaction.oncomplete = function () {
                    console.log("Getting all transactions completed");
                }

                get_transaction.onerror = function () {
                    console.log("An error occured when retrieving the data");
                }

                let request = objectStore.getAll();

                request.onsuccess = function (event) {
                    resolve(event.target.result);
                }
            });
        }
        else{
            console.log("ObjectStore 'Keyword' empty")
            return null;
        }
    }
    else{
        console.log("Database not initialized for data retrieving");
    }
}

// Script for adding a new keyword

function add_keyword(keywordData) {
    if (db) {
        const objectStore = db.transaction("keywords", "readwrite").objectStore("keywords");

        return new Promise((resolve, reject) => {
            insert_transaction.oncomplete = function () {
                console.log("Getting all insert transactions completed");
                resolve(true);
            }

            insert_transaction.onerror = function () {
                console.log("An error occured when adding a new keyword")
                resolve(false);
            }

            keywordData.forEach(keyword => {
                let request = objectStore.add(keyword);

                request.onsuccess = function () {
                    console.log("Added: ", keyword);
                }
            });
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
  if (message.header === 'get-search-list') {
    let request = getSearchList()

    if (request){
        request.then(result => {
            let responseObject = {
                status: "SUCCESS",
                data: result
            };
            sendResponse(responseObject);
        });
    }
    else{
        let responseObject = {
            status: "SUCCESS",
            data: []
        };
        sendResponse(responseObject);
    }
  }
  else if (message.header === 'get-keyword-list'){
    let request = getKeywordList()

    if (request){
        request.then(result => {
            let responseObject = {
                status: "SUCCESS",
                data: result
            };
            sendResponse(responseObject);
        });
    }
    else{
        let responseObject = {
            status: "SUCCESS",
            data: []
        };
        sendResponse(responseObject);
    }
  }
  else if (message.header === 'add-keyword'){
    let request = add_keyword(message.data)

    if (request){
        request.then(result => {
            let responseObject = {
                status: "SUCCESS",
                data: result
            };
            sendResponse(responseObject);
        });
    }
    else{
        let responseObject = {
            status: "ERROR",
            data: []
        };
        sendResponse(responseObject);
    }
  }
});