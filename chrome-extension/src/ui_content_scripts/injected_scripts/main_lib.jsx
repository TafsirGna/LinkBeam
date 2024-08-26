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
  insertHtmlTagsIntoEl,
  isLinkedinProfileSectionDetailsPage,
} from "../../popup/Local_library";
import { countriesNaming } from "../../popup/countriesNamingFile";
import eventBus from "../../popup/EventBus";
import { stringSimilarity } from "string-similarity-js";

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

  static distractiveElSelectors = [".scaffold-layout__aside",
                                   ".scaffold-layout__sidebar",
                                   "header#global-nav"];
  static immersiveMode = null;

	constructor(){

    this.tabId = null;
    this.isActiveTab = true;
    this.pageUrl = window.location.href;
    this.allKeywords = null;
    this.appSettings = null;
    this.visitId = null;
    this.otherArgs = {};
    this.idlingTimer = null;
    this.scrolling = false;
    this.mouseMoving = false;
    this.mouseMoveTimeout = null;
    this.scrollTimeout = null;
    this.idleStatus = false;


		// Starting listening to different messages
		this.startMessageListener();

    // adding the necessary mouse and scroll listeners

    document.addEventListener("scroll", (event) => {
      this.scrollEventHandler1();
    });

    document.onmousemove = (event) => {
      this.mouseMoveEventHandler1();
    };

    // document.onmouseout = (event) => {
    //   this.mouseMoving = false;
    // };

	}

  mouseMoveEventHandler1(){

    if ((!isLinkedinFeed(this.pageUrl) 
              && !isLinkedinProfilePage(this.pageUrl))
          || isLinkedinProfileSectionDetailsPage(this.pageUrl)){
      return;
    }

    if (!this.mouseMoving){
      this.mouseMoving = true;

      if (this.idleStatus){
        this.idleStatus = false;
        this.sendTabIdleStatusSignal();
      }

      // I cancel the timer
      if (this.idlingTimer){
        clearTimeout(this.idlingTimer);
        this.idlingTimer = null;
      }

      // if not done yet 
      if (this.mouseMoveTimeout){
        return;
      }

      // i reset the mouseMoving value to false
      this.mouseMoveTimeout = setTimeout(() => {

        this.mouseMoving = false;
        // and I reset the timeout 
        this.mouseMoveTimeout = null;

        if (!this.scrolling){
          this.startIdlingTimer();
        }

      }, 
      appParams.TIMER_VALUE_1);

    }

  }

  scrollEventHandler1(){

    if ((!isLinkedinFeed(this.pageUrl) 
              && !isLinkedinProfilePage(this.pageUrl))
          || isLinkedinProfileSectionDetailsPage(this.pageUrl)){
      return;
    }

    if (!this.scrolling){
        
      this.scrolling = true;

      if (this.idleStatus){
        this.idleStatus = false;
        this.sendTabIdleStatusSignal();
      }

      // I cancel the timer
      if (this.idlingTimer){
        clearTimeout(this.idlingTimer);
        this.idlingTimer = null;
      }

      // if not done yet 
      if (this.scrollTimeout){
        return;
      }

      // i reset the scrolling value to false
      this.scrollTimeout = setTimeout(() => {

        this.scrolling = false;
        // and I reset the timeout 
        this.scrollTimeout = null;

        if (!this.mouseMoving){
          this.startIdlingTimer();
        }

      }, 
      appParams.TIMER_VALUE_1);

    }

  }

  isOneVideoPlaying = () => Array.from(document.querySelectorAll("video")).filter(htmlElement => !htmlElement.paused).length;

  startIdlingTimer(){

    if (this.idlingTimer){
      return;
    }

    this.idlingTimer = setTimeout(() => {

      if (this.isOneVideoPlaying()){
        this.startIdlingTimer();
        return;
      }

      this.idleStatus = true;
      this.sendTabIdleStatusSignal();

      this.idlingTimer = null;
    }, 
    appParams.IDLING_TIMER_VALUE);

  }

	setInitData(messageData, sendResponse){

	  this.tabId = messageData.tabId;

    if (Object.hasOwn(messageData, "settings")){
      this.appSettings = messageData.settings;
    }

    if (Object.hasOwn(messageData, "postData")){
        this.otherArgs.postData = messageData.postData;
    }

    if (Object.hasOwn(messageData, "allKeywords")){
      this.allKeywords = messageData.allKeywords;
    }

    document.addEventListener("scroll", (event) => {
      this.scrollEventHandler2();
    });

    this.runTabDataExtractionProcess();

	}

  sendTabIdleStatusSignal(){

    if ((!isLinkedinFeed(this.pageUrl) 
            && !isLinkedinProfilePage(this.pageUrl))
          || isLinkedinProfileSectionDetailsPage(this.pageUrl)
          || !this.isActiveTab){
      return;
    }

    eventBus.dispatch(eventBus.PAGE_IDLE_SIGNAL, {value: this.idleStatus});

    const data = {idleStatus: this.idleStatus, visitId: this.visitId }
    chrome.runtime.sendMessage({header: "TAB_IDLE_STATUS", data: data}, (response) => {
      console.log('tab idle status sent', response, data);
    });

  }

  static checkAndUpdateDistractiveUi(scriptAgentBase, props){

    if (this.immersiveMode == null){
      this.immersiveMode = Object.hasOwn(props.appSettings, "immersiveMode") ? props.appSettings.immersiveMode : false;
    }

    // checking if the app style intended to be added is there yet
    try{
      if (this.isAppStyleInjectedYet(props)){
        this.toggleImmersiveMode(scriptAgentBase, this.immersiveMode);
      }
    }
    catch(error){
      console.log("An error occured when inserting some style in the page header : ", error);
    }

  }

  static toggleImmersiveMode(scriptAgentBase, immersive = null){

    if (immersive == null){
      this.immersiveMode = !this.immersiveMode;
    }
    hideShowDistractiveHtmlEls(scriptAgentBase.distractiveElSelectors(), this.immersiveMode);

  }

  static isAppStyleInjectedYet(props){

    const LINKBEAM_EXTENSION_FEED_POST_STYLE = "LINKBEAM_EXTENSION_FEED_POST_STYLE";

    if (!document.getElementsByTagName('head')[0].querySelector(`style#${LINKBEAM_EXTENSION_FEED_POST_STYLE}`)){

      try{

        var style = document.createElement('style');
        style.type = 'text/css';
        style.id = LINKBEAM_EXTENSION_FEED_POST_STYLE;
        style.innerHTML = `.${appParams.LINKBEAM_HIGHLIGHTED_POST_CLASS} {
                    border-color: ${props.appSettings.postHighlightColor} !important;
                    border-width: 2px !important; border-style: solid !important;
                    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px !important;
                    transition: transform .2s !important;
                  }
                  .${appParams.LINKBEAM_HIGHLIGHTED_POST_CLASS}:hover {
                    transform: scale(1.01);
                  }

                  .${appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME} {
                    transition: all 2s;
                  }
                  .${appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME}-hidden {
                    opacity: 0;
                    visibility: hidden;
                  }
                  .${appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME}-shown {
                    opacity: 1;
                    visibility: visible;
                  }`;
        document.getElementsByTagName('head')[0].appendChild(style);

        return true;

      }
      catch(error){
        console.log("Error : An error occured when inserting the extension app style");
        return false;
      }

    }

    return true;

  }

  // runTabDataExtractionProcess(){

  // }

	startMessageListener(){

		// Retrieving the tabId variable
		chrome.runtime.onMessage.addListener((function(message, sender, sendResponse) {

		  if (message.header == messageMeta.header.CS_SETUP_DATA) {

        // Acknowledge the message
        sendResponse({
            status: "ACK---"
        });

        if (Object.hasOwn(message.data, "visitId")
              && this.visitId != message.data.visitId){
          this.visitId = message.data.visitId; 
          if (!this.mouseMoving && !this.scrolling){
            this.startIdlingTimer();
          }
        }
        
		      
	      if (Object.hasOwn(message.data, "tabId")){
          if (!this.tabId){
            this.setInitData(message.data, sendResponse);
          }
          else{

            if (Object.hasOwn(message.data, "tabId")){
              this.isActiveTab = (this.tabId == message.data.tabId);
              this.idleStatus = false; 
            }

          }
	      }

		  }

      this.handleIncomingMessages(message, sender, sendResponse);

		}).bind(this));

	}

};

