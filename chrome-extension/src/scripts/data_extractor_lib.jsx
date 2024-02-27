import styles from "../contentScriptUi/styles.min.css";
import InjectedReminderToastView from "../contentScriptUi/widgets/InjectedReminderToastView";
import InjectedKeywordToastView from "../contentScriptUi/widgets/InjectedKeywordToastView";
import ReactDOM from 'react-dom/client';
import React from 'react';

export class DataExtractorBase {

	tabId = null;
	webPageData = null;

	constructor(){

		// Starting listening to different messages
		this.startMessageListener();

	}

	// Function for sending the page data
	sendTabData(data){

	  chrome.runtime.sendMessage({header: /*messageParams.responseHeaders.CS_WEB_PAGE_DATA*/ "sw-web-page-data", data: {extractedData: data, tabId: this.tabId}}, (response) => {
	    console.log('linkedin-data response sent', response, data);
	    this.webPageData = data;
	  });

	}

	extractData(){

	}

	getTabId(messageData, sendResponse){

	  // Acknowledge the message
	  sendResponse({
	      status: "ACK"
	  });

	  this.tabId = messageData.tabId;

	  setInterval(
	    () => {

			// if (this.webPageData == {}){
			//   sendTabData({}, tabId);
			//   return;
			// }

			// var data = extractData();
			// if (data == this.webPageData){
			//   data = {};
			// }
			// sendTabData(data, tabId);
			// this.webPageData = data;

	    	var webPageData = this.extractData();
	    	if (webPageData != this.webPageData){
	    		webPageData = null;
	    	}
	    	this.sendTabData(webPageData);

	    }, 
	    3000
	  );

	}

	showToast(messageData, property, sendResponse){

	  // Acknowledge the message
	  sendResponse({
	      status: "ACK"
	  });

	  var objects = messageData[property];

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
	      { property == "reminders" && <InjectedReminderToastView objects={objects} />}
	      { property == "detectedKeywords" && <InjectedKeywordToastView objects={objects} />}

	    </React.StrictMode>
	  );

	}

	startMessageListener(){

		// Retrieving the tabId variable
		chrome.runtime.onMessage.addListener((function(message, sender, sendResponse) {

		  if (message.header == "web-ui-app-settings-data") /*messageParams.responseHeaders.WEB_UI_APP_SETTINGS_DATA*/ {
		      
		      if (Object.hasOwn(message.data, "tabId")){
		        this.getTabId(message.data, sendResponse);
		      }
		      else if (Object.hasOwn(message.data, "reminders")){
		        this.showToast(message.data, "reminders", sendResponse);
		      }
		      else if (Object.hasOwn(message.data, "detectedKeywords")){
		        this.showToast(message.data, "detectedKeywords", sendResponse);
		      }

		  }

		}).bind(this));

	}

}



