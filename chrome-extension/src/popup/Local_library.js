
export const appParams = {
  appName: "LinkBeam",
  appVersion: "0.1.0", 
  keywordCountLimit: 5, 
  searchPageLimit: 3, 
  bookmarkCountLimit: 5,
  extShadowHostId: "linkBeamExtensionMainRoot",
  sectionMarkerID: "linkbeam-extension-section-marker",
  commentModalContainerID: "web-ui-comment-modal",
  commentListModalContainerID: "web-ui-comment-list-modal",
  commentRepliesListModalContainerID: "web-ui-comment-replies-list-modal",
  PARSE_HOST_URL: 'https://parseapi.back4app.com/',
  TIMER_VALUE: 3000,
  appAuthor: "Jojo Rabbit",

  GITHUB_SECTION_MARKER_CONTAINER_CLASS_NAME: "js-pinned-items-reorder-container",
  LINKEDIN_SECTION_MARKER_CONTAINER_CLASS_NAME: "core-section-container",
  // LINKEDIN_SECTION_MARKER_CONTAINER_CLASS_NAME: "pvs-header__container",
  
  WEB_PAGE_URL_PATTERNS: ["github.com", "linkedin.com"],
  INTERVAL_FEEDBACK: 5,
  WEB_APP_ITEM_LIMIT_NUM: 3,
  DATE_RANGE_SEPARATOR: "-",
  COMPONENT_CONTEXT_NAMES: {
    HOME: "Home",
    CALENDAR: "Calendar",
    REMINDERS: "Reminders",
    SETTINGS: "Settings", 
    KEYWORDS: "Keywords",
    BOOKMARKS: "Bookmarks",
    STATISTICS: "Statistics",
    PROFILE_ACTIVITY: "Profile Activity",
    PROFILE: "Profile",
    MY_ACCOUNT: "MyAccount",
    FEEDBACK: "Feedback",
    FEED_DASHBOARD: "Feed's Dashboard",
  },
}

export const dbData = {
  objectStoreNames: {
    VISITS: "searches",
    BOOKMARKS: "bookmarks",
    SETTINGS: "settings",
    REMINDERS: "reminders",
    KEYWORDS: "keywords",
    PROFILES: "profiles",
    NOTIFICATIONS: "notifications",
    PROFILE_ACTIVITY: "profile_activity",
  }
}