// Function for sending the page data
export function sendTabData(tabId, data, callback = null){

  var pageUrl = window.location.href.split("?")[0];
  pageUrl = (isLinkedinFeed(pageUrl) || isLinkedinProfileSectionDetailsPage(pageUrl))
              ? pageUrl 
              : (isLinkedinProfilePage(pageUrl)
                  ? isLinkedinProfilePage(pageUrl)[0]
                  : null);

  chrome.runtime.sendMessage({header: "EXTRACTED_DATA", data: {extractedData: data, tabId: tabId, tabUrl: pageUrl }}, (response) => {
    
    console.log('extracted data sent', response, data);

    if (callback) { callback(); }

  });

}

function toggleElFadingEffect(htmlEl, immersive){

  function showEl(){

    htmlEl.classList.remove(`${appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME}-hidden`);
    htmlEl.classList.add(`${appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME}-shown`);
    htmlEl.style.height = 'auto';

  }

  function hideEl(){

    htmlEl.classList.remove(`${appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME}-shown`);
    htmlEl.classList.add(`${appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME}-hidden`);

    setTimeout(() => {
      htmlEl.style.height = 0
    }, 1000);if (htmlEl.classList.contains(`${appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME}-shown`)) {
      
    }

  }

  // console.log("dddddddddd : ", htmlEl, immersive);

  if (immersive == null){
    if (htmlEl.classList.contains(`${appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME}-hidden`)) {
      showEl(); // Show if hidden
    } 
    else{
      hideEl(); // hide if shown
    }
  }
  else{
    if (immersive){
      if (!htmlEl.classList.contains(`${appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME}-hidden`)){
        hideEl(); // hide if shown
      }
    }
    else{
      if (htmlEl.classList.contains(`${appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME}-hidden`)) {
        showEl(); // Show if hidden
      }
    }
  }

}

