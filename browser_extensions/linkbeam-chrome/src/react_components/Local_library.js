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
  PARSE_HOST_URL: 'https://parseapi.back4app.com/',
  TIMER_VALUE: 3000,

  GITHUB_SECTION_MARKER_CONTAINER_CLASS_NAME: "js-pinned-items-reorder-container",
  LINKEDIN_SECTION_MARKER_CONTAINER_CLASS_NAME: "core-section-container",
  // LINKEDIN_SECTION_MARKER_CONTAINER_CLASS_NAME: "pvs-header__container",
  
  WEB_PAGE_URL_PATTERNS: ["github.com", "linkedin.com"],
  INTERVAL_FEEDBACK: 5,
  WEB_APP_ITEM_LIMIT_NUM: 3,
  DATE_RANGE_SEPARATOR: "-",
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
    NEWSFEED: "newsfeed",
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

export const logInParseUser = async function (Parse, usernameValue, passwordValue, callback, errCallback = null) {

  try {
    const loggedInUser = await Parse.User.logIn(usernameValue, passwordValue);
    // logIn returns the corresponding ParseUser object
    console.log(
      `Success! User ${loggedInUser.get(
        'username'
      )} has successfully signed in!`
    );

    var currentParseUser = await Parse.User.current();
    callback(currentParseUser);
    return true;

  } catch (error) {
    // Error can be caused by wrong parameters or lack of Internet connection
    console.log(`Error! ${error.message}`);

    if (errCallback){
      errCallback();
    }

    return false;
  }

};

export const registerParseUser = async function (Parse, usernameValue, passwordValue, callback, errCallback = null) {

    try {
      // Since the signUp method returns a Promise, we need to call it using await
      const createdUser = await Parse.User.signUp(usernameValue, passwordValue);
      console.log(
        `Success! User ${createdUser.getUsername()} was successfully created!`
      );

      callback(createdUser);

      return true;
    } catch (error) {
      // signUp can fail if any parameter is blank or failed an uniqueness check on the server
      console.log(`Error! ${error}`);

      if (errCallback){
        errCallback();
      }

      return false;
    }

  };

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
    CS_NOTIFY_LOAD_ACTION: "web-ui-notify-load-action",
    SW_CREATE_DB: "sw-create-db",
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
    SW_WEB_PAGE_LOADED: "sw-web-page-loaded",
    SW_DB_CREATED: "sw-db-created",
    SW_DB_NOT_CREATED_YET: "sw-db-not-created-yet",
    SW_DB_INIT_FAILED:"sw-db-init-failed",
    SW_DB_CREATION_FAILED:"sw-db-creation-failed",
  },

  separator: "|",

};

export const testTabUrl = (url) => {

  return (new RegExp(appParams.WEB_PAGE_URL_PATTERNS.join("|"))).test(url);

}

export const checkWebPage = (callback) => {

  // Making sure all the necessary tags are fully loaded first
  var sectionContainerClassName = (/github.com/.test((window.location.href.split("?"))[0]) ? appParams.GITHUB_SECTION_MARKER_CONTAINER_CLASS_NAME : appParams.LINKEDIN_SECTION_MARKER_CONTAINER_CLASS_NAME);

  var selectedTags = document.getElementsByClassName(sectionContainerClassName);

  if (selectedTags.length == 0){
    setTimeout(() => {
      checkWebPage(callback);
    }, appParams.TIMER_VALUE);
  }
  else{
    // setUpAppWithinWebPage();
    callback();
  }
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

function executeCallback(message, sendResponse, responseParams, responseCallbacks){

  var param = [message.header, message.data.objectStoreName].join(messageParams.separator);
  var index = responseParams.indexOf(param);
  if (index >= 0){
    (responseCallbacks[index])(message, sendResponse);
    return true;
  }

  return false;
}

export function startMessageListener(listenerSettings){

  var responseParams = []; var responseCallbacks = [];

  listenerSettings.forEach((settings) => {
    responseParams.push(settings.param);
    responseCallbacks.push(settings.callback);
  });


  // Listening for messages from the service worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    executeCallback(message, sendResponse, responseParams, responseCallbacks);

  });


}
