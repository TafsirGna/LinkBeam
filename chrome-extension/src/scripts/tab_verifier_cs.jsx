/*import { 
  messageParams,
  appParams,
} from "../react_components/Local_library";*/
import styles from "../contentScriptUi/styles.min.css";
import InjectedReminderToastView from "../contentScriptUi/widgets/InjectedReminderToastView";

// Content script designed to make sure the active tab is a linkedin page

function extractHeaderData(){

  let fullName = null, fullNameTagContainer = document.querySelector(".top-card-layout__title");
  if (fullNameTagContainer){
    fullName = fullNameTagContainer.firstChild.textContent;
  }

  let avatar = null, avatarTagContainer = (document.querySelector(".top-card__profile-image"));
  if (avatarTagContainer){
    avatar = avatarTagContainer.src;
  }

  let coverImage = null, coverImageTagContainer = (document.querySelector(".cover-img__image"));
  if (coverImageTagContainer){
    coverImage = coverImageTagContainer.src;
  }

  let title = null, titleTagContainer = document.querySelector(".top-card-layout__headline");
  if (titleTagContainer){
    title = titleTagContainer.innerHTML;
  }

  let location = null, locationTagContainer = document.querySelector('.top-card-layout__first-subline .not-first-middot:nth-child(1)');
  if (locationTagContainer){
    location = locationTagContainer.firstElementChild.innerHTML;
  }

  let nFollowers = null; nFollowersTagContainer = (document.querySelectorAll('.top-card-layout__first-subline .not-first-middot')[1]).children[0];
  if (nFollowersTagContainer){
    nFollowers = nFollowersTagContainer.innerHTML;
  }

  let nConnections = null, nConnectionsTagContainer = (document.querySelectorAll('.top-card-layout__first-subline .not-first-middot')[1]).children[1];
  if (nConnectionsTagContainer){
    nConnections = nConnectionsTagContainer.innerHTML;
  }

  let company = null, featuredSchool = null, topCardLinksContainer = document.querySelector('.top-card__links-container');
  if (topCardLinksContainer){

    companyTagContainer = topCardLinksContainer.querySelector('div[data-section="currentPositionsDetails"]');
    if (companyTagContainer){
      company = {
        name: (companyTagContainer.firstElementChild.querySelector(":nth-child(2)") ? companyTagContainer.firstElementChild.querySelector(":nth-child(2)").innerHTML : null),
        logo: (companyTagContainer.firstElementChild.firstElementChild ? companyTagContainer.firstElementChild.firstElementChild.src : null), 
        link: (companyTagContainer.firstElementChild ? companyTagContainer.firstElementChild.href : null),
      };
    }

    featuredSchoolTagContainer = topCardLinksContainer.querySelector('div[data-section="educationsDetails"]');
    if (featuredSchoolTagContainer){
      featuredSchool = {
        name: (featuredSchoolTagContainer.firstElementChild.querySelector(":nth-child(2)") ? featuredSchoolTagContainer.firstElementChild.querySelector(":nth-child(2)").innerHTML : null),
        logo: (featuredSchoolTagContainer.firstElementChild.firstElementChild ? featuredSchoolTagContainer.firstElementChild.firstElementChild.src : null),
        link: (featuredSchoolTagContainer.firstElementChild ? featuredSchoolTagContainer.firstElementChild.href : null),
      };
    }

  }

  return {
    fullName: fullName,
    avatar: avatar,
    coverImage: coverImage,
    title: title,
    location: location,
    nFollowers: nFollowers,
    nConnections: nConnections,
    company: company,
    featuredSchool: featuredSchool,
  };

}

function extractAboutData(){

  let userAbout = null, userAboutTagContainer = document.querySelector(".core-section-container__content");
  if (userAboutTagContainer){
    userAbout = userAboutTagContainer.textContent;
  }

  return userAbout;

}

function extractEducationData(){

  var sectionName = ".core-section-container.education";

  var educationData = null, educationSectionTag = document.querySelector(sectionName);
  if (educationSectionTag){

    educationData = [];

    Array.from(document.querySelectorAll(sectionName + " li")).forEach((educationLiTag) => {
      var education = {
        institutionName: (educationLiTag.querySelector("h3") ? educationLiTag.querySelector("h3").innerHTML : null),
        degree: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
        period: (educationLiTag.querySelector(".date-range") ? educationLiTag.querySelector(".date-range").textContent : null),
      };
      educationData.push(education);
    });

  }

  return educationData;

}