function hideShowDistractiveHtmlEls(distractiveElSelectors, immersive){

  distractiveElSelectors.forEach(selector => {

    const distractiveEl = document.querySelector(selector);

    if (!distractiveEl){
      return;
    }

    // setting the distinctive class name if not done yet
    if (!distractiveEl.classList.contains(appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME)){
      distractiveEl.classList.add(appParams.LINKBEAM_DISTRACTIVE_ELEMENT_CLASS_NAME);
    }

    // toggling the display update
    toggleElFadingEffect(distractiveEl, immersive);
    
  });

}

export function getFontFamilyStyle(props){

  if (props.appSettings.fontFamily 
            && props.appSettings.fontFamily != appParams.allFontFamilySettingValues[0].label){
    return <style>
              { (() => {
                const fontFamily = appParams.allFontFamilySettingValues.filter(f => f.label == props.appSettings.fontFamily)[0];
                return `@font-face { font-family: ${fontFamily.label}; src: url('/${fontFamily.file}'); }
                          * {
                           font-family: ${fontFamily.label}
                        }`;
              })() }    
          </style>;
  }

  return null;

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

export function OnProfileIncompleteSectionAlert(props) {
  return <div id="alert-border-4" class="flex items-center p-4 mb-4 text-gray-800 border-t-4 border-gray-300 bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-800" role="alert">
            <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <div class="ms-3 text-sm font-medium">
                It seems like the {props.sectionName} section is incomplete. Consider enriching this section data.
            </div>
        </div>;
}

export function extractPostDate(textContent, LuxonDateTime){

  if (!textContent){
    return null;
  }

  // english version
  var timeTerm = "ago";
  if (textContent.endsWith(timeTerm)){

    for (var time of ["minute", "hour", "day", "week", "month", "year"]){

      if (textContent.indexOf(time) != -1){
        var criteria = {};
        criteria[`${time}s`] = Number(textContent.slice(0, textContent.indexOf(time)));
        return LuxonDateTime.now().minus(criteria).toISO();
        // break;
      }

    }

  }

  // french version
  timeTerm = "Il y a";
  if (textContent.startsWith(timeTerm)){

    for (var [timeKey, timeValue] of Object.entries({minute: "minute", heure: "hour", jour: "day", semaine: "week", mois: "month", année: "year"})){

      if (textContent.indexOf(timeKey) != -1){
        var criteria = {};
        criteria[`${timeValue}s`] = Number(textContent.slice(timeTerm.length, textContent.indexOf(timeKey)));
        return LuxonDateTime.now().minus(criteria).toISO();
        // break;
      }

    }

  }

  return null;

}

export function getFeedPostHtmlElement(postUid) {
  return document.querySelector(`.scaffold-finite-scroll__content div[data-id='${postUid}']`);
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
          newNode = insertHtmlTagsIntoEl(
            newNode, 
            breakHtmlElTextContentByKeywords(node.nodeValue, keywords), 
            keywords, 
            highlightedKeywordBadgeColors, 
            detected,
            (newDivTag, textItem, order, color) => {
              newDivTag.attachShadow({ mode: 'open' });
              ReactDOM.createRoot(newDivTag.shadowRoot).render(
                <React.StrictMode>
                  <style type="text/css">{styles}</style>
                    <HighlightedKeywordView
                      keyword={textItem}
                      // allDetected={detected}
                      // highlightedKeywordBadgeColors={highlightedKeywordBadgeColors}
                      order={order}
                      color={color}
                      />
                </React.StrictMode>
              );
            }
          );
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

    const children = node.childNodes;

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
    featured_experience: document.querySelector('.top-card__links-container div[data-section="currentPositionsDetails"]'),
    featured_education: document.querySelector('.top-card__links-container div[data-section="educationsDetails"]'),
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
    full_name: document.querySelector("section.artdeco-card a[href*='about-this-profile']") /*(() => {
        for (let i of document.querySelectorAll('section.artdeco-card a')) {
          if (i.href.match(window.location.href.slice(window.location.href.indexOf("/in/")))) { // or whatever attribute you want to search
              return i;
          }
        }
        return null;
      }
    )()*/,
    avatar: document.querySelector(".pv-top-card-profile-picture__image--show"),
    cover_image: document.querySelector("section.artdeco-card .profile-background-image img"),
    location: document.querySelector("section.artdeco-card #top-card-text-details-contact-info").parentElement.parentElement,
    job_title: document.querySelector("section.artdeco-card div[data-generated-suggestion-target]"),
    followers: (() => {
      const els = Array.from(document.querySelector("section.artdeco-card").querySelectorAll("*")).filter(h => h.textContent.match(/(\d[\s,])*\d+\+?\s(followers|abonnés)/g)).toReversed();
      return els ? els[0] : null;
    })(),
    connections: (() => {
      const els = Array.from(document.querySelector("section.artdeco-card").querySelectorAll("*")).filter(h => h.textContent.match(/(\d[\s,])*\d+\+?\s(connections|relations)/g)
                                                                                                                && h.textContent.indexOf("commun") == -1
                                                                                                                && h.textContent.indexOf("mutual") == -1).toReversed();
      return els ? els[0] : null;
    })(),
    featured_experience: document.querySelector("section.artdeco-card button[aria-label^='Current company']"),
    featured_education: document.querySelector("section.artdeco-card button[aria-label^='Education:']"),
    about: document.getElementById('about') ? document.getElementById('about').nextElementSibling.nextElementSibling : null,
    education: document.getElementById('education') ? document.getElementById('education').nextElementSibling.nextElementSibling : null,
    experience: document.getElementById('experience') ? document.getElementById('experience').nextElementSibling.nextElementSibling : null,
    languages: document.getElementById('languages') ? document.getElementById('languages').nextElementSibling.nextElementSibling : null,
    certifications: document.getElementById('licenses_and_certifications') ? document.getElementById('licenses_and_certifications').nextElementSibling.nextElementSibling : null,
    projects: document.getElementById('projects') ? document.getElementById('projects').nextElementSibling.nextElementSibling : null,
    suggestions: document.getElementById('browsemap_recommendation') ? document.getElementById('browsemap_recommendation').nextElementSibling.nextElementSibling : null,
    activity: null,
  };

}

