
export function saveCurrentPageTitle(pageTitle){

  // Saving the current page title
  sendDatabaseActionMessage("update-object", "settings", {property: "currentPageTitle", value: pageTitle});

}


export function sendDatabaseActionMessage(action, objectStoreName, objectData){

  // Send message to the background
  chrome.runtime.sendMessage({header: action, data: {objectStoreName: objectStoreName, objectData: objectData}}, (response) => {
    // Got an asynchronous response with the data from the service worker
    console.log(action + ' ' + objectStoreName + " request sent ", response, objectData);
  });

}