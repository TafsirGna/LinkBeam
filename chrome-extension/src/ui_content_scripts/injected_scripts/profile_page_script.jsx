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
  publicDataExtractor, 
  authDataExtractor ,
  sendTabData,
  getProfilePublicViewMainHtmlElements,
  checkAndHighlightKeywordsInHtmlEl,
} from "./main_lib";
import styles from "../styles.min.css";
import ReactDOM from 'react-dom/client';
import AboutDataChartWidget from "../widgets/profile/AboutDataChartWidget";
import EducationDataChartWidget from "../widgets/profile/EducationDataChartWidget";
import ExperienceDataChartWidget from "../widgets/profile/ExperienceDataChartWidget";
import React from 'react';
// import { } from "../../popup/Local_library";

export default class ProfilePageScriptAgent extends ScriptAgentBase {

  static webPageData = null;
  static detectedKeywords = {};

  constructor(){
    super();
  }

  static checkAndHighlightKeywords(mainHtmlElements, keywords, highlightedKeywordBadgeColors, appSettings){

    for (var htmlElement of Object.values(mainHtmlElements)){
      checkAndHighlightKeywordsInHtmlEl(htmlElement, keywords, this.detectedKeywords, highlightedKeywordBadgeColors);
    }

    if (!Object.keys(this.detectedKeywords).length){
      return;
    }

    if (appSettings.notifications){
      chrome.runtime.sendMessage({header: "NOTIFY_USER", data: "keywords"}, (response) => {
        console.log('notify user request sent', response);
      });
    }

  }

  static updateUi(props){

    var mainHtmlElements = getProfilePublicViewMainHtmlElements();

    this.checkAndHighlightKeywords(mainHtmlElements, props.allKeywords, props.highlightedKeywordBadgeColors, props.appSettings);
    
    Object.keys(mainHtmlElements).forEach(htmlElementTitle => {

      if (["about", "experience", "education"].indexOf(htmlElementTitle) != -1){

        var htmlElement = mainHtmlElements[htmlElementTitle];

        if (!htmlElement){
          return;
        }

        var newDivTag = document.createElement('div');
        // newDivTag.classList.add(feedPostDataModalClassName);
        htmlElement.prepend(newDivTag);
        newDivTag.attachShadow({ mode: 'open' });

        ReactDOM.createRoot(newDivTag.shadowRoot).render(
                <React.StrictMode>
                  <style type="text/css">{styles}</style>

                  { htmlElementTitle == "about" 
                      && <AboutDataChartWidget
                          appSettings={props.appSettings}
                          tabId={props.tabId}/>}

                  { htmlElementTitle == "education" 
                      && <EducationDataChartWidget
                          appSettings={props.appSettings}
                          tabId={props.tabId}/>}

                  { htmlElementTitle == "experience" 
                      && <ExperienceDataChartWidget
                          appSettings={props.appSettings}
                          tabId={props.tabId}/>}

                </React.StrictMode>
            );

      }

    });

  }

  static runTabDataExtractionProcess(props){

    var webPageData = null,
        mainHtmlElements = getProfilePublicViewMainHtmlElements();
    
    if (!this.webPageData){

      webPageData = this.extractData();

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
        webPageData = this.extractData();
      }

    }

    if (!webPageData){
      return;
    }

    sendTabData(props.tabId, webPageData);  

  }

  static extractData(){

    let pageData = null;
    
    var publicHeaderData = null;

    try {
      publicHeaderData = publicDataExtractor.header();
    }
    catch (e) {
      console.log("An error occured when parsing as public profile :", e);
    }

    if (publicHeaderData && publicHeaderData.fullName){
      
      pageData = {

        fullName: publicHeaderData.fullName,
        title: publicHeaderData.title,
        info: publicDataExtractor.about(),
        avatar: publicHeaderData.avatar,
        coverImage: publicHeaderData.coverImage,
        nFollowers: publicHeaderData.nFollowers,
        nConnections: publicHeaderData.nConnections, 
        location: publicHeaderData.location,
        featuredEducationEntity: publicHeaderData.featuredEducationEntity,
        featuredExperienceEntity: publicHeaderData.featuredExperienceEntity,
        education: publicDataExtractor.education(),
        experience: publicDataExtractor.experience(),
        certifications: publicDataExtractor.certification(),
        activity: publicDataExtractor.activity(),
        languages: publicDataExtractor.language(),
        projects: publicDataExtractor.project(),
        profileSuggestions: publicDataExtractor.suggestions(),
        viewedAuthenticated: true,

      };
      
    }
    else{
      var authHeaderData = null;

      try {
        authHeaderData = authDataExtractor.header();
      }
      catch (e) {
        console.log("An error occured when parsing as private profile : ", e);
      }

      if (authHeaderData && authHeaderData.fullName){

        pageData = {

          fullName: authHeaderData.fullName,
          title: authHeaderData.title,
          info: authDataExtractor.about(),
          avatar: authHeaderData.avatar,
          coverImage: authHeaderData.coverImage,
          nFollowers: authHeaderData.nFollowers,
          nConnections: authHeaderData.nConnections, 
          location: authHeaderData.location,
          featuredEducationEntity: authHeaderData.featuredEducationEntity,
          featuredExperienceEntity: authHeaderData.featuredExperienceEntity,
          education: authDataExtractor.education(),
          experience: authDataExtractor.experience(),
          certifications: authDataExtractor.certification(),
          activity: authDataExtractor.activity(),
          languages: authDataExtractor.language(),
          projects: authDataExtractor.project(),
          profileSuggestions: authDataExtractor.suggestions(),
          viewAuthenticated: false,

        };

      } 
    }

    return pageData;
  }

}

