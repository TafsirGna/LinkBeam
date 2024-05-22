/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

import styles from "../styles.min.css";
import HighlightedKeywordView from "../widgets/HighlightedKeywordView";
import ReactDOM from 'react-dom/client';
import React from 'react';
import {
    isLinkedinFeed,
    isLinkedinProfilePage,
    messageMeta,
    appParams,
    breakHtmlElTextContentByKeywords,
} from "../../popup/Local_library";

const termLanguageVariants = {

  followers: {
    // fr: "",
    en: "followers",
  },

  connections: {
    // fr: "",
    en: "connections",
  },

};

export class ScriptAgentBase {

  static EXTRACTION_PROCESS_INTERVAL_TIME = 3000;

	constructor(){

    this.tabId = null;
    this.isActiveTab = true;
    this.pageUrl = window.location.href;
    this.allKeywords = null;
    this.appSettings = null;
    this.visitId = null;
    this.otherArgs = {};

		// Starting listening to different messages
		this.startMessageListener();

    // window.onload = (function () { 

    // }).bind(this);

	}

	setInitData(messageData, sendResponse){

	  this.tabId = messageData.tabId;

    if (Object.hasOwn(messageData, "settings")){
      this.appSettings = messageData.settings;
    }

    if (Object.hasOwn(messageData, "visitId")){
      if (messageData.visitId){
        this.visitId = messageData.visitId;
      }
    }

    if (Object.hasOwn(messageData, "postData")){
        this.otherArgs.postData = messageData.postData;
    }

    if (Object.hasOwn(messageData, "allKeywords")){
      this.allKeywords = messageData.allKeywords;
    }

    this.updateUi();

    this.runTabDataExtractionProcess();

	}

  // runTabDataExtractionProcess(){

  // }

	startMessageListener(){

		// Retrieving the tabId variable
		chrome.runtime.onMessage.addListener((function(message, sender, sendResponse) {

		  if (message.header == messageMeta.header.CS_SETUP_DATA) {

        // Acknowledge the message
        sendResponse({
            status: "ACK"
        });
		      
	      if (Object.hasOwn(message.data, "tabId")){
          if (!this.tabId){

            this.setInitData(message.data, sendResponse);

          }
          else{
            this.isActiveTab = (this.tabId == message.data.tabId); 
          }
	      }

		  }

		}).bind(this));

	}

};

// Function for sending the page data
 export function sendTabData(tabId, data, callback = null){

  var pageUrl = window.location.href.split("?")[0];
  pageUrl = isLinkedinFeed(pageUrl)
              ? pageUrl 
              : (isLinkedinProfilePage(pageUrl)
                  ? pageUrl.slice(pageUrl.indexOf(appParams.LINKEDIN_ROOT_URL))
                  : null);

  chrome.runtime.sendMessage({header: "EXTRACTED_DATA", data: {extractedData: data, tabId: tabId, tabUrl: pageUrl }}, (response) => {
    
    console.log('extracted data sent', response, data);

    if (callback) { callback(); }

  });

}


function insertHtmlTagsIntoEl(node, textArray, keywords, highlightedKeywordBadgeColors, detected){

  for (var textItem of textArray){
    var newChild = document.createElement('span');
    if (keywords.indexOf(textItem.toLowerCase()) != -1){

      detected[textItem.toLowerCase()] = !(textItem.toLowerCase() in detected) ? 1 : detected[textItem.toLowerCase()] + 1;

      var newDivTag_A = document.createElement('span');
      var newDivTag_B = document.createElement('span');

      newDivTag_A.style.cssText = "display: none;";
      newDivTag_A.innerHTML = textItem;

      newDivTag_B.attachShadow({ mode: 'open' });
      ReactDOM.createRoot(newDivTag_B.shadowRoot).render(
              <React.StrictMode>
                <style type="text/css">{styles}</style>
                <HighlightedKeywordView
                  keyword={textItem}
                  // allDetected={detected}
                  // highlightedKeywordBadgeColors={highlightedKeywordBadgeColors}
                  order={detected[textItem.toLowerCase()]}
                  color={highlightedKeywordBadgeColors[(Object.keys(detected).indexOf(textItem.toLowerCase()) % highlightedKeywordBadgeColors.length)]}
                  />
              </React.StrictMode>
          );

      newChild.appendChild(newDivTag_A);
      newChild.appendChild(newDivTag_B);

    }
    else{
      newChild.innerHTML = textItem;
    }
    node.appendChild(newChild);
  }

  return node;

}

