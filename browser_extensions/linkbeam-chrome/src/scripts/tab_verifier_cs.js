/*import { 
  messageParams,
  appParams,
} from "../react_components/Local_library";*/

// Content script designed to make sure the active tab is a linkedin page

function extractData(){

  let pageData = {};

  // Setting datetime and page's url
  let dateTime = new Date().toISOString(),
      pageUrl = (window.location.href.split("?"))[0];

  // Setting profile fullName property
  // let fullName = (document.getElementsByClassName("top-card-layout__title")[0]).firstChild.textContent;
  let fullName = null, fullNameTagContainer = document.querySelector(".top-card-layout__title");
  if (fullNameTagContainer){
    fullName = fullNameTagContainer.firstChild.textContent;
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

  let company = null, compagnyTagContainer = document.querySelector('.top-card__links-container').firstElementChild;
  if (compagnyTagContainer){
    company = {
      name: (compagnyTagContainer.firstElementChild.querySelector(":nth-child(2)") ? compagnyTagContainer.firstElementChild.querySelector(":nth-child(2)").innerHTML : null),
      logo: (compagnyTagContainer.firstElementChild.firstElementChild ? compagnyTagContainer.firstElementChild.firstElementChild.src : null), 
      link: (compagnyTagContainer.firstElementChild ? compagnyTagContainer.firstElementChild.href : null),
    };
  }

  let featuredSchool = null, featuredSchoolTagContainer = document.querySelector('.top-card__links-container').children[1];
  if (featuredSchoolTagContainer){
    featuredSchool = {
      name: (featuredSchoolTagContainer.firstElementChild.querySelector(":nth-child(2)") ? featuredSchoolTagContainer.firstElementChild.querySelector(":nth-child(2)").innerHTML : null),
      logo: (featuredSchoolTagContainer.firstElementChild.firstElementChild ? featuredSchoolTagContainer.firstElementChild.firstElementChild.src : null),
      link: (featuredSchoolTagContainer.firstElementChild ? featuredSchoolTagContainer.firstElementChild.href : null),
    };
  }

  let experience = [], experienceSectionTag = document.querySelector(".core-section-container.experience");
  if (experienceSectionTag){

    Array.from((document.querySelector(".core-section-container.experience .experience__list")).children).forEach((experienceLiTag) => {
      var experienceItem = {};
      experienceItem["title"] = experienceLiTag.querySelector(".profile-section-card__title").firstChild.textContent;
      experienceItem["company"] = experienceLiTag.querySelector(".profile-section-card__subtitle").firstElementChild.textContent;
      experienceItem["period"] = experienceLiTag.querySelector(".profile-section-card__meta").firstElementChild.textContent;
      experience.push(experienceItem);
    });

  }

  let newsFeed = [], newsFeedTagContainer = document.querySelector(".core-section-container.activities");
  if (newsFeedTagContainer){

    Array.from(document.querySelectorAll(".core-section-container.activities li")).forEach((activityLiTag) => {
      var article = {
        link: (activityLiTag.querySelector("a") ? experienceLiTag.querySelector("a").href : null),
        picture: (activityLiTag.querySelector("img") ? activityLiTag.querySelector("img") : null),
        title: (activityLiTag.querySelector(".base-main-card__title") ? activityLiTag.querySelector(".base-main-card__title").innerHTML : null),        
      };
      newsFeed.push(article);
    });

  }

  if (fullName){
    
    pageData = {
        date: dateTime,
        url: pageUrl,
        profile: {
            url: pageUrl,
            fullName: fullName,
            title: title,
            info: null,
            avatar: null,
            coverImage: null,
            date: dateTime,
            nFollowers: nFollowers,
            nConnections: nConnections, 
            location: location,
            featuredSchool: featuredSchool,
            company: company
            education: {},
            experience: experience,
            certifications: {},
            newsFeed: newsFeed,
            languages: {},
        },
    };
    
  }


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