export const chartData = {

  stickColors: [
          'rgba(255, 26, 104, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],

  stickBorderColors: [
          'rgba(255, 26, 104, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],

}

export const dbDataSanitizer = {

  profileRelationMetrics: function(str) {

    if (!str){
      return 0;
    }

    str = str.replace("connections", "")
             .replace("followers", "")
             // french
             .replace("abonnés", "")
             .replace("relations", "")
             .replace("+ de ", "");

    let newstr = "";
    // Loop and traverse string
    for (let i = 0; i < str.length; i++)
        if (!(str[i] == "\n" || str[i] == "\r" || str[i] == " " || str[i] == "+")){
          if (str[i] == "K" || str[i] == "k"){
            newstr += "000"
          }
          else{
            newstr += str[i];
          }
        }

    return parseInt(newstr);

  },

  profileRelationDataPreproc: function(str) {

    str = str.replaceAll("&nbsp;", " ");

    return str;

  },

  preSanitize: function(str){

    // clean the front
    var startIndex = 0, endIndex = str.length - 1;
    while(str[startIndex] == " " || str[startIndex] == "\n"){
      startIndex++;
    }

    while(str[endIndex] == " " || str[endIndex] == "\n"){
      endIndex--;
    }

    return str.slice(startIndex, endIndex + 1);

  },


  periodDates: function(expPeriod, func){

    // handling date range
    var dateRange = this.preSanitize(expPeriod); 
    if (dateRange.indexOf("\n") != -1){
      dateRange = dateRange.split("\n")[0];
    } 
    else if (dateRange.indexOf("·") != -1){
      dateRange = dateRange.split("·")[0];
    }
    dateRange = dateRange.split(appParams.DATE_RANGE_SEPARATOR);

    var startDateRange = this.preSanitize(dateRange[0]), 
        endDateRange = this.preSanitize(dateRange[1]);

    if (func.moment(startDateRange, "MMM YYYY").isValid()){

      // if ()

      startDateRange = func.moment(startDateRange, "MMM YYYY");
    }
    else{
      if (func.moment.locale() == "en-gb"){
        func.moment.locale("fr");
        startDateRange = func.moment(startDateRange, "MMM YYYY");
        func.moment.locale("en-gb");
      }
      else if (func.moment.locale() == "fr"){
        func.moment.locale("en-gb");
        startDateRange = func.moment(startDateRange, "MMM YYYY");
        func.moment.locale("fr");
      }

      if (!startDateRange.isValid()){
        alert("An error occured when converting some dates.");
        startDateRange = null;
      }

    }

    // then the end date
    if (["aujourd’hui", "Present"].indexOf(endDateRange) != -1){
      endDateRange = func.moment();
    }
    else{
      if (func.moment(endDateRange, "MMM YYYY").isValid()){
        endDateRange = func.moment(endDateRange, "MMM YYYY");
      }
      else{

        if (func.moment.locale() == "en-gb"){
          func.moment.locale("fr");
          endDateRange = func.moment(endDateRange, "MMM YYYY");
          func.moment.locale("en-gb");
        }
        else if (func.moment.locale() == "fr"){
          func.moment.locale("en-gb");
          endDateRange = func.moment(endDateRange, "MMM YYYY");
          func.moment.locale("fr");
        }

        if (!endDateRange.isValid()){
          alert("An error occured when converting some dates.");
          endDateRange = null;
        }


      }
    }

    if (!startDateRange || !endDateRange){
      return null;
    }

    return {startDateRange: startDateRange, endDateRange: endDateRange};

  }

};

export const procExtractedData = function(jsonDataBlob, fileName, action, zip){

  if (action == "export"){

    const url = window.URL.createObjectURL(jsonDataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();

  }
  else if (action == "archiving"){
    
    (async () => {    

      zip.file(fileName, jsonDataBlob);

      // Generate the zip file
      const zipData = await zip.generateAsync({
        type: "blob",
        streamFiles: true,
      });

      // Create a download link for the zip file
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(zipData);

      fileName = fileName.replace(".json", ".zip");

      link.download = fileName;
      link.click();
      link.remove();
    })();

  }

}

export const performEdInstitutionComparison = function(theProfile, institutionName, profileList){

  var institutionNameWords = institutionName.split(" "), results = [];

  for (var profile of profileList){

    if (profile.url == theProfile.url){
      continue;
    }

    if (!profile.education){
      continue;
    }

    for (var education of profile.education){

      if (!education.institutionName){
        continue;
      }
      
      var institutionName = dbDataSanitizer.preSanitize(education.institutionName);

      var percentage = 0;
      for (var word of institutionNameWords){
        if (institutionName.indexOf(word) != -1){
          percentage += 1;
        }
      }

      percentage /= institutionNameWords.length;
      if (percentage > .75){
        results.push(profile);
      }

    } 

  }

  return results;

}

export const performCompanyComparison = function(theProfile, companyName, profileList){

  var companyNameWords = companyName.split(" "), results = [];

  for (var profile of profileList){

    if (profile.url == theProfile.url){
      continue;
    }

    if (!profile.experience){
      continue;
    }

    for (var experience of profile.experience){

      if (!experience.company){
        continue;
      }
      
      var companyName = dbDataSanitizer.preSanitize(experience.company);

      var percentage = 0;
      for (var word of companyNameWords){
        if (companyName.indexOf(word) != -1){
          percentage += 1;
        }
      }

      percentage /= companyNameWords.length;
      if (percentage > .75){
        results.push(profile);
      }

    } 

  }

  return results;

}

export const performCertComparison = function(theProfile, certName, profileList){

  var certNameWords = certName.split(" "), results = [];

  for (var profile of profileList){

    if (profile.url == theProfile.url){
      continue;
    }

    if (!profile.certifications){
      continue;
    }

    for (var certification of profile.certifications){

      if (!certification.title){
        continue;
      }
      
      var certTitle = dbDataSanitizer.preSanitize(certification.title);

      var percentage = 0;
      for (var word of certNameWords){
        if (certTitle.indexOf(word) != -1){
          percentage += 1;
        }
      }

      percentage /= certNameWords.length;
      if (percentage > .75){
        results.push(profile);
      }

    } 

  }

  return results;

}

export const performLanguageComparison = function(theProfile, langName, profileList){

  var results = [], 
      altLanguages = {
        french: "français", 
        english: "anglais",
        "français": "french",
        anglais: "english",
      };


  for (var profile of profileList){

    if (!profile.languages){
      continue;
    }

    if (profile.url == theProfile.url){
      continue;
    }

    for (var languageObject of profile.languages){

      if ((languageObject.name.toLowerCase().indexOf(langName.toLowerCase()) != -1 
                || languageObject.name.toLowerCase().indexOf(altLanguages[langName.toLowerCase()]) != -1)
          && results.map(e => e.url).indexOf(profile.url) == -1){

        results.push(profile);

      }

    }

  }


  return results;

}

export const computePeriodTimeSpan = function(objects, periodLabel, func){

  var expTime = 0;
  var refTime = func.moment();

  if (!objects){
    return 0;
  }

  // Setting the refTime
  for (var object of objects){

    if (!object.period){
      continue;
    }

    if (typeof object.period == "string"){
      var period = dbDataSanitizer.periodDates(object.period, func);
      if (!period){
        continue;
      }
      object.period = period;
    }
    else{
      if (typeof object.period.startDateRange == "string"){
        object.period.startDateRange = func.moment(object.period.startDateRange, func.moment.ISO_8601);
      }

      if (typeof object.period.endDateRange == "string"){
        object.period.endDateRange = func.moment(object.period.endDateRange, func.moment.ISO_8601);
      }
    }

    refTime = (object.period.startDateRange < refTime) ? object.period.startDateRange : refTime;

  }

  // var counter = 0;
  // console.log("µµµµµµµµµµµµµµµµµ : ", refTime),

  const recursiveCompute = function(refTime){

    var currentObjects = [], futureObjects = [];
    for (var object of objects){

      if (!object.period){
        continue;
      }

      if (object.period.startDateRange <= refTime){
        if (object.period.endDateRange > refTime){
          currentObjects.push(object);
        }
      }
      else{
        futureObjects.push(object);
      }

    }

    // console.log("?????????????????? : ", refTime, currentObjects, futureObjects);

    if (currentObjects.length > 0){
      currentObjects.sort(function(a, b){ return (refTime.toDate() - a.period.endDateRange.toDate()) - (refTime.toDate() - b.period.endDateRange.toDate()); });
      var object = currentObjects[0];
      expTime += (object.period.endDateRange.toDate() - refTime.toDate());
      return recursiveCompute(object.period.endDateRange);
    }
    else{
      if (futureObjects.length > 0){
        futureObjects.sort(function(a, b){return a.period.startDateRange - b.period.startDateRange});
        var object = futureObjects[0];
        expTime += (object.period.endDateRange.toDate() - object.period.startDateRange.toDate());
        return recursiveCompute(object.period.endDateRange);
      }
      else{
        return expTime;
      }
    }

  }

  return recursiveCompute(refTime);

}

export const logInParseUser = async function(Parse, usernameValue, passwordValue, callback, errCallback = null) {

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

export const groupObjectsByDate = (objectList) => {

  var results = {};

  // Grouping the visits by date
  for (var object of objectList){
    var objectDate = object.date.split("T")[0];
    if (objectDate in results){
      (results[objectDate]).push(object);
    }
    else{
      results[objectDate] = [object];
    }
  }

  return results;

}

export const groupObjectsByMonth = (objectList) => {

  var results = {};

  // Grouping the visits by date
  for (var object of objectList){
    var objectMonth = (new Date(object.date)).getMonth();
    if (objectMonth in results){
      (results[objectMonth]).push(object);
    }
    else{
      results[objectMonth] = [object];
    }
  }

  return results;

}

export const getPeriodVisits = (context, index, func, profile = null) => {

  var startDate = null;
    switch(index){
      case 0: {
        startDate = func.moment().subtract(6, 'days').toDate();
        break;
      }

      case 1: {
        startDate = func.moment().subtract(30, 'days').toDate();
        break;
      }

      case 2: {
        startDate = func.moment().subtract(12, 'months').toDate();
        break;
      }
    }
    var props = { date: [startDate, "to", (new Date())] };
    if (profile){
      props.url = profile.url;
    }
    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.VISITS, { context: context, criteria: { props: props }});

}

export const saveCanvas = (uuid, fileName, saveAs) => {
  //save to png
  var canvasSave = document.getElementById("chartTag_" + uuid);
  if (canvasSave.tagName == "DIV"){

    var svgNode = canvasSave.firstChild;
    // Converting svg to canvas
    const svgString = (new XMLSerializer()).serializeToString(svgNode);
    const svgBlob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8'
    });

    const DOMURL = window.URL || window.webkitURL || window;
    const url = DOMURL.createObjectURL(svgBlob);

    const image = new Image();
    image.width = svgNode.width.baseVal.value;
    image.height = svgNode.height.baseVal.value;
    image.src = url;
    image.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.classList.add('d-none');
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      DOMURL.revokeObjectURL(url);

      // const imgURI = canvas
      //   .toDataURL('image/png')
      //   .replace('image/png', 'image/octet-stream');
      // triggerDownload(imgURI);

      canvasSave = canvas;
      canvasSave.toBlob(function (blob) {
        saveAs(blob, fileName);
      });

    };

    return;

  }

  console.log("''''''''''''' : ", "chartTag_" + uuid, canvasSave);
  canvasSave.toBlob(function (blob) {
    saveAs(blob, fileName);
  });
}

