export const appParams = {
  appName: "LinkBeam",
  appVersion: "0.1.0", 
  keywordCountLimit: 5, 
  searchPageLimit: 2, 
  bookmarkCountLimit: 5,
  extShadowHostId: "linkBeamExtensionMainRoot",
  sectionMarkerID: "linkbeam-extension-section-marker",
  commentModalContainerID: "web-ui-comment-modal",
  commentListModalContainerID: "web-ui-comment-list-modal",
  commentRepliesListModalContainerID: "web-ui-comment-replies-list-modal",
  sectionMarkerShadowHostClassName: "linkbeam-section-marker-shadow-host",
  PARSE_APPLICATION_ID: 'VmRGMxmuLVDVyfGBKTESkWkAjIdjS7WkIubjKXSA',
  PARSE_JAVASCRIPT_KEY: 'robF8N6XaqWscNKitZZeuTPcIkJI1ytJhjooUBOS',
  PARSE_HOST_URL: 'https://parseapi.back4app.com/',
  TIMER_VALUE: 3000,
  SECTION_MARKER_CONTAINER_CLASS_NAME: "js-pinned-items-reorder-container",
  // SECTION_MARKER_CONTAINER_CLASS_NAME: "pvs-header__container",
  WEB_PAGE_URL_PATTERN: /github.com/,
  INTERVAL_FEEDBACK: 5,
  WEB_APP_ITEM_LIMIT_NUM: 3,
}

export const dbData = {
  objectStoreNames: {
    SEARCHES: "searches",
    BOOKMARKS: "bookmarks",
    SETTINGS: "settings",
    REMINDERS: "reminders",
    KEYWORDS: "keywords",
    PROFILES: "profiles",
    NOTIFICATIONS: "notifications",
  }
}

