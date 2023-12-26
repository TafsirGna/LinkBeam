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

  let userAbout = null, userAboutTagContainer = document.querySelector(".core-section-container__content");
  if (userAboutTagContainer){
    userAbout = userAboutTagContainer.textContent;
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

  let experience = [], experienceSectionTag = document.querySelector(".core-section-container.experience");
  if (experienceSectionTag){

    Array.from((document.querySelector(".core-section-container.experience .experience__list")).children).forEach((experienceLiTag) => {
      
      var experienceItem = {}, groupPositions = experienceLiTag.querySelector(".experience-group__positions");
      if (groupPositions){

        var companyName = (experienceLiTag.querySelector(".experience-group-header__company") ? experienceLiTag.querySelector(".experience-group-header__company").textContent : null);

        Array.from(groupPositions.querySelectorAll(".profile-section-card")).forEach((positionLiTag) => {
          var experienceItem = {};
          experienceItem["title"] = (positionLiTag.querySelector(".experience-item__title") ? positionLiTag.querySelector(".experience-item__title").textContent : null);
          experienceItem["company"] = companyName;
          experienceItem["period"] = (positionLiTag.querySelector(".date-range") ? positionLiTag.querySelector(".date-range").textContent : null);
          experience.push(experienceItem);
        });

      }
      else{

        experienceItem["title"] = (experienceLiTag.querySelector(".experience-item__title") ? experienceLiTag.querySelector(".experience-item__title").textContent : null);
        experienceItem["company"] = (experienceLiTag.querySelector(".experience-item__subtitle") ? experienceLiTag.querySelector(".experience-item__subtitle").textContent : null); 
        experienceItem["period"] = (experienceLiTag.querySelector(".date-range") ? experienceLiTag.querySelector(".date-range").textContent : null);
        experience.push(experienceItem);

      }

    });

  }

  let newsFeed = [], newsFeedTagContainer = document.querySelector(".core-section-container.activities");
  if (newsFeedTagContainer){

    Array.from(document.querySelectorAll(".core-section-container.activities li")).forEach((activityLiTag) => {
      var article = {
        link: (activityLiTag.querySelector("a") ? activityLiTag.querySelector("a").href : null),
        picture: (activityLiTag.querySelector("img") ? activityLiTag.querySelector("img").src : null),
        title: (activityLiTag.querySelector(".base-main-card__title") ? activityLiTag.querySelector(".base-main-card__title").innerHTML : null),        
      };
      newsFeed.push(article);
    });

  }

  if (fullName){
    
    pageData = {
        date: dateTime,
        url: pageUrl,
        timeCount: { value: (Math.random() * (180 - 30) + 30)/*.toFixed(1)*/, lastCheck: (new Date()).toISOString() },
        profile: {
            url: pageUrl,
            fullName: fullName,
            title: title,
            info: userAbout,
            avatar: avatar,
            coverImage: coverImage,
            date: dateTime,
            nFollowers: nFollowers,
            nConnections: nConnections, 
            location: location,
            featuredSchool: featuredSchool,
            company: company,
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