export function getHtmlElImageSource(htmlElement){
  return htmlElement && htmlElement.tagName == "IMG" ? htmlElement.src : null;
}

export function getHtmlElTextContent(htmlElement){
  return htmlElement ? htmlElement.textContent : null;
}

export function getHtmlElInnerHTML(htmlElement){
  return htmlElement ? htmlElement.innerHTML : null;
}

function getHtmlElHref(htmlElement){
  return htmlElement ? htmlElement.href : null;
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
      return htmlElements.location.textContent.replace("Contact info", "");
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

      return {
        name: getHtmlElTextContent(htmlElements.featured_experience.firstElementChild.querySelector(":nth-child(2)")),
        picture: getHtmlElImageSource(htmlElements.featured_experience.firstElementChild.firstElementChild), 
        url: getHtmlElHref(htmlElements.featured_experience.firstElementChild),
      };

    }

    function extractAuthData(){

      return {
        name: htmlElements.featured_experience.textContent,
        picture: getHtmlElImageSource(htmlElements.featured_experience.querySelector("img")), 
        url: null,
      };

    }

    if (htmlElements.featured_experience){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;
  },

  featuredEducationEntity: function(htmlElements, context){

    function extractNotAuthData(){

      return {
        name: getHtmlElInnerHTML(htmlElements.featured_education.firstElementChild.querySelector(":nth-child(2)")),
        picture: getHtmlElImageSource(htmlElements.featured_education.firstElementChild.firstElementChild),
        url: getHtmlElHref(htmlElements.featured_education.firstElementChild),
      };

    }

    function extractAuthData(){

      return {
        name: htmlElements.featured_education.textContent,
        picture: getHtmlElImageSource(htmlElements.featured_education.querySelector("img")), 
        url: null,
      };

    }

    if (htmlElements.featured_education){
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
            picture: null,
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

        educationData.push(extractEducationItemData(educationLiTag));

      });

      if (htmlElements.education.querySelector(".pvs-list__footer-wrapper")){
        educationData.push("incomplete");
      }

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
                url: experienceLiTag.querySelector("a") ? experienceLiTag.querySelector("a").href : null,
                picture: experienceLiTag.querySelector("img") ? experienceLiTag.querySelector("img").src : null,
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
              url: experienceLiTag.querySelector("a") ? experienceLiTag.querySelector("a").href : null,
              picture: experienceLiTag.querySelector("img") ? experienceLiTag.querySelector("img").src : null,
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

      Array.from(htmlElements.experience.querySelectorAll("[data-view-name='profile-component-entity']")).forEach((experienceLiTag) => {
        experienceData = experienceData.concat(extractExperienceItemData(experienceLiTag, htmlElements.experience));

      });

      if (htmlElements.experience.querySelector(".pvs-list__footer-wrapper")){
        experienceData.push("incomplete");
      }

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
          url: (activityLiTag.querySelector("a") ? activityLiTag.querySelector("a").href : null),
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
            url: certificationLiTag.querySelector("a") ? certificationLiTag.querySelector("a").href : null,
            picture: certificationLiTag.querySelector("img") ? certificationLiTag.querySelector("img").src : null,
          },
          period: (certificationLiTag.querySelector("div.not-first-middot") ? certificationLiTag.querySelector("div.not-first-middot").textContent : null),
          url: null,
          // credentialID: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
        };
        certificationData.push(certification);
      });

      return certificationData;

    }

    function extractAuthData(){

      var certificationData = [];

      Array.from(htmlElements.certifications.querySelectorAll("[data-view-name='profile-component-entity']")).forEach((certificationLiTag) => {
        certificationData.push(extractCertificationItemData(certificationLiTag));
      });

      if (htmlElements.certifications.querySelector(".pvs-list__footer-wrapper")){
        certificationData.push("incomplete");
      }

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
          url: (projectLiTag.querySelector("h3 a") ? projectLiTag.querySelector("h3 a").href : null),
          // credentialID: (educationLiTag.querySelector("h4") ? educationLiTag.querySelector("h4").textContent : null),
        };
        projectData.push(project);
      });

      return projectData;

    }

    function extractAuthData(){

      var projectData = [];

      Array.from(htmlElements.projects.querySelectorAll("[data-view-name='profile-component-entity']")).forEach((projectLiTag) => {
        projectData.push(extractProjectItemData(projectLiTag));
      });

      if (htmlElements.projects.querySelector(".pvs-list__footer-wrapper")){
        projectData.push("incomplete");
      }

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
          url: (suggestionLiTag.querySelector(".base-card") ? suggestionLiTag.querySelector(".base-card").href : null),        
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
        profileSuggestions.push(extractProfileSuggestionItemData(suggestionLiTag));
      });

      return profileSuggestions

    }

    if (htmlElements.suggestions){
      return (context == "not_auth") ? extractNotAuthData() : extractAuthData();
    }

    return null;

  },

};