export const chartData = {

  stickColors: ['rgba(255, 26, 104, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'],

  stickBorderColors: [
          'rgba(255, 26, 104, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],

}

export const messageParams = {

  requestHeaders: {
    GET_LIST: "get-list",
    GET_COUNT: "get-count",
    GET_OBJECT: "get-object",
    ADD_OBJECT: "add-object",
    DEL_OBJECT: "delete-object",
    GET_PROCESSED_DATA: "get-processed-data",
    UPDATE_OBJECT: "update-object",
    SW_WEB_PAGE_CHECK: "sw-web-page-check",
    SW_WEB_PAGE_ACTIVATION: "sw-web-page-activation",
    CS_EXPAND_MODAL_ACTION: "web-ui-expand-modal-action",
  },

  responseHeaders: {
    OBJECT_LIST: "object-list",
    OBJECT_COUNT: "object-count",
    OBJECT_DATA: "object-data",
    OBJECT_ADDED: "object-added",
    OBJECT_UPDATED: "object-updated",
    OBJECT_DELETED: "object-deleted",
    PROCESSED_DATA: "processed-data",
    WEB_UI_APP_SETTINGS_DATA: "web-ui-app-settings-data",
    CS_WEB_PAGE_DATA: "sw-web-page-data",
    SW_CS_MESSAGE_SENT: "sw-cs-message-sent",
  },

  contentMetaData: {
    SW_WEB_PAGE_CHECKED: "sw-web-page-checked",
    SW_WEB_PAGE_ACTIVATED: "sw-web-page-activated",
  },

  separator: "|",

};

export const checkCurrentTab = () => {

  // Sending a message to the service worker for verification on the current tab
  chrome.runtime.sendMessage({header: messageParams.requestHeaders.SW_WEB_PAGE_CHECK, data: null}, (response) => {
    // Got an asynchronous response with the data from the service worker
    console.log("Web page checking Request sent !");
  });

}

export const activateInCurrentTab = (params) => {

  // Sending a message to the service worker for extension activation in the current tab
  chrome.runtime.sendMessage({header: messageParams.requestHeaders.SW_WEB_PAGE_ACTIVATION, data: params}, (response) => {
    // Got an asynchronous response with the data from the service worker
    console.log("Web page activation Request sent !");
  });

}


export function saveCurrentPageTitle(pageTitle){

  // Saving the current page title
  sendDatabaseActionMessage(messageParams.requestHeaders.UPDATE_OBJECT, dbData.objectStoreNames.SETTINGS, {property: "currentPageTitle", value: pageTitle});

}

export function sendDatabaseActionMessage(action, objectStoreName, objectData){

  // Send message to the background
  chrome.runtime.sendMessage({header: action, data: {objectStoreName: objectStoreName, objectData: objectData}}, (response) => {
    // Got an asynchronous response with the data from the service worker
    console.log(action + ' ' + objectStoreName + " request sent ", response, objectData);
  });

}

export function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function getChartColors(length){

  var indices = [];
  for (var i = 0; i < chartData.stickColors.length; i++){
    indices.push(i);
  }

  shuffle(indices);

  let backgrounds = []; let borders = [];
  for (var i = 0; i < length; i++){
    backgrounds.push(chartData.stickColors.at(i));
    borders.push(chartData.stickBorderColors.at(i));
  }
  
  return {borders: borders, backgrounds: backgrounds};

}

export function expandToTab(){

    // Send message to the background
    chrome.runtime.sendMessage({header: messageParams.requestHeaders.CS_EXPAND_MODAL_ACTION, data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log("Expand Modal Request sent !");
    });

}

export function ack(sendResponse){
  // sending a response
  sendResponse({
      status: "ACK"
  });
}

function switchCaseFunction(message, sendResponse, responseParams, responseCallbacks){

  var param = [message.header, message.data.objectStoreName].join(messageParams.separator);
  var index = responseParams.indexOf(param);
  if (index >= 0){
    (responseCallbacks[index])(message, sendResponse);
  }

}

export function startMessageListener(listenerSettings){

  var responseParams = []; var responseCallbacks = [];

  listenerSettings.forEach((settings) => {
    responseParams.push(settings.param);
    responseCallbacks.push(settings.callback);
  });


  // Listening for messages from the service worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    switch(message.header){

      case messageParams.responseHeaders.OBJECT_LIST:{

        switch(message.data.objectStoreName){

          case dbData.objectStoreNames.SEARCHES:{

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);
            
            break;
          }

          case dbData.objectStoreNames.BOOKMARKS: {
            
            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case dbData.objectStoreNames.KEYWORDS: {
            
            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case dbData.objectStoreNames.REMINDERS: {
            
            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }
        }
        
        break;
      }
      case messageParams.responseHeaders.OBJECT_COUNT:{

        switch(message.data.objectStoreName){
          /*case dbData.objectStoreNames.SEARCHES:{

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);
            
            break;
          }*/

          /*case dbData.objectStoreNames.BOOKMARKS: {
            
            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }*/

          case dbData.objectStoreNames.KEYWORDS: {
            
            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case dbData.objectStoreNames.REMINDERS: {
            
            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }
        }
        
        break;
      }
      case messageParams.responseHeaders.OBJECT_DATA:{

        switch(message.data.objectStoreName){

          case dbData.objectStoreNames.SETTINGS: {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case dbData.objectStoreNames.PROFILES: {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case "app-params": {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }
        }

        break;
      }

      case messageParams.responseHeaders.OBJECT_ADDED:{

        switch(message.data.objectStoreName){

          case dbData.objectStoreNames.BOOKMARKS: {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case dbData.objectStoreNames.REMINDERS: {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }
        }

        break;
      }

      case messageParams.responseHeaders.OBJECT_DELETED:{

        switch(message.data.objectStoreName){

          case dbData.objectStoreNames.BOOKMARKS: {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case dbData.objectStoreNames.REMINDERS: {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }
        }

        break;
      }

      case messageParams.responseHeaders.PROCESSED_DATA:{

        switch(message.data.objectStoreName){

          case "views-timeline-chart": {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }
        }

        break;
      }

      case messageParams.responseHeaders.SW_CS_MESSAGE_SENT:{

        switch(message.data.objectStoreName){

          case messageParams.contentMetaData.SW_WEB_PAGE_CHECKED:{

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);
            
            break;
          }

        }
        
        break;
      }
    }

  });


}