function extractLanguageData(){

  var sectionName = ".core-section-container.languages";

  var languageData = null, languageSectionTag = document.querySelector(sectionName);
  if (languageSectionTag){

    languageData = [];

    Array.from(document.querySelectorAll(sectionName + " li")).forEach((languageLiTag) => {
      var language = {
        name: (languageLiTag.querySelector("h3") ? languageLiTag.querySelector("h3").innerHTML : null),
        proficiency: (languageLiTag.querySelector("h4") ? languageLiTag.querySelector("h4").innerHTML : null),
      };
      languageData.push(language);
    });

  }

  return languageData;

}

function extractExperienceData(){

  var sectionName = ".core-section-container.experience";

  let experienceData = null, experienceSectionTag = document.querySelector(sectionName);
  if (experienceSectionTag){

    experienceData = [];

    Array.from((document.querySelector(sectionName + " .experience__list")).children).forEach((experienceLiTag) => {
      
      var experienceItem = {}, groupPositions = experienceLiTag.querySelector(".experience-group__positions");
      if (groupPositions){

        var companyName = (experienceLiTag.querySelector(".experience-group-header__company") ? experienceLiTag.querySelector(".experience-group-header__company").textContent : null);

        Array.from(groupPositions.querySelectorAll(".profile-section-card")).forEach((positionLiTag) => {
          var experienceItem = {};
          experienceItem["title"] = (positionLiTag.querySelector(".experience-item__title") ? positionLiTag.querySelector(".experience-item__title").textContent : null);
          experienceItem["company"] = companyName;
          experienceItem["period"] = (positionLiTag.querySelector(".date-range") ? positionLiTag.querySelector(".date-range").textContent : null);
          experienceItem["location"] = (positionLiTag.querySelectorAll(".experience-item__meta-item")[1] ? positionLiTag.querySelectorAll(".experience-item__meta-item")[1].textContent : null);
          experienceData.push(experienceItem);
        });

      }
      else{

        experienceItem["title"] = (experienceLiTag.querySelector(".experience-item__title") ? experienceLiTag.querySelector(".experience-item__title").textContent : null);
        experienceItem["company"] = (experienceLiTag.querySelector(".experience-item__subtitle") ? experienceLiTag.querySelector(".experience-item__subtitle").textContent : null); 
        experienceItem["period"] = (experienceLiTag.querySelector(".date-range") ? experienceLiTag.querySelector(".date-range").textContent : null);
        experienceItem["location"] = (experienceLiTag.querySelectorAll(".experience-item__meta-item")[1] ? experienceLiTag.querySelectorAll(".experience-item__meta-item")[1].textContent : null);
        experienceData.push(experienceItem);

      }

    });

  }

  return experienceData;

}

function extractActivityData(){

  var sectionName = ".core-section-container.activities";
  let activityData = null, 
      activityTagContainer = document.querySelector(sectionName);
  if (activityTagContainer){

    activityData = [];

    Array.from(document.querySelectorAll(sectionName + " li")).forEach((activityLiTag) => {
      var article = {
        link: (activityLiTag.querySelector("a") ? activityLiTag.querySelector("a").href : null),
        picture: (activityLiTag.querySelector(".main-activity-card__img") ? activityLiTag.querySelector(".main-activity-card__img").src : null),
        title: (activityLiTag.querySelector(".base-main-card__title") ? activityLiTag.querySelector(".base-main-card__title").innerHTML : null),        
        action: (activityLiTag.querySelector(".base-main-card__subtitle") ? activityLiTag.querySelector(".base-main-card__subtitle").innerHTML : null),
      };
      activityData.push(article);
    });

  }

  return activityData;

}

function extractCertificationData(){

  var sectionName = ".core-section-container.certifications";

  var certificationData = null, certificationSectionTag = document.querySelector(sectionName);
  if (certificationSectionTag){

    certificationData = [];

    Array.from(document.querySelectorAll(sectionName + " li")).forEach((certificationLiTag) => {
      var certification = {
        title: (certificationLiTag.querySelector("h3 a") ? certificationLiTag.querySelector("h3 a").textContent : null),
        issuer: (certificationLiTag.querySelector("h4 a") ? certificationLiTag.querySelector("h4 a").textContent : null),
        // date: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
        // link: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
        // credentialID: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
      };
      certificationData.push(certification);
    });

  }

  return certificationData;

}