export function extractProjectItemData(htmlElement){

  var projectItemData = {
          name: null,
          period: null,
          url: null,
          description: null,
        }, 
      counter = 0;

  extractItemData(htmlElement, hydrateItemObject);

  function hydrateItemObject(node){

    console.log("###############-------------- projects : ", node, node.tagName, counter);

    switch(node.tagName){
      case "A":{
        // entity url
        if (!projectItemData.url){
          projectItemData.url = node.getAttribute("href");
        }
        return;
        // break;
      }
    }

    if (isNodeProfileComponentEntityElement(node)){
      return;
    }

    switch(counter){
      case 0: {
        // name
        projectItemData.name = node.textContent;
        // console.log("###############-------------- : name ", projectItemData.name);
        counter++;
        return;
        // break;
      }
      case 1:{
        projectItemData.period = node.textContent;
        // console.log("###############-------------- : period ", projectItemData.period);
        counter++;
        return;
        // break;
      }
      case 2: {
        // title
        projectItemData.description = node.textContent;
        // console.log("###############-------------- : description ", projectItemData.description);
        counter++;
        return;
        // break;
      }
    }

  }

  // console.log("###############-------------- : Final ", projectItemData);

  return projectItemData;

}

export function extractCertificationItemData(htmlElement){

  var certificationItemData = {
          title: null,
          url: null,
          entity: {
            name: null,
            url: null,
            picture: null,
          },
          period: null,
          // credentialID: null,
        }, 
      counter = 0;

  extractItemData(htmlElement, hydrateItemObject);

  function hydrateItemObject(node){

    console.log("###############-------------- certifications : ", node, node.tagName, counter);

    switch(node.tagName){
      case "IMG":{
        // picture
        if (!certificationItemData.entity.picture){
          certificationItemData.entity.picture = node.getAttribute("src");
        }
        return;
        // break;
      }
      case "A":{
        // entity url
        if (!certificationItemData.entity.url){
          certificationItemData.entity.url = node.getAttribute("href");
        }
        else{
          certificationItemData.url = node.getAttribute("href");
        }
        return;
        // break;
      }
    }

    if (isNodeProfileComponentEntityElement(node)){
      return;
    }

    switch(counter){
      case 0: {
        // name
        certificationItemData.title = node.textContent;
        counter++;
        return;
        // break;
      }
      case 1:{
        certificationItemData.entity.name = node.textContent;
        counter++;
        return;
        // break;
      }
      case 2: {
        // title
        certificationItemData.period = node.textContent;
        counter++;
        return;
        // break;
      }
    }

  }

  return certificationItemData;

}

