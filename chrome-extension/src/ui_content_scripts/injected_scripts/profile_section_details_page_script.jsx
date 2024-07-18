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
	extractEducationItemData,
	extractExperienceItemData,
	extractProjectItemData,
	extractCertificationItemData,
	sendTabData,
	checkAndHighlightKeywordsInHtmlEl,
} from "./main_lib";
import React from 'react';
import { 
	appParams, 
} from "../../popup/Local_library";
import ReactDOM from 'react-dom/client';
import styles from "../styles.min.css";

const keywordHighlightMark = "linkbeam-extension-keyword-highlight";

export default class ProfileSectionDetailsPageScriptAgent extends ScriptAgentBase {

	static webPageData = null;
	static allExtensionWidgetsSet = false;
	static detectedKeywords = {};
	static mainHtmlEl = document.querySelector(".scaffold-layout__main");

	constructor(){
		super();
	}

	static checkAndHighlightKeywords(keywords, highlightedKeywordBadgeColors, appSettings){

		if (!this.mainHtmlEl 
				|| (this.mainHtmlEl && this.mainHtmlEl.getAttribute(keywordHighlightMark))){
			return;
		}

		this.mainHtmlEl.setAttribute(keywordHighlightMark, true);

		checkAndHighlightKeywordsInHtmlEl(this.mainHtmlEl, keywords, this.detectedKeywords, highlightedKeywordBadgeColors);

		if (!Object.keys(this.detectedKeywords).length){
	      return;
	    }

	    // play a ringtone to notify the user
	    (new Audio(chrome.runtime.getURL("/assets/elevator-tone.mp3"))).play();

	}

	static checkAndUpdateUi(props){
		
		this.checkAndHighlightKeywords(props.allKeywords, props.highlightedKeywordBadgeColors, props.appSettings);

	}

	static runTabDataExtractionProcess(props){

		var webPageData = null;

		if (!this.webPageData){

			webPageData = this.extractData();
			this.webPageData = this.mainHtmlEl 
								? this.mainHtmlEl.innerHTML
								: null;

		}
		else{

			if (this.mainHtmlEl
					&& this.mainHtmlEl.innerHTML != this.webPageData){
				webPageData = this.extractData();
				this.webPageData = this.mainHtmlEl.innerHTML;
			}

		}

		this.checkAndUpdateUi(props);

		if (!webPageData){
	      return;
	    }

	    sendTabData(props.tabId, webPageData); 

	}

	static extractData(){

		var extractedData = {label: null, list: []};

		Array.from(this.mainHtmlEl.querySelectorAll("[data-view-name='profile-component-entity']")).forEach((liElement) => {

			if (window.location.href.indexOf("/experience") != -1){

				if (!extractedData.label){
					extractedData.label = "experience";
				}

				extractedData.list = extractedData.list.concat(extractExperienceItemData(liElement, this.mainHtmlEl));
			}
			else if (window.location.href.indexOf("/education") != -1){

				if (!extractedData.label){
					extractedData.label = "education";
				}

				extractedData.list.push(extractEducationItemData(liElement));
			}
			else if (window.location.href.indexOf("/projects") != -1){

				if (!extractedData.label){
					extractedData.label = "projects";
				}

				extractedData.list.push(extractProjectItemData(liElement));
			}
			else if (window.location.href.indexOf("/certifications") != -1){

				if (!extractedData.label){
					extractedData.label = "certifications";
				}

				extractedData.list.push(extractCertificationItemData(liElement));
			}

		});

		if (!extractedData.label){
			return null;
		}

		return extractedData;

	}

}