export function DataApproximationAlert(props) {
  return <div id="alert-border-4" class="flex items-center p-4 mb-4 text-yellow-800 border-t-4 border-yellow-300 bg-yellow-50 dark:text-yellow-300 dark:bg-gray-800 dark:border-yellow-800" role="alert">
            <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <div class="ms-3 text-sm font-medium">
              The statistics and charts shown here are an approximation of the profile's real data.
            </div>
        </div>;
}

export function checkAndHighlightKeywordsInHtmlEl(htmlElement, keywords, detected, highlightedKeywordBadgeColors){

  if (!htmlElement){
    return;
  }

  passThroughHtmlElement(htmlElement, processNode);

  function processNode(node){

    if (node.nodeType == Node.TEXT_NODE){
      // if (keywords.indexOf(node.nodeValue.toLowerCase()) != -1 && node.parentNode){}

      try{

        // checking first if this text node contains any keywords before proceding
        var containsKeyword = false;
        for (var keyword of keywords){
          if (node.nodeValue.toLowerCase().indexOf(keyword) != -1){
            containsKeyword = true;
            break;
          }
        }

        if (containsKeyword){
          var newNode = document.createElement('span');
          newNode = insertHtmlTagsIntoEl(newNode, breakHtmlElTextContentByKeywords(node.nodeValue, keywords), keywords, highlightedKeywordBadgeColors, detected);
          node.parentNode.replaceChild(newNode, node);
        }

      }
      catch(error){
        console.log("Error : ", error);
      }

    }

    return null;

  }

}

function passThroughHtmlElement(htmlElement, callback){

  var pipe = [...htmlElement.childNodes];
  while (pipe.length){
    var node = pipe.shift();

    // focusing only on the visible part of the post
    if (node.display === "none"){
      continue;
    }

    var children = node.childNodes;

    if (children.length){
      pipe = [...children].concat(pipe);
    }
    else{ // leaf node
      if (callback(node)){
        break;
      }
    }

  } 

}

function retrieveHtmlElement(parentHtml, object){

  passThroughHtmlElement(parentHtml, processNode);

  function processNode(node){

    if (["followers", "connections"].indexOf(object.title) != -1){

      if (node.nodeType == Node.TEXT_NODE){

        if (node.nodeValue.indexOf(object.title) != -1){
          object.htmlEl = node.parentNode;
          return object.htmlEl;
        }

      }

    }

    // switch(title){

    //   case "followers":{
    //     break;
    //   }

    // }

    return null;

  }

}


function getProfilePublicViewMainHtmlElements(){

  var coreSectionContainerLabel = ".core-section-container.";

  return {
    full_name: document.querySelector(".top-card-layout__title"),
    avatar: document.querySelector(".top-card__profile-image"),
    cover_image: document.querySelector(".cover-img__image"),
    location: document.querySelector('.top-card-layout__first-subline .not-first-middot:nth-child(1)'),
    job_title: document.querySelector(".top-card-layout__headline"),
    followers: (document.querySelectorAll('.top-card-layout__first-subline .not-first-middot')[1]).children[0],
    connections: (document.querySelectorAll('.top-card-layout__first-subline .not-first-middot')[1]).children[1],
    featured_experience_education: document.querySelector('.top-card__links-container'),
    about: document.querySelector(`${coreSectionContainerLabel}summary`),
    education: document.querySelector(`${coreSectionContainerLabel}education`),
    experience: document.querySelector(`${coreSectionContainerLabel}experience`),
    languages: document.querySelector(`${coreSectionContainerLabel}languages`),
    certifications: document.querySelector(`${coreSectionContainerLabel}certifications`),
    projects: document.querySelector(`${coreSectionContainerLabel}projects`),
    suggestions: document.querySelector(".aside-section-container"),
    activity: document.querySelector(`${coreSectionContainerLabel}activities`),
  };

}

export async function getProfileViewMainHtmlElements(){

  var result = null;
  while (!result){

    await new Promise(r => setTimeout(r, 3000));

    result = document.querySelector("main.scaffold-layout__main") 
              ? {htmlElements: getProfileAuthViewMainHtmlElements(), context: "auth"}
              : document.querySelector("section.profile")
                ? {htmlElements: getProfilePublicViewMainHtmlElements(), context: "not_auth"}
                : null;

  }

  return result;

}