export function extractProfileSuggestionItemData(htmlElement){

  var profileSuggestionItemData = {
        name: null,
        location: null,
        url: null,
        picture: null,
        title: null,
      }, 
      counter = 0;

  extractItemData(htmlElement, hydrateItemObject);

  function hydrateItemObject(node){

    console.log("###############-------------- profileSuggestions : ", node, node.tagName, counter);

    switch(node.tagName){
      case "IMG":{
        // picture
        if (!profileSuggestionItemData.picture){
          profileSuggestionItemData.picture = node.getAttribute("src");
        }
        return;
        // break;
      }
      case "A":{
        // entity url
        if (!profileSuggestionItemData.url){
          profileSuggestionItemData.url = node.getAttribute("href");
        }
        return;
        // break;
      }
    }

    if (isNodeProfileComponentEntityElement(node)){
      return;
    }

    switch(counter){
      case 0: {
        // name
        profileSuggestionItemData.name = node.textContent;
        counter++;
        return;
        // break;
      }
      case 1:{
        counter++;
        return;
        // break;
      }
      case 2: {
        // title
        profileSuggestionItemData.title = node.textContent;
        counter++;
        return;
        // break;
      }
    }

  }

  return profileSuggestionItemData;

}


export function extractEducationItemData(htmlElement){

  var educationItemData = {
        entity:{
          name: null,
          url: null,
          picture: null,
        }, 
        title: null,
        period: null,
        description: null,
      }, 
      counter = 0;

  extractItemData(htmlElement, hydrateItemObject);

  function hydrateItemObject(node){

    console.log("###############-------------- education : ", node, node.tagName, counter);

    switch(node.tagName){
      case "IMG":{
        // picture
        if (!educationItemData.entity.picture){
          educationItemData.entity.picture = node.getAttribute("src");
        }
        return;
        // break;
      }
      case "A":{
        // entity url
        if (!educationItemData.entity.url){
          educationItemData.entity.url = node.getAttribute("href");
        }
        return;
        // break;
      }
    }

    switch(counter){
      case 0: {
        // name
        if (isNodeProfileComponentEntityElement(node)){
          return;
        }
        educationItemData.entity.name = node.textContent;
        counter++;
        return;
        // break;
      }
      case 1: {
        // title
        educationItemData.title = node.textContent;
        counter++;
        return;
        
        // break;
      }
    }

    // period
    var nodeTextContent = node.textContent.toLowerCase();
    if (nodeTextContent.match(/^(([a-zéû]{3,4}(.)?\s)?\d{4}\s-\s((([a-zéû]{3,4}(.)?\s)?\d{4})|Present|aujourd’hui)\s·\s)?\d{1,2}\s[a-z]{2,4}(\s\d{1,2}\s[a-z]{2,4})?$/ig)
          || nodeTextContent.match(/^([a-zéû]{3,4}(.)?\s)?\d{4}\s-\s((([a-zéû]{3,4}(.)?\s)?\d{4})|Present|aujourd’hui)$/ig)){
      educationItemData.period = nodeTextContent;
      // counter++;
      return;
    }

    // location
    nodeTextContent = node.textContent.indexOf(" · ") ? node.textContent.split(" · ")[0] : node.textContent;
    if (nodeTextContent.match(/^([a-zàâçéèêëîïôûùüÿñæœ -]*,\s)*[a-zàâçéèêëîïôûùüÿñæœ -]*$/ig)){
      const lastPhrase = nodeTextContent.split(", ").toReversed()[0];
      for (const countryObject of countriesNaming){
        if (countryObject.englishShortName.toLowerCase() == lastPhrase.toLowerCase()
            || countryObject.frenchShortName.toLowerCase() == lastPhrase.toLowerCase()){
          educationItemData.location = nodeTextContent;
          // counter++;
          return;
        }
      }
    }

    // description
    educationItemData.description = node.textContent;

  }

  return educationItemData;

}

