/*import { 
  messageParams,
  appParams,
} from "../react_components/Local_library";*/

// Content script designed to make sure the active tab is a linkedin page

function extractData(){

  let pageData = {};

  /*// Setting datetime and page's url
  let dateTime = new Date().toISOString(),
      pageUrl = (window.location.href.split("?"))[0];

  // Setting profile fullName property
  // let fullName = (document.getElementsByClassName("top-card-layout__title")[0]).firstChild.textContent;
  let fullName = (document.getElementsByClassName("top-card-layout__title")[0]).firstChild.textContent;
  let title = (document.getElementsByClassName("top-card-layout__headline")[0]).innerHTML;
  let location = (document.getElementsByClassName("top-card-layout__first-subline")[0]).firstElementChild.innerHTML;
  let nFollowers = document.querySelector('.top-card-layout__first-subline :nth-child(2)').innerHTML;
  let nConnections = document.querySelector('.top-card-layout__first-subline :nth-child(3)').innerHTML;

  let experience = [], experienceSectionTag = null;
  experienceSectionTag = document.querySelector(".core-section-container.experience");
  if (experienceSectionTag){

    Array.from((document.querySelector(".core-section-container.experience .experience__list")).children).forEach((experienceLiTag) => {
      var experienceItem = {};
      experienceItem["title"] = experienceLiTag.querySelector(".profile-section-card__title").firstChild.textContent;
      experienceItem["company"] = experienceLiTag.querySelector(".profile-section-card__subtitle").firstElementChild.textContent;
      experienceItem["period"] = experienceLiTag.querySelector(".profile-section-card__meta").firstElementChild.textContent;
      experience.push(experienceItem);
    });

  }

  pageData = {
      date: dateTime,
      url: pageUrl,
      profile: {
          url: pageUrl,
          fullName: fullName,
          title: title,
          info: "About",
          imageUrl: "ok",
          coverImageUrl: "ok",
          date: dateTime,
          nFollowers: 1,
          nConnections: 1, 
          location: location,
          education: {},
          experience: experience,
          certifications: {},
          newsFeed: {},
          languages: {},
      },
  };*/


  // checking if a linkbeam code has already been injected
  // var linkBeamRootTag = document.getElementById(appParams.extShadowHostId);
  var linkBeamRootTag = document.getElementById("linkBeamExtensionMainRoot");
  pageData["codeInjected"] = (linkBeamRootTag ? true : false);

  return pageData;
}

var webPageData = extractData();

chrome.runtime.sendMessage({header: /*messageParams.responseHeaders.CS_WEB_PAGE_DATA*/ "sw-web-page-data", data: webPageData}, (response) => {
  console.log('linkedin-data response sent', response, webPageData);
})
