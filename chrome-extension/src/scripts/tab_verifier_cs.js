/*import { 
  messageParams,
  appParams,
} from "../react_components/Local_library";*/

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

  let nFollowers = null; nFollowersTagContainer = document.querySelector('.top-card-layout__first-subline .not-first-middot:nth-child(2) :nth-child(1)');
  if (nFollowersTagContainer){
    nFollowers = nFollowersTagContainer.innerHTML;
  }

  let nConnections = null, nConnectionsTagContainer = document.querySelector('.top-card-layout__first-subline .not-first-middot:nth-child(2) :nth-child(2)'); // document.querySelector('.top-card-layout__first-subline :nth-child(3)');
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

  var educationData = null;

  return educationData;

}

function extractLanguageData(){

  var languageData = null;

  return languageData;

}

function extractExperienceData(){

  let experienceData = null, experienceSectionTag = document.querySelector(".core-section-container.experience");
  if (experienceSectionTag){

    experienceData = [];

    Array.from((document.querySelector(".core-section-container.experience .experience__list")).children).forEach((experienceLiTag) => {
      
      var experienceItem = {}, groupPositions = experienceLiTag.querySelector(".experience-group__positions");
      if (groupPositions){

        var companyName = (experienceLiTag.querySelector(".experience-group-header__company") ? experienceLiTag.querySelector(".experience-group-header__company").textContent : null);

        Array.from(groupPositions.querySelectorAll(".profile-section-card")).forEach((positionLiTag) => {
          var experienceItem = {};
          experienceItem["title"] = (positionLiTag.querySelector(".experience-item__title") ? positionLiTag.querySelector(".experience-item__title").textContent : null);
          experienceItem["company"] = companyName;
          experienceItem["period"] = (positionLiTag.querySelector(".date-range") ? positionLiTag.querySelector(".date-range").textContent : null);
          experienceData.push(experienceItem);
        });

      }
      else{

        experienceItem["title"] = (experienceLiTag.querySelector(".experience-item__title") ? experienceLiTag.querySelector(".experience-item__title").textContent : null);
        experienceItem["company"] = (experienceLiTag.querySelector(".experience-item__subtitle") ? experienceLiTag.querySelector(".experience-item__subtitle").textContent : null); 
        experienceItem["period"] = (experienceLiTag.querySelector(".date-range") ? experienceLiTag.querySelector(".date-range").textContent : null);
        experienceData.push(experienceItem);

      }

    });

  }

  return experienceData;

}

function extractActivityData(){

  let activityData = null, 
      activityTagContainer = document.querySelector(".core-section-container.activities");
  if (activityTagContainer){

    activityData = [];

    Array.from(document.querySelectorAll(".core-section-container.activities li")).forEach((activityLiTag) => {
      var article = {
        link: (activityLiTag.querySelector("a") ? activityLiTag.querySelector("a").href : null),
        picture: (activityLiTag.querySelector("img") ? activityLiTag.querySelector("img").src : null),
        title: (activityLiTag.querySelector(".base-main-card__title") ? activityLiTag.querySelector(".base-main-card__title").innerHTML : null),        
      };
      activityData.push(article);
    });

  }

  return activityData;

}

function extractCertificationData(){

  var certificationData = null;

  return certificationData;

}

function extractProjectData(){

  var projectData = null;

  return projectData;

}

function extractSuggestionsData(){

  // PEOPLE ALSO VIEWED SECTION
  var profileSuggestions = null,
      profileSuggestionsContainer = document.querySelector('.aside-section-container');
  if (profileSuggestionsContainer){

    profileSuggestions = [];

    Array.from(document.querySelectorAll(".aside-section-container li")).forEach((suggestionLiTag) => {
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
      // date: dateTime,
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

const interval = setInterval(
  () => {

    var webPageData = extractData();

    chrome.runtime.sendMessage({header: /*messageParams.responseHeaders.CS_WEB_PAGE_DATA*/ "sw-web-page-data", data: webPageData}, (response) => {
      console.log('linkedin-data response sent', response, webPageData);
    });

    if (!webPageData){
      clearInterval(interval);
      return;
    }

  }, 
  1000
);