function extractProjectData(){

  var projectData = null;

  return projectData;

}

function extractSuggestionsData(){

  // PEOPLE ALSO VIEWED SECTION
  var sectionName = ".aside-section-container";

  var profileSuggestions = null,
      profileSuggestionsContainer = document.querySelector(sectionName);
  if (profileSuggestionsContainer){

    profileSuggestions = [];

    Array.from(document.querySelectorAll(sectionName + " li")).forEach((suggestionLiTag) => {
      var profileSuggestion = {
        name: (suggestionLiTag.querySelector(".base-aside-card__title") ? suggestionLiTag.querySelector(".base-aside-card__title").innerHTML : null),
        location: (suggestionLiTag.querySelector(".base-aside-card__metadata") ? suggestionLiTag.querySelector(".base-aside-card__metadata").innerHTML : null),
        link: (suggestionLiTag.querySelector(".base-card") ? suggestionLiTag.querySelector(".base-card").href : null),        
        picture: (suggestionLiTag.querySelector(".bg-clip-content") ? suggestionLiTag.querySelector(".bg-clip-content").href : null),
      };
      profileSuggestions.push(profileSuggestion);
    });

  }

  return profileSuggestions;

}

function extractData(){

  let pageData = null;

  // let fullName = (document.getElementsByClassName("top-card-layout__title")[0]).firstChild.textContent;
  var headerData = extractHeaderData();

  if (headerData.fullName){
    
    pageData = {

      url: (window.location.href.split("?"))[0],
      fullName: headerData.fullName,
      title: headerData.title,
      info: extractAboutData(),
      avatar: headerData.avatar,
      coverImage: headerData.coverImage,
      nFollowers: headerData.nFollowers,
      nConnections: headerData.nConnections, 
      location: headerData.location,
      featuredSchool: headerData.featuredSchool,
      company: headerData.company,
      education: extractEducationData(),
      experience: extractExperienceData(),
      certifications: extractCertificationData(),
      activity: extractActivityData(),
      languages: extractLanguageData(),
      projects: extractProjectData(),
      profileSuggestions: extractSuggestionsData(),
      //
      codeInjected: (document.getElementById("linkBeamExtensionMainRoot") ? true : false),

    };
    
  }

  return pageData;
}     

let webPageData = null;

// Function for sending the page data
const sendTabData = (data, tabId) => {

  chrome.runtime.sendMessage({header: /*messageParams.responseHeaders.CS_WEB_PAGE_DATA*/ "sw-web-page-data", data: {profileData: data, tabId: tabId}}, (response) => {
    console.log('linkedin-data response sent', response, data);
  });

};

const getTabId = (messageData, sendResponse) => {

  // Acknowledge the message
  sendResponse({
      status: "ACK"
  });

  let tabId = messageData.tabId;

  setInterval(
    () => {

      if (webPageData == {}){
        sendTabData({}, tabId);
        return;
      }

      var data = extractData();
      if (data == webPageData){
        data = {};
      }
      sendTabData(data, tabId);
      webPageData = data;

    }, 
    3000
  );

}

const showReminders = (messageData, sendResponse) => {

  // Acknowledge the message
  sendResponse({
      status: "ACK"
  });

  var reminders = messageData.reminders;

  var shadowHost = document.createElement('div');
  shadowHost.id = /*appParams.extShadowHostId*/"extShadowHostId";
  shadowHost.style.cssText='all:initial';
  document.body.appendChild(shadowHost);

  shadowHost = document.getElementById(/*appParams.extShadowHostId*/"extShadowHostId");
  shadowHost.attachShadow({ mode: 'open' });
  const shadowRoot = shadowHost.shadowRoot;

  ReactDOM.createRoot(shadowRoot).render(
    <React.StrictMode>
      <style type="text/css">{styles}</style>
      <InjectedReminderToastView objects={reminders} />
    </React.StrictMode>
  );

}

// Retrieving the tabId variable
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

  if (message.header == "web-ui-app-settings-data") /*messageParams.responseHeaders.WEB_UI_APP_SETTINGS_DATA*/ {
      
      if (Object.hasOwn(message.data, "tabId")){
        getTabId(message.data, sendResponse);
      }
      else{ 
        if (Object.hasOwn(message.data, "reminders")){
          showReminders(message.data);
        }
      }

  }

});