export const deactivateTodayReminders = (reminderList) => {

  reminderList.forEach((reminder) => {
    sendDatabaseActionMessage(messageParams.requestHeaders.UPDATE_OBJECT, dbData.objectStoreNames.REMINDERS, { context: "App", criteria: { props: { object: reminder, activated: false} }});
  });

}

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
    SW_PROCESS_FAILED: "sw-process-failed",
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

export const groupVisitsByProfile = (visits) => {

  var results = [];
  for (var visit of visits){
    var index = results.map(e => e.url).indexOf(visit.url);
    if (index == -1){
      visit.count = 1;
      results.push(visit);
    }
    else{
      if (new Date(results[index].date) >= new Date(visit.date)){
        (results[index]).count++;
      }
      else{
        visit.count = (results[index]).count + 1;
        results[index] = visit;
      }
    }
  }

  results.sort((a,b) => new Date(b.date.split("T")[0]) - new Date(a.date.split("T")[0]));

  return {list: results, visitCount: visits.length};

}

export const secondsToHms = (d) => {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
}

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
  sendDatabaseActionMessage(messageParams.requestHeaders.UPDATE_OBJECT, dbData.objectStoreNames.SETTINGS, { context: pageTitle, criteria: { props: {currentPageTitle: pageTitle} } });

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

  let backgrounds = [], borders = [];

  var indices = [];
  for (var i = 0; i < chartData.stickColors.length; i++){
    indices.push(i);
  }

  while(backgrounds.length < length){

    shuffle(indices);

    for (var i of indices){
      backgrounds.push(chartData.stickColors.at(i));
      borders.push(chartData.stickBorderColors.at(i));

      if (backgrounds.length == length){
        break;
      }
    }

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