function getProfileAuthViewMainHtmlElements(){

  return {
    full_name: document.querySelector(".text-heading-xlarge"),
    avatar: document.querySelector(".pv-top-card-profile-picture__image--show"),
    cover_image: document.querySelector(".cover-img__image"),
    location: document.querySelectorAll(".text-body-small")[3],
    job_title: document.querySelector("section .text-body-medium"),
    followers: (document.querySelector("section.artdeco-card").querySelectorAll("ul")[1]) ? ((document.querySelector("section.artdeco-card").querySelectorAll("ul")[1]).querySelectorAll("li")[0]) : null,
    connections: (document.querySelector("section.artdeco-card").querySelectorAll("ul")[1]) ? ((document.querySelector("section.artdeco-card").querySelectorAll("ul")[1]).querySelectorAll("li")[1]) : null,
    featured_experience_education: document.querySelector("section.artdeco-card").querySelectorAll("ul")[0] /*document.querySelector('.pv-text-details__right-panel')*/,
    about: document.getElementById('about') ? document.getElementById('about').nextElementSibling.nextElementSibling : null,
    education: document.getElementById('education') ? document.getElementById('education').nextElementSibling.nextElementSibling : null,
    experience: document.getElementById('experience') ? document.getElementById('experience').nextElementSibling.nextElementSibling : null,
    languages: document.getElementById('languages') ? document.getElementById('languages').nextElementSibling.nextElementSibling : null,
    certifications: document.getElementById('licenses_and_certifications') ? document.getElementById('licenses_and_certifications').nextElementSibling.nextElementSibling : null,
    projects: null,
    suggestions: document.getElementById('browsemap_recommendation') ? document.getElementById('browsemap_recommendation').nextElementSibling.nextElementSibling : null,
    activity: null,
  };

}