export const publicDataExtractor = {

  header: function(){

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
      title = titleTagContainer.textContent;
    }

    let location = null, locationTagContainer = document.querySelector('.top-card-layout__first-subline .not-first-middot:nth-child(1)');
    if (locationTagContainer){
      location = locationTagContainer.firstElementChild.textContent;
    }

    let nFollowers = null; nFollowersTagContainer = (document.querySelectorAll('.top-card-layout__first-subline .not-first-middot')[1]).children[0];
    if (nFollowersTagContainer){
      nFollowers = nFollowersTagContainer.textContent;
    }

    let nConnections = null, nConnectionsTagContainer = (document.querySelectorAll('.top-card-layout__first-subline .not-first-middot')[1]).children[1];
    if (nConnectionsTagContainer){
      nConnections = nConnectionsTagContainer.textContent;
    }

    let company = null, featuredSchool = null, topCardLinksContainer = document.querySelector('.top-card__links-container');
    if (topCardLinksContainer){

      companyTagContainer = topCardLinksContainer.querySelector('div[data-section="currentPositionsDetails"]');
      if (companyTagContainer){
        company = {
          name: (companyTagContainer.firstElementChild.querySelector(":nth-child(2)") ? companyTagContainer.firstElementChild.querySelector(":nth-child(2)").textContent : null),
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

  },


  about: function(){

    let userAbout = null, userAboutTagContainer = document.querySelector(".core-section-container__content");
    if (userAboutTagContainer){
      userAbout = userAboutTagContainer.textContent;

      var index = userAbout.toLowerCase().indexOf("see more");
      if (index != -1){
        userAbout = userAbout.slice(0, index);
      }
      else{
        index = userAbout.toLowerCase().indexOf("voir plus");
        if (index != -1){
          userAbout = userAbout.slice(0, index);
        }
      }
    }

    return userAbout;

  },

  education: function(){

    var sectionName = ".core-section-container.education";

    var educationData = null, educationSectionTag = document.querySelector(sectionName);
    if (educationSectionTag){

      educationData = [];

      Array.from(document.querySelectorAll(sectionName + " li")).forEach((educationLiTag) => {
        var education = {
          entity:{
            name: (educationLiTag.querySelector("h3") ? educationLiTag.querySelector("h3").textContent : null),
            url: (educationLiTag.querySelector("h3 a") ? educationLiTag.querySelector("h3 a").href : null), 
          },
          title: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
          period: (educationLiTag.querySelector(".date-range") ? educationLiTag.querySelector(".date-range").textContent : null),
          description: (educationLiTag.querySelector(".show-more-less-text__text--less") ? educationLiTag.querySelector(".show-more-less-text__text--less").innerHTML : null),
        };
        educationData.push(education);
      });

    }

    return educationData;

  },

  language: function(){

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

  },

  experience: function(){

    var sectionName = ".core-section-container.experience";

    let experienceData = null, experienceSectionTag = document.querySelector(sectionName);
    if (experienceSectionTag){

      experienceData = [];

      Array.from((document.querySelector(sectionName + " .experience__list")).children).forEach((experienceLiTag) => {
        
        var experienceItem = {}, groupPositions = experienceLiTag.querySelector(".experience-group__positions");
        if (groupPositions){

          var companyName = (experienceLiTag.querySelector(".experience-group-header__company") ? experienceLiTag.querySelector(".experience-group-header__company").textContent : null);

          Array.from(groupPositions.querySelectorAll(".profile-section-card")).forEach((positionLiTag) => {
            var experienceItem = {
              title: (positionLiTag.querySelector(".experience-item__title") ? positionLiTag.querySelector(".experience-item__title").textContent : null),
              entity: {
                name: companyName,
                url: null,
              },
              period: (positionLiTag.querySelector(".date-range") ? positionLiTag.querySelector(".date-range").textContent : null),
              location: (positionLiTag.querySelectorAll(".experience-item__meta-item")[1] ? positionLiTag.querySelectorAll(".experience-item__meta-item")[1].textContent : null),
              description: (positionLiTag.querySelector(".show-more-less-text__text--less") ? positionLiTag.querySelector(".show-more-less-text__text--less").innerHTML : null),
            };
            experienceData.push(experienceItem);
          });

        }
        else{

          experienceItem = {
            title: (experienceLiTag.querySelector(".experience-item__title") ? experienceLiTag.querySelector(".experience-item__title").textContent : null),
            entity: {
              name: (experienceLiTag.querySelector(".experience-item__subtitle") ? experienceLiTag.querySelector(".experience-item__subtitle").textContent : null),
              url: null,
            },
            period: (experienceLiTag.querySelector(".date-range") ? experienceLiTag.querySelector(".date-range").textContent : null),
            location: (experienceLiTag.querySelectorAll(".experience-item__meta-item")[1] ? experienceLiTag.querySelectorAll(".experience-item__meta-item")[1].textContent : null),
            description: (experienceLiTag.querySelector(".show-more-less-text__text--less") ? experienceLiTag.querySelector(".show-more-less-text__text--less").innerHTML : null),
          };
          experienceData.push(experienceItem);

        }

      });

    }

    return experienceData;

  },

  activity: function(){

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

  },

  certification: function(){

    var sectionName = ".core-section-container.certifications";

    var certificationData = null, certificationSectionTag = document.querySelector(sectionName);
    if (certificationSectionTag){

      certificationData = [];

      Array.from(document.querySelectorAll(sectionName + " li")).forEach((certificationLiTag) => {
        var certification = {
          title: (certificationLiTag.querySelector("h3") ? certificationLiTag.querySelector("h3").textContent : null),
          entity: {
            name: (certificationLiTag.querySelector("h4 a") ? certificationLiTag.querySelector("h4 a").textContent : null),
            url: null,
          },
          period: (certificationLiTag.querySelector("div.not-first-middot") ? certificationLiTag.querySelector("div.not-first-middot").textContent : null),
          // link: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
          // credentialID: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
        };
        certificationData.push(certification);
      });

    }

    return certificationData;

  },

  project: function(){

    var sectionName = ".core-section-container.projects";

    var projectData = null, projectSectionTag = document.querySelector(sectionName);
    if (projectSectionTag){

      projectData = [];

      Array.from(document.querySelectorAll(sectionName + " li")).forEach((projectLiTag) => {
        var project = {
          name: (projectLiTag.querySelector("h3 a") ? projectLiTag.querySelector("h3 a").textContent : null),
          period: (projectLiTag.querySelector("h4 span") ? projectLiTag.querySelector("h4 span").textContent : null),
          // date: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
          link: (projectLiTag.querySelector("h3 a") ? projectLiTag.querySelector("h3 a").href : null),
          // credentialID: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
        };
        projectData.push(project);
      });

    }

    return projectData;

  },

  suggestions: function(){

    // PEOPLE ALSO VIEWED SECTION
    var sectionName = ".aside-section-container";

    var profileSuggestions = null,
        profileSuggestionsContainer = document.querySelector(sectionName);
    if (profileSuggestionsContainer){

      profileSuggestions = [];

      Array.from(document.querySelectorAll(sectionName + " li")).forEach((suggestionLiTag) => {
        var profileSuggestion = {
          name: (suggestionLiTag.querySelector(".base-aside-card__title") ? suggestionLiTag.querySelector(".base-aside-card__title").textContent : null),
          location: (suggestionLiTag.querySelector(".base-aside-card__metadata") ? suggestionLiTag.querySelector(".base-aside-card__metadata").textContent : null),
          link: (suggestionLiTag.querySelector(".base-card") ? suggestionLiTag.querySelector(".base-card").href : null),        
          picture: (suggestionLiTag.querySelector(".bg-clip-content") ? suggestionLiTag.querySelector(".bg-clip-content").style : null),
          title: (suggestionLiTag.querySelector(".base-aside-card__subtitle") ? suggestionLiTag.querySelector(".base-aside-card__subtitle").textContent : null),
        };
        profileSuggestions.push(profileSuggestion);
      });

    }

    return profileSuggestions;

  }

}


export const authDataExtractor = {

  header: function(){

    let fullName = null, fullNameTagContainer = document.querySelector(".text-heading-xlarge");
    if (fullNameTagContainer){
      fullName = fullNameTagContainer.textContent;
    }

    let avatar = null, avatarTagContainer = (document.querySelector(".pv-top-card-profile-picture__image"));
    if (avatarTagContainer){
      avatar = avatarTagContainer.src;
    }

    let coverImage = null, coverImageTagContainer = (document.querySelector(".cover-img__image"));
    if (coverImageTagContainer){
      coverImage = coverImageTagContainer.src;
    }

    let title = null, titleTagContainer = document.querySelector(".text-body-medium");
    if (titleTagContainer){
      title = titleTagContainer.textContent;
    }

    let location = null, locationTagContainer = document.querySelectorAll(".text-body-small")[3];
    if (locationTagContainer){
      location = locationTagContainer.textContent;
    }

    let nFollowers = null; nFollowersTagContainer = (document.querySelectorAll(".pv-top-card--list-bullet li")[0]).querySelector("span");
    if (nFollowersTagContainer){
      nFollowers = nFollowersTagContainer.textContent;
    }

    let nConnections = null, nConnectionsTagContainer = (document.querySelectorAll(".pv-top-card--list-bullet li")[1]).querySelector("span");
    if (nConnectionsTagContainer){
      nConnections = nConnectionsTagContainer.textContent;
    }

    let company = null, featuredSchool = null, topCardLinksContainer = document.querySelector('.pv-text-details__right-panel');
    if (topCardLinksContainer){

      var companyTagContainer = null, featuredSchoolTagContainer = null;

      for (var tag of topCardLinksContainer.querySelectorAll('button')){ 
        if (tag.getAttribute("aria-label").indexOf("Current company:") != -1){
          companyTagContainer = tag;
        }
        if (tag.getAttribute("aria-label").indexOf("Education:") != -1){
          featuredSchoolTagContainer = tag;
        }
      }

      if (companyTagContainer){
        company = {
          name: (companyTagContainer.querySelector("span") ? companyTagContainer.querySelector("span").textContent : null),
          logo: (companyTagContainer.querySelector("img") ? companyTagContainer.querySelector("img").src : null), 
          link: null,
        };
      }

      if (featuredSchoolTagContainer){
        featuredSchool = {
          name: (companyTagContainer.querySelector("span") ? companyTagContainer.querySelector("span").textContent : null),
          logo: (companyTagContainer.querySelector("img") ? companyTagContainer.querySelector("img").src : null), 
          link: null,
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

  },


  about: function(){

    let userAbout = null, userAboutTagContainer = document.getElementById('about').nextElementSibling.nextElementSibling;
    if (userAboutTagContainer){
      userAbout = userAboutTagContainer.querySelector(".visually-hidden").previousElementSibling.textContent;
    }

    return userAbout;

  },

  education: function(){

    var educationData = null, educationSectionTag = document.getElementById('education').nextElementSibling.nextElementSibling.querySelector("ul");
    if (educationSectionTag){

      educationData = [];

      Array.from(educationSectionTag.querySelectorAll("li.artdeco-list__item")).forEach((educationLiTag) => {

        var education = {
          entity:{
            name: (educationLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling ? educationLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent : null),
            url: null,
          }, 
          title: (educationLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling ? educationLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling.textContent : null),
          period: (educationLiTag.querySelectorAll(".visually-hidden")[2].previousElementSibling ? educationLiTag.querySelectorAll(".visually-hidden")[2].previousElementSibling.textContent : null),
          description: (educationLiTag.querySelectorAll(".visually-hidden")[3] ? educationLiTag.querySelectorAll(".visually-hidden")[3].previousElementSibling.innerHTML : null),
        };
        educationData.push(education);
      });

    }

    return educationData;

  },

  

  language: function(){

    var languageData = null, languageSectionTag = document.getElementById('languages').nextElementSibling.nextElementSibling;
    if (languageSectionTag){

      languageData = [];

      Array.from(languageSectionTag.querySelectorAll("li.artdeco-list__item")).forEach((languageLiTag) => {
        var language = {
          name: (languageLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling ? languageLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent : null),
          proficiency: (languageLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling ? languageLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling.textContent : null),
        };
        languageData.push(language);
      });

    }

    return languageData;

  },

  experience: function(){

    let experienceData = null, experienceSectionTag = document.getElementById('experience').nextElementSibling.nextElementSibling.querySelector("ul");
    if (experienceSectionTag){

      experienceData = [];

      Array.from(experienceSectionTag.querySelectorAll("li.artdeco-list__item")).forEach((experienceLiTag) => {
          
        var experienceItem = {};
        if (experienceLiTag.querySelector("ul")){

          var companyName = (experienceLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling ? experienceLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent : null);

          Array.from(experienceLiTag.querySelector("ul").querySelectorAll(".pvs-entity__path-node")).forEach((positionLiTag) => {
            positionLiTag = positionLiTag.parentElement;
            var experienceItem = {
              title: (positionLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling ? positionLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent : null),
              entity: {
                name: companyName,
                url: null,
              },
              period: (positionLiTag.querySelector(".pvs-entity__caption-wrapper") ? positionLiTag.querySelector(".pvs-entity__caption-wrapper").textContent : null),
              location: null, // (positionLiTag.querySelectorAll(".experience-item__meta-item")[1] ? positionLiTag.querySelectorAll(".experience-item__meta-item")[1].textContent : null),
              description: null, // (positionLiTag.querySelector(".show-more-less-text__text--less") ? positionLiTag.querySelector(".show-more-less-text__text--less").innerHTML : null),
            };
            experienceData.push(experienceItem);
          });

        }
        else{

          experienceItem = {
            title: (experienceLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling ? experienceLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent : null),
            entity: {
              name: (experienceLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling ? experienceLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling.textContent : null),
              url: null,
            },
            period: (experienceLiTag.querySelector(".pvs-entity__caption-wrapper") ? experienceLiTag.querySelector(".pvs-entity__caption-wrapper").textContent : null),
            location: null, // (experienceLiTag.querySelectorAll(".experience-item__meta-item")[1] ? experienceLiTag.querySelectorAll(".experience-item__meta-item")[1].textContent : null),
            description: (experienceLiTag.querySelectorAll(".visually-hidden")[3] ? experienceLiTag.querySelectorAll(".visually-hidden")[3].previousElementSibling.innerHTML : null),
          };
          experienceData.push(experienceItem);

        }

      });

    }

    return experienceData;

  },

  activity: function(){

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

  },

  certification: function(){

    var certificationData = null, certificationSectionTag = document.getElementById('licenses_and_certifications').nextElementSibling.nextElementSibling;
    if (certificationSectionTag){

      certificationData = [];

      Array.from(certificationSectionTag.querySelectorAll("li.artdeco-list__item")).forEach((certificationLiTag) => {
        var certification = {
          title: (certificationLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling ? certificationLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent : null),
          entity: {
            name: (certificationLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling ? certificationLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling.textContent : null),
            url: null,
          }, 
          period: (certificationLiTag.querySelectorAll(".visually-hidden")[2].previousElementSibling ? certificationLiTag.querySelectorAll(".visually-hidden")[2].previousElementSibling.textContent : null),
          // link: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
          // credentialID: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
        };
        certificationData.push(certification);
      });

    }

    return certificationData;

  },

  project: function(){

    var sectionName = ".core-section-container.projects";

    var projectData = null, projectSectionTag = document.querySelector(sectionName);
    if (projectSectionTag){

      projectData = [];

      Array.from(document.querySelectorAll(sectionName + " li")).forEach((projectLiTag) => {
        var project = {
          name: (projectLiTag.querySelector("h3 a") ? projectLiTag.querySelector("h3 a").textContent : null),
          period: (projectLiTag.querySelector("h4 span") ? projectLiTag.querySelector("h4 span").textContent : null),
          // date: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
          link: (projectLiTag.querySelector("h3 a") ? projectLiTag.querySelector("h3 a").href : null),
          // credentialID: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
        };
        projectData.push(project);
      });

    }

    return projectData;

  },

  suggestions: function(){

    // PEOPLE ALSO VIEWED SECTION

    var profileSuggestions = null,
        profileSuggestionsContainer = document.getElementById('browsemap_recommendation').nextElementSibling.nextElementSibling;
    if (profileSuggestionsContainer){

      profileSuggestions = [];

      Array.from(profileSuggestionsContainer.querySelectorAll("li.artdeco-list__item")).forEach((suggestionLiTag) => {
        var profileSuggestion = {
          name: (suggestionLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling ? suggestionLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent : null),
          location: null, // (suggestionLiTag.querySelector(".base-aside-card__metadata") ? suggestionLiTag.querySelector(".base-aside-card__metadata").textContent : null),
          link: (suggestionLiTag.querySelector("a") ? suggestionLiTag.querySelector("a").href : null),        
          picture: (suggestionLiTag.querySelector("img") ? suggestionLiTag.querySelector("img").src : null),
          title: (suggestionLiTag.querySelectorAll(".visually-hidden")[2].previousElementSibling ? suggestionLiTag.querySelectorAll(".visually-hidden")[2].previousElementSibling.textContent : null),
        };
        profileSuggestions.push(profileSuggestion);
      });

    }

    return profileSuggestions;

  }

}