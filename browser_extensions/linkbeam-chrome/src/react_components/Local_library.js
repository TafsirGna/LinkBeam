export const stickColors = ['rgba(255, 26, 104, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'];

export const stickBorderColors = [
          'rgba(255, 26, 104, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ];

export const messageParameters = {

  actionObjectNames: {
    SEARCHES: "searches",
    BOOKMARKS: "bookmarks",
    SETTINGS: "settings",
    REMINDERS: "reminders",
    KEYWORDS: "keywords",
    PROFILES: "profiles"
  },
  actionNames: {
    GET_LIST: "object-list",
    GET_COUNT: "object-count",
    GET_OBJECT: "object-data",
    ADD_OBJECT: "object-added",
    DEL_OBJECT: "object-deleted",
    GET_PROCESSED_DATA: "processed-data",
  },
  separator: "|",

};

export function saveCurrentPageTitle(pageTitle){

  // Saving the current page title
  sendDatabaseActionMessage("update-object", messageParameters.actionObjectNames.SETTINGS, {property: "currentPageTitle", value: pageTitle});

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
  for (var i = 0; i < stickColors.length; i++){
    indices.push(i);
  }

  shuffle(indices);

  let backgrounds = []; let borders = [];
  for (var i = 0; i < length; i++){
    backgrounds.push(stickColors.at(i));
    borders.push(stickBorderColors.at(i));
  }
  
  return {borders: borders, backgrounds: backgrounds};

}

export function ack(sendResponse){
  // sending a response
  sendResponse({
      status: "ACK"
  });
}

function switchCaseFunction(message, sendResponse, responseParams, responseCallbacks){

  var param = message.header+"|"+message.data.objectStoreName;
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

      case "object-list":{

        switch(message.data.objectStoreName){

          case messageParameters.actionObjectNames.SEARCHES:{

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);
            
            break;
          }

          case messageParameters.actionObjectNames.BOOKMARKS: {
            
            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case messageParameters.actionObjectNames.KEYWORDS: {
            
            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case messageParameters.actionObjectNames.REMINDERS: {
            
            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }
        }
        
        break;
      }
      case "object-count":{

        switch(message.data.objectStoreName){
          /*case messageParameters.actionObjectNames.SEARCHES:{

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);
            
            break;
          }*/

          /*case messageParameters.actionObjectNames.BOOKMARKS: {
            
            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }*/

          case messageParameters.actionObjectNames.KEYWORDS: {
            
            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case messageParameters.actionObjectNames.REMINDERS: {
            
            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }
        }
        
        break;
      }
      case "object-data":{

        switch(message.data.objectStoreName){

          case messageParameters.actionObjectNames.SETTINGS: {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case messageParameters.actionObjectNames.PROFILES: {

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

      case "object-added":{

        switch(message.data.objectStoreName){

          case messageParameters.actionObjectNames.BOOKMARKS: {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case messageParameters.actionObjectNames.REMINDERS: {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }
        }

        break;
      }

      case "object-deleted":{

        switch(message.data.objectStoreName){

          case messageParameters.actionObjectNames.BOOKMARKS: {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }

          case messageParameters.actionObjectNames.REMINDERS: {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }
        }

        break;
      }

      case "processed-data":{

        switch(message.data.objectStoreName){

          case "views-timeline-chart": {

            switchCaseFunction(message, sendResponse, responseParams, responseCallbacks);

            break;
          }
        }

        break;
      }
    }

  });


}
