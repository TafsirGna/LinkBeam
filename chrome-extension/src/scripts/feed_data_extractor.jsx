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
	DataExtractorBase,
} from "./data_extractor_lib";
import React from 'react';
import { 
	categoryVerbMap, 
	appParams 
} from "../popup/Local_library";
import ReactDOM from 'react-dom/client';
import styles from "../contentScriptUi/styles.min.css";
import FeedPostDataMarkerView from "../contentScriptUi/widgets/FeedPostDataMarkerView";
import FeedPostDataModal from "../contentScriptUi/widgets/FeedPostDataModal";

const feedPostDataModalClassName = "linkbeamFeedPostDataModalClassName";

export default class FeedDataExtractor extends DataExtractorBase {

	static timerDisplay = false;

	constructor(){
		super();
	}

	static setUpExtensionWidgets(props){

		if (document.body.querySelector(`.${feedPostDataModalClassName}`)){
			return;
		}

		// adding the post stats modal
		var newDivTag = document.createElement('div');
		newDivTag.classList.add(feedPostDataModalClassName);
    document.body.appendChild(newDivTag);
    newDivTag.attachShadow({ mode: 'open' });

		ReactDOM.createRoot(newDivTag.shadowRoot).render(
            <React.StrictMode>
              <style type="text/css">{styles}</style>
              <FeedPostDataModal
              	appSettings={props.appSettings}
              	visitId={props.visitId}/>
            </React.StrictMode>
        );
		
	}

	static runTabDataExtractionProcess(props){

		const postContainerElements = document.querySelector(".scaffold-finite-scroll__content")
																					.querySelectorAll("div[data-id]");

		Array.from(postContainerElements).forEach(postContainerElement => {

			if (postContainerElement.querySelector(".feed-shared-update-v2")){
				if (window.getComputedStyle(postContainerElement.querySelector(".feed-shared-update-v2")).display === "none"){
					return;
				}
			}
			else{
				return;
			}

			// if a post doesn't have neither a category (publication) nor author, then pass
			if (!postContainerElement.querySelector(".update-components-actor__name .visually-hidden")){
				return;
			}

			// excluding suggested posts
			if (postContainerElement.querySelector(".update-components-header") 
						&& postContainerElement.querySelector(".update-components-header")
																		.textContent
																		.toLowerCase()
																		.indexOf(categoryVerbMap['suggestions']) != -1){
				return;
			}

			if (!postContainerElement.querySelector(`div.${appParams.FEED_POST_WIDGET_CLASS_NAME}`)){

				// Adding the marker
				var newDivTag = document.createElement('div');
				newDivTag.classList.add(appParams.FEED_POST_WIDGET_CLASS_NAME);
	      postContainerElement.prepend(newDivTag);
	      newDivTag.attachShadow({ mode: 'open' });

				ReactDOM.createRoot(newDivTag.shadowRoot).render(
		            <React.StrictMode>
		              <style type="text/css">{styles}</style>
		              <FeedPostDataMarkerView 
		              	postUid={postContainerElement.getAttribute("data-id")}
		              	tabId={props.tabId}
		              	timerDisplay={this.timerDisplay}
		              	allKeywords={props.allKeywords}
		              	visitId={props.visitId}/>
		            </React.StrictMode>
		        );

			}

		});

	}

}