export const DataExtractor = {

  fullName: function(htmlElements, context){

    function extractNotAuthData(){
      return htmlElements.full_name.firstChild.textContent;
    }

    function extractAuthData(){
      return htmlElements.full_name.textContent;
    }

    if (htmlElements.full_name){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;

  },

  avatar: function(htmlElements, context){

    if (htmlElements.avatar){
      return htmlElements.avatar.src == "" ? null : htmlElements.avatar.src; 
    }

    return null;

  },

  coverImage: function(htmlElements, context){

    if (htmlElements.cover_image){
      return htmlElements.cover_image.src
    }

    return null;

  },

  location: function(htmlElements, context){

    function extractNotAuthData(){
      return htmlElements.location.firstElementChild.textContent;
    }

    function extractAuthData(){
      return htmlElements.location.textContent;
    }

    if (htmlElements.location){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;

  },

  title: function(htmlElements, context){

    if (htmlElements.job_title){
      return htmlElements.job_title.textContent;
    }

    return null;

  },

  nFollowers: function(htmlElements, context){

    if (htmlElements.followers){
      return htmlElements.followers.textContent;
    }

    return null;

  },

  nConnections: function(htmlElements, context){

    if (htmlElements.connections){
      return htmlElements.connections.textContent;
    }

    return null;

  },

  featuredExperienceEntity: function(htmlElements, context){

    function extractNotAuthData(){

      var featuredExperienceEntityTagContainer = htmlElements.featured_experience_education.querySelector('div[data-section="currentPositionsDetails"]');
      if (featuredExperienceEntityTagContainer){
        return {
          name: (featuredExperienceEntityTagContainer.firstElementChild.querySelector(":nth-child(2)") ? featuredExperienceEntityTagContainer.firstElementChild.querySelector(":nth-child(2)").textContent : null),
          logo: (featuredExperienceEntityTagContainer.firstElementChild.firstElementChild ? featuredExperienceEntityTagContainer.firstElementChild.firstElementChild.src : null), 
          link: (featuredExperienceEntityTagContainer.firstElementChild ? featuredExperienceEntityTagContainer.firstElementChild.href : null),
        };
      }

      return null;

    }

    function extractAuthData(){

      var featuredExperienceEntityTagContainer = null;

      for (var tag of htmlElements.featured_experience_education.querySelectorAll('button')){ 
        if (tag.getAttribute("aria-label").indexOf("Current company:") != -1){
          featuredExperienceEntityTagContainer = tag;
        }
      }

      if (featuredExperienceEntityTagContainer){
        return {
          name: featuredExperienceEntityTagContainer.textContent,
          logo: (featuredExperienceEntityTagContainer.querySelector("img") ? featuredExperienceEntityTagContainer.querySelector("img").src : null), 
          link: null,
        };
      }

      return null;

    }

    if (htmlElements.featured_experience_education){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;
  },

  featuredEducationEntity: function(htmlElements, context){

    function extractNotAuthData(){

      var featuredEducationEntityTagContainer = htmlElements.featured_experience_education.querySelector('div[data-section="educationsDetails"]');
      if (featuredEducationEntityTagContainer){
        return {
          name: (featuredEducationEntityTagContainer.firstElementChild.querySelector(":nth-child(2)") ? featuredEducationEntityTagContainer.firstElementChild.querySelector(":nth-child(2)").innerHTML : null),
          logo: (featuredEducationEntityTagContainer.firstElementChild.firstElementChild ? featuredEducationEntityTagContainer.firstElementChild.firstElementChild.src : null),
          link: (featuredEducationEntityTagContainer.firstElementChild ? featuredEducationEntityTagContainer.firstElementChild.href : null),
        };
      }

      return null;

    }

    function extractAuthData(){

      var featuredEducationEntityTagContainer = null;

      for (var tag of htmlElements.featured_experience_education.querySelectorAll('button')){
        if (tag.getAttribute("aria-label").indexOf("Education:") != -1){
          featuredEducationEntityTagContainer = tag;
        }
      }

      if (featuredEducationEntityTagContainer){
        return {
          name: featuredEducationEntityTagContainer.textContent,
          logo: (featuredEducationEntityTagContainer.querySelector("img") ? featuredEducationEntityTagContainer.querySelector("img").src : null), 
          link: null,
        };
      }

      return null;

    }

    if (htmlElements.featured_experience_education){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;

  },

  about: function(htmlElements, context){

    function extractNotAuthData(){

      var userAbout = htmlElements.about.textContent;

      for (const term of ["see more", "voir plus"]){
        const index = userAbout.toLowerCase().indexOf(term);
        if (index != -1){
          userAbout = userAbout.slice(0, index);
          break;
        }
      }

      return userAbout;

    }

    function extractAuthData(){
      return htmlElements.about.querySelector(".visually-hidden").previousElementSibling.textContent;
    }

    if (htmlElements.about){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;

  },

  education: function(htmlElements, context){

    function extractNotAuthData(){

      var educationData = [];

      Array.from(htmlElements.education.querySelectorAll("li")).forEach((educationLiTag) => {
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

      return educationData;

    }

    function extractAuthData(){

      var educationData = [];

      Array.from(htmlElements.education.querySelectorAll("li.artdeco-list__item")).forEach((educationLiTag) => {

        var education = {
          entity:{
            name: (educationLiTag.querySelectorAll(".visually-hidden")[0] && educationLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling 
                    ? educationLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent 
                    : null),
            url: null,
          }, 
          title: (educationLiTag.querySelectorAll(".visually-hidden")[1] && educationLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling 
                    ? educationLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling.textContent 
                    : null),
          period: (educationLiTag.querySelectorAll(".visually-hidden")[2] && educationLiTag.querySelectorAll(".visually-hidden")[2].previousElementSibling 
                    ? educationLiTag.querySelectorAll(".visually-hidden")[2].previousElementSibling.textContent 
                    : null),
          description: (educationLiTag.querySelectorAll(".visually-hidden")[3] ? educationLiTag.querySelectorAll(".visually-hidden")[3].previousElementSibling.innerHTML : null),
        };

        educationData.push(education);

      });

      return educationData;

    }

    if (htmlElements.education){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;

  },

  languages: function(htmlElements, context){

    function extractNotAuthData(){

      var languageData = [];

      Array.from(htmlElements.languages.querySelectorAll("li")).forEach((languageLiTag) => {
        var language = {
          name: (languageLiTag.querySelector("h3") ? languageLiTag.querySelector("h3").innerHTML : null),
          proficiency: (languageLiTag.querySelector("h4") ? languageLiTag.querySelector("h4").innerHTML : null),
        };
        languageData.push(language);
      });

      return languageData;

    }

    function extractAuthData(){

      var languageData = [];

      Array.from(htmlElements.languages.querySelectorAll("li.artdeco-list__item")).forEach((languageLiTag) => {
        var language = {
          name: (languageLiTag.querySelectorAll(".visually-hidden")[0] && languageLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling 
                  ? languageLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent 
                  : null),
          proficiency: (languageLiTag.querySelectorAll(".visually-hidden")[1] && languageLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling 
                          ? languageLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling.textContent 
                          : null),
        };
        languageData.push(language);
      });

      return languageData;

    }

    if (htmlElements.languages){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;

  },

  experience: function(htmlElements, context){

    function extractNotAuthData(){

      var experienceData = [];

      Array.from((htmlElements.experience.querySelector("ul")).querySelectorAll("li")).forEach((experienceLiTag) => {
        
        var experienceItem = {}, groupPositions = experienceLiTag.querySelector(".experience-group__positions");
        if (groupPositions){

          var featuredExperienceEntityName = (experienceLiTag.querySelector(".experience-group-header__company") ? experienceLiTag.querySelector(".experience-group-header__company").textContent : null);

          Array.from(groupPositions.querySelectorAll(".profile-section-card")).forEach((positionLiTag) => {
            var experienceItem = {
              title: (positionLiTag.querySelector(".experience-item__title") ? positionLiTag.querySelector(".experience-item__title").textContent : null),
              entity: {
                name: featuredExperienceEntityName,
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

      return experienceData;

    }

    function extractAuthData(){

      var experienceData = [];

      Array.from(htmlElements.experience.querySelectorAll("li.artdeco-list__item")).forEach((experienceLiTag) => {
        
        var experienceItem = {};
        if (experienceLiTag.querySelector("ul")){

          var featuredExperienceEntityName = (experienceLiTag.querySelectorAll(".visually-hidden")[0] && experienceLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling 
                                                ? experienceLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent 
                                                : null);

          Array.from(experienceLiTag.querySelector("ul").querySelectorAll(".pvs-entity__path-node")).forEach((positionLiTag) => {
            positionLiTag = positionLiTag.parentElement;
            var experienceItem = {
              title: (positionLiTag.querySelectorAll(".visually-hidden")[0] && positionLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling 
                        ? positionLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent 
                        : null),
              entity: {
                name: featuredExperienceEntityName,
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
            title: (experienceLiTag.querySelectorAll(".visually-hidden")[0] && experienceLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling 
                      ? experienceLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent 
                      : null),
            entity: {
              name: (experienceLiTag.querySelectorAll(".visually-hidden")[1] && experienceLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling 
                      ? experienceLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling.textContent 
                      : null),
              url: null,
            },
            period: (experienceLiTag.querySelector(".pvs-entity__caption-wrapper") ? experienceLiTag.querySelector(".pvs-entity__caption-wrapper").textContent : null),
            location: null, // (experienceLiTag.querySelectorAll(".experience-item__meta-item")[1] ? experienceLiTag.querySelectorAll(".experience-item__meta-item")[1].textContent : null),
            description: (experienceLiTag.querySelectorAll(".visually-hidden")[3] ? experienceLiTag.querySelectorAll(".visually-hidden")[3].previousElementSibling.innerHTML : null),
          };
          experienceData.push(experienceItem);

        }

      });

      return experienceData;

    }

    if (htmlElements.experience){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;

  },

  activity: function(htmlElements, context){

    function extractNotAuthData(){

      var activityData = [];

      Array.from(htmlElements.activity.querySelectorAll("li")).forEach((activityLiTag) => {
        var article = {
          link: (activityLiTag.querySelector("a") ? activityLiTag.querySelector("a").href : null),
          picture: (activityLiTag.querySelector(".main-activity-card__img") ? activityLiTag.querySelector(".main-activity-card__img").src : null),
          title: (activityLiTag.querySelector(".base-main-card__title") ? activityLiTag.querySelector(".base-main-card__title").textContent : null),        
          action: (activityLiTag.querySelector(".base-main-card__subtitle") ? activityLiTag.querySelector(".base-main-card__subtitle").textContent : null),
        };
        activityData.push(article);
      });

      return activityData;

    }

    function extractAuthData(){

      var activityData = [];
      return activityData;

    }

    if (htmlElements.activity){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;

  },

  certifications: function(htmlElements, context){

    function extractNotAuthData(){

      var certificationData = [];

      Array.from(htmlElements.certifications.querySelectorAll("li")).forEach((certificationLiTag) => {
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

      return certificationData;

    }

    function extractAuthData(){

      var certificationData = [];

      Array.from(htmlElements.certifications.querySelectorAll("li.artdeco-list__item")).forEach((certificationLiTag) => {
        var certification = {
          title: (certificationLiTag.querySelectorAll(".visually-hidden")[0] && certificationLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling 
                    ? certificationLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent 
                    : null),
          entity: {
            name: (certificationLiTag.querySelectorAll(".visually-hidden")[1] && certificationLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling 
                    ? certificationLiTag.querySelectorAll(".visually-hidden")[1].previousElementSibling.textContent 
                    : null),
            url: null,
          }, 
          period: (certificationLiTag.querySelectorAll(".visually-hidden")[2] && certificationLiTag.querySelectorAll(".visually-hidden")[2].previousElementSibling 
                    ? certificationLiTag.querySelectorAll(".visually-hidden")[2].previousElementSibling.textContent 
                    : null),
          // link: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
          // credentialID: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
        };
        certificationData.push(certification);
      });

      return certificationData;

    }

    if (htmlElements.certifications){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;

  },

  projects: function(htmlElements, context){

    function extractNotAuthData(){

      var projectData = [];

      Array.from(htmlElements.projects.querySelectorAll("li")).forEach((projectLiTag) => {
        var project = {
          name: (projectLiTag.querySelector("h3 a") ? projectLiTag.querySelector("h3 a").textContent : null),
          period: (projectLiTag.querySelector("h4 span") ? projectLiTag.querySelector("h4 span").textContent : null),
          // date: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
          link: (projectLiTag.querySelector("h3 a") ? projectLiTag.querySelector("h3 a").href : null),
          // credentialID: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
        };
        projectData.push(project);
      });

      return projectData;

    }

    function extractAuthData(){

      var projectData = [];
      return projectData;

    }

    if (htmlElements.projects){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;

  },

  suggestions: function(htmlElements, context){

    function extractNotAuthData(){

      var profileSuggestions = [];

      Array.from(htmlElements.suggestions.querySelectorAll("li")).forEach((suggestionLiTag) => {
        var profileSuggestion = {
          name: (suggestionLiTag.querySelector(".base-aside-card__title") ? suggestionLiTag.querySelector(".base-aside-card__title").textContent : null),
          location: (suggestionLiTag.querySelector(".base-aside-card__metadata") ? suggestionLiTag.querySelector(".base-aside-card__metadata").textContent : null),
          link: (suggestionLiTag.querySelector(".base-card") ? suggestionLiTag.querySelector(".base-card").href : null),        
          picture: (suggestionLiTag.querySelector(".bg-clip-content") ? suggestionLiTag.querySelector(".bg-clip-content").style : null),
          title: (suggestionLiTag.querySelector(".base-aside-card__subtitle") ? suggestionLiTag.querySelector(".base-aside-card__subtitle").textContent : null),
        };
        profileSuggestions.push(profileSuggestion);
      });

      return profileSuggestions;

    }

    function extractAuthData(){

      var profileSuggestions = [];

      Array.from(htmlElements.suggestions.querySelectorAll("li.artdeco-list__item")).forEach((suggestionLiTag) => {
        var profileSuggestion = {
          name: (suggestionLiTag.querySelectorAll(".visually-hidden")[0] && suggestionLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling 
                  ? suggestionLiTag.querySelectorAll(".visually-hidden")[0].previousElementSibling.textContent 
                  : null),
          location: null, // (suggestionLiTag.querySelector(".base-aside-card__metadata") ? suggestionLiTag.querySelector(".base-aside-card__metadata").textContent : null),
          link: (suggestionLiTag.querySelector("a") ? suggestionLiTag.querySelector("a").href.split("?")[0] : null),        
          picture: (suggestionLiTag.querySelector("img") ? suggestionLiTag.querySelector("img").src : null),
          title: (suggestionLiTag.querySelectorAll(".visually-hidden")[2] && suggestionLiTag.querySelectorAll(".visually-hidden")[2].previousElementSibling 
                    ? suggestionLiTag.querySelectorAll(".visually-hidden")[2].previousElementSibling.textContent 
                    : null),
        };
        profileSuggestions.push(profileSuggestion);
      });

      return profileSuggestions

    }

    if (htmlElements.suggestions){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;

  },

};