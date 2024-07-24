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

import { 
  ScriptAgentBase, 
  DataExtractor, 
  sendTabData,
  getProfileViewMainHtmlElements,
  checkAndHighlightKeywordsInHtmlEl,
} from "./main_lib";
import styles from "../styles.min.css";
import ReactDOM from 'react-dom/client';
import AboutDataChartWidget from "../widgets/profile/AboutDataChartWidget";
import EducationDataChartWidget from "../widgets/profile/EducationDataChartWidget";
import ExperienceDataChartWidget from "../widgets/profile/ExperienceDataChartWidget";
import React from 'react';
import elevator_tone from "../../assets/audio/elevator-tone.mp3";
import {
  appParams,
  isLinkedinProfilePage,
} from "../../popup/Local_library";

const aboveProfileSectionWidgetClassName = "LinkbeamAboveProfileSectionWidgetClassName";
const keywordHighlightMark = "linkbeam-extension-keyword-highlight";

export default class ProfilePageScriptAgent extends ScriptAgentBase {

  static webPageData = null;
  static detectedKeywords = {};
  static keywordDetected = false;
  static allExtensionWidgetsSet = false;
  static profileData = null;

  constructor(){
    super();
  }

  static checkAndHighlightKeywords(mainHtmlElements, keywords, highlightedKeywordBadgeColors, appSettings){

    for (var htmlElement of Object.values(mainHtmlElements)){

      if (!htmlElement || (htmlElement && htmlElement.getAttribute(keywordHighlightMark))){
        continue;
      }

      htmlElement.setAttribute(keywordHighlightMark, true);

      checkAndHighlightKeywordsInHtmlEl(htmlElement, keywords, this.detectedKeywords, highlightedKeywordBadgeColors);
    }

    if (!Object.keys(this.detectedKeywords).length){
      return;
    }

    if (appSettings.notifications && !this.keywordDetected){
      this.keywordDetected = true;

      // play a ringtone to notify the user
      (new Audio(chrome.runtime.getURL("/assets/elevator-tone.mp3"))).play();
      
      chrome.runtime.sendMessage({header: "NOTIFY_USER", data: "keywords"}, (response) => {
        console.log('notify user request sent', response);
      });
    }

  }

  static async checkAndUpdateUi(props){

    var result = await getProfileViewMainHtmlElements();

    this.checkAndHighlightKeywords(result.htmlElements, props.allKeywords, props.highlightedKeywordBadgeColors, props.appSettings);
    
    if (this.allExtensionWidgetsSet){
      return;
    }

    Object.keys(result.htmlElements).forEach(htmlElementTitle => {

      if (["about", "experience", "education"].indexOf(htmlElementTitle) != -1){

        var htmlElement = result.htmlElements[htmlElementTitle];

        if (!htmlElement){
          return;
        }

        if (result.context == "auth"){
          htmlElement = htmlElement.previousElementSibling;
          if (!htmlElement){
            return;
          }
        }

        if (htmlElement.querySelector(`.${aboveProfileSectionWidgetClassName}`)){
          this.allExtensionWidgetsSet &&= true;
          return;
        }

        try{

          var newDivTag = document.createElement('div');
          newDivTag.classList.add(aboveProfileSectionWidgetClassName);
          htmlElement.prepend(newDivTag);
          newDivTag.attachShadow({ mode: 'open' });

          ReactDOM.createRoot(newDivTag.shadowRoot).render(
                  <React.StrictMode>
                    <style type="text/css">{styles}</style>

                    { htmlElementTitle == "about" 
                        && <AboutDataChartWidget
                            appSettings={props.appSettings}
                            tabId={props.tabId}
                            profileData={this.profileData}/>}

                    { htmlElementTitle == "education" 
                        && <EducationDataChartWidget
                            appSettings={props.appSettings}
                            tabId={props.tabId}
                            profileData={this.profileData}/>}

                    { htmlElementTitle == "experience" 
                        && <ExperienceDataChartWidget
                            appSettings={props.appSettings}
                            tabId={props.tabId}
                            profileData={this.profileData}/>}

                  </React.StrictMode>
              );

          this.allExtensionWidgetsSet &&= true;

        }
        catch(error){
          this.allExtensionWidgetsSet &&= false;
        }

      }

    });

  }

  static async runTabDataExtractionProcess(props){

    var webPageData = null;

    const result = await getProfileViewMainHtmlElements();
    const mainHtmlElements = result.htmlElements;
    
    if (!this.webPageData){

      webPageData = this.extractData(mainHtmlElements, result.context);

      this.webPageData = {};
      for (var htmlElementTitle in mainHtmlElements){
        this.webPageData[htmlElementTitle] = mainHtmlElements[htmlElementTitle] 
                                                ? mainHtmlElements[htmlElementTitle].innerHTML
                                                : null;
      }

    }
    else{
      
      var same = true;
      for (var htmlElementTitle in mainHtmlElements){
        var innerHTML = mainHtmlElements[htmlElementTitle] 
                          ? mainHtmlElements[htmlElementTitle].innerHTML
                          : null;
        if (this.webPageData[htmlElementTitle] != innerHTML){
          same = false;
        }
        this.webPageData[htmlElementTitle] = innerHTML;
      }

      if (!same){
        webPageData = this.extractData(mainHtmlElements, result.context);
      }

    }

    this.checkAndUpdateUi(props);

    // Pinging the background regularly when not idle
    if (!props.idleStatus){
      this.pgPing(props);
    }

    if (!webPageData){
      return;
    }

    sendTabData(props.tabId, webPageData);  

  }

  static pgPing(props){

    const pageUrl = isLinkedinProfilePage(window.location.href)[0];

    chrome.runtime.sendMessage({header: "PROFILE_VISIT_PING", data: {tabId: props.tabId, tabUrl: pageUrl}}, (response) => {
      console.log('profile visit ping sent', response);
    });
  }

  static extractData(mainHtmlElements, context){

    return {

      fullName: DataExtractor.fullName(mainHtmlElements, context),
      title: DataExtractor.title(mainHtmlElements, context),
      info: DataExtractor.about(mainHtmlElements, context),
      avatar: DataExtractor.avatar(mainHtmlElements, context),
      coverImage: DataExtractor.coverImage(mainHtmlElements, context),
      nFollowers: DataExtractor.nFollowers(mainHtmlElements, context),
      nConnections: DataExtractor.nConnections(mainHtmlElements, context), 
      location: DataExtractor.location(mainHtmlElements, context),
      featuredEducationEntity: DataExtractor.featuredEducationEntity(mainHtmlElements, context),
      featuredExperienceEntity: DataExtractor.featuredExperienceEntity(mainHtmlElements, context),
      education: DataExtractor.education(mainHtmlElements, context),
      experience: DataExtractor.experience(mainHtmlElements, context),
      certifications: DataExtractor.certifications(mainHtmlElements, context),
      activity: DataExtractor.activity(mainHtmlElements, context),
      languages: DataExtractor.languages(mainHtmlElements, context),
      projects: DataExtractor.projects(mainHtmlElements, context),
      profileSuggestions: DataExtractor.suggestions(mainHtmlElements, context),
      viewedAuthenticated: (context == "auth"),

    };

  }

}

