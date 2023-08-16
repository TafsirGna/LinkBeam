
export function saveCurrentPageTitle(pageTitle){

	// Saving the current page title
    chrome.runtime.sendMessage({header: 'update-object', data: {objectStoreName: "settings", objectData: {property: "currentPageTitle", value: pageTitle}}}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Save page title request sent', response);
    });

}