export function extractExperienceItemData(htmlElement, encompassingParent){

  if (!isProfileComponentEntityElementLegit(htmlElement, encompassingParent)){
    return [];
  }

  var experienceItemDataList = [], 
      counter = null;

  function addNewToList(){
    experienceItemDataList.push({
        title: null,
        entity: {
          name: experienceItemDataList.length ? experienceItemDataList[0].entity.name : null,
          url: experienceItemDataList.length ? experienceItemDataList[0].entity.url : null,
          picture: experienceItemDataList.length ? experienceItemDataList[0].entity.picture : null,
        },
        period: null,
        location: null,
        description: null,
      });
    counter = 0;
  }

  addNewToList();

  extractItemData(htmlElement, hydrateItemObject);

  function hydrateItemObject(node){

    console.log("###############-------------- experience: ", node, node.tagName, counter, experienceItemDataList.length);
    var experienceItemData = experienceItemDataList[experienceItemDataList.length -1];

    switch(node.tagName){
      case "IMG":{
        // picture
        if (!experienceItemData.entity.picture){
          experienceItemData.entity.picture = node.getAttribute("src");
        }
        return;
        // break;
      }
      case "A":{
        // entity url
        if (!experienceItemData.entity.url){
          experienceItemData.entity.url = node.getAttribute("href").split("?")[0];
        }
        return;
        // break;
      }
      // case "LI":{
      //   addNewToList();
      //   return;
      //   // break;
      // }
      default:{
        if (isNodeProfileComponentEntityElement(node)){
            addNewToList();
            return;
            // break;
        }
      }
    }

    switch(counter){
      case 0: {
        // title
        if (!htmlElement.querySelector(".pvs-entity__sub-components [data-view-name='profile-component-entity']")){
          experienceItemData.title = node.textContent;
        }
        else{
          if (experienceItemDataList.length == 1){
            experienceItemData.entity.name = node.textContent.split(" · ")[0];
          }
          else{
            experienceItemData.title = node.textContent;
          }
        }
        counter++;
        return;
        // break;
      }
      case 1: {
        // name
        if (!htmlElement.querySelector(".pvs-entity__sub-components [data-view-name='profile-component-entity']")){ 
          experienceItemData.entity.name = node.textContent.split(" · ")[0];
          counter++;
          return;
        }
        
        // break;
      }
    }

    // period
    var nodeTextContent = node.textContent.toLowerCase();
    if (nodeTextContent.match(/^(([a-zéû]{3,4}(.)?\s)?\d{4}\s-\s((([a-zéû]{3,4}(.)?\s)?\d{4})|Present|aujourd’hui)\s·\s)?((\d{1,2}\s[a-z]{2,4}(\s\d{1,2}\s[a-z]{2,4})?)|Less than a year)$/ig)){
      experienceItemData.period = nodeTextContent;
      return;
    }

    // location
    nodeTextContent = node.textContent.indexOf(" · ") ? node.textContent.split(" · ")[0] : node.textContent;
    if (nodeTextContent.match(/^([\wàâçéèêëîïôûùüÿñæœ -]+,\s){0,2}[\wàâçéèêëîïôûùüÿñæœ -]+$/ig)){
      const lastPhrase = nodeTextContent.split(", ").toReversed()[0];
      const similarityValues = countriesNaming.map(countryObject => Math.max(stringSimilarity(countryObject.englishShortName, lastPhrase, 1), stringSimilarity(countryObject.frenchShortName, lastPhrase, 1)))
                                              .toSorted()
                                              .toReversed();

      if (similarityValues[0] >= .7){
        experienceItemData.location = nodeTextContent;
        return;
      }

    }

    // description
    experienceItemData.description = node.textContent;

    // console.log("###############-------------- : N ", experienceItemData);
  }

  return experienceItemDataList.length == 1 ? experienceItemDataList : experienceItemDataList.slice(1);

}

function isNodeProfileComponentEntityElement(node){

  try{
    if (node.getAttribute("data-view-name") == "profile-component-entity"){
      return true;
    }
  }
  catch(error){
    // console.log("*** : ", node);
    // console.log("Error : ", error);
    return false;
  }

  return false;

}

function extractItemData(htmlElement, callback){

  function isNodeSpanWithAriaHiddenAttribute(node){

    try{
      if ((node.tagName == "SPAN") && node.getAttribute("aria-hidden")){
        return true;
      }
    }
    catch(error){
      // console.log("Error : ", error);
      return false;
    }

    return false;

  }

  var pipe = [...htmlElement.childNodes];
  while (pipe.length){
    var node = pipe.shift();

    // focusing only on the visible part of the post
    if (node.display === "none" || node.nodeType == Node.TEXT_NODE){
      continue;
    }

    if (["IMG", "A"].indexOf(node.tagName) != -1
          || isNodeProfileComponentEntityElement(node)
          || isNodeSpanWithAriaHiddenAttribute(node)){
      callback(node);
    }

    const children = node.childNodes;
    if (children.length){
      pipe = [...children].concat(pipe);
    }

  } 

}

function isProfileComponentEntityElementLegit(node, encompassingParent){

  // Checking if this component entity element has another component entity element as parent
  var htmlParent = node.parentNode/*, 
    liCounter = 0*/;
  while(htmlParent != encompassingParent){
    if (isNodeProfileComponentEntityElement(htmlParent)){
      // liCounter++;
      // if (liCounter == 2){ return false; }
      return false;
    }
    htmlParent = htmlParent.parentNode;
  }

  return true;

}