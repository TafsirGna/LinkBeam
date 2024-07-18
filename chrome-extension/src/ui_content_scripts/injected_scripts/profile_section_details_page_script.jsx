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
} from "./main_lib";
import React from 'react';
import { 
	appParams, 
} from "../../popup/Local_library";
import ReactDOM from 'react-dom/client';
import styles from "../styles.min.css";


export default class ProfileSectionDetailsPageScriptAgent extends ScriptAgentBase {

	static webPageData = null;
	static allExtensionWidgetsSet = false;

	constructor(){
		super();
	}

	static checkAndUpdateUi(props){
		
	}

	static runTabDataExtractionProcess(props){

		var webPageData = null;

		if (!this.webPageData){

			webPageData = this.extractData();
			this.webPageData = document.querySelector(".scaffold-layout__main") 
								? document.querySelector(".scaffold-layout__main").innerHTML
								: null;

		}
		else{

			if (document.querySelector(".scaffold-layout__main")
					&& document.querySelector(".scaffold-layout__main").innerHTML != this.webPageData){
				webPageData = this.extractData();
				this.webPageData = document.querySelector(".scaffold-layout__main").innerHTML;
			}

		}

		if (!webPageData){
	      return;
	    }

	    sendTabData(props.tabId, webPageData); 

	}

	static extractData(){

		var extractedData = {label: null, list: []};

		Array.from(document.querySelectorAll(".scaffold-layout__main [data-view-name='profile-component-entity']")).forEach((liElement) => {

			if (window.location.href.indexOf("/experience") != -1){

				if (!extractedData.label){
					extractedData.label = "experience";
				}

				extractedData.list = extractedData.list.concat(extractExperienceItemData(liElement, document.querySelector(".scaffold-layout__main")));
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
