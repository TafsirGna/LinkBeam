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
} from "./main_lib";
import React from 'react';
import { 
	appParams,
} from "../../popup/Local_library";
import ReactDOM from 'react-dom/client';
import styles from "../styles.min.css";
import AboveFeedPostWidgetView from "../widgets/feed/AboveFeedPostWidgetView";
import FeedPostViewsChartModal from "../widgets/feed/FeedPostViewsChartModal";

const LinkbeamFeedPostDataModalWrapperId = "LinkbeamFeedPostDataModalWrapperId";

export default class FeedPageScriptAgent extends ScriptAgentBase {

	static timerDisplay = false;

	constructor(){
		super();
	}

	static updateUi(props){

		if (document.body.querySelector(`#${LinkbeamFeedPostDataModalWrapperId}`)){
			return;
		}

		// adding the post stats modal
		var newDivTag = document.createElement('div');
		// newDivTag.classList.add(feedPostDataModalClassName);
		newDivTag.id = LinkbeamFeedPostDataModalWrapperId;
    document.body.appendChild(newDivTag);
    newDivTag.attachShadow({ mode: 'open' });

		ReactDOM.createRoot(newDivTag.shadowRoot).render(
            <React.StrictMode>
              <style type="text/css">{styles}</style>
              <FeedPostViewsChartModal
              	appSettings={props.appSettings}
              	tabId={props.tabId}
              	/*visitId={props.visitId}*//>
            </React.StrictMode>
        );
		
	}

	static runTabDataExtractionProcess(props){

		console.log("vvvvvvvvvvvvvvvvvvvvvvv");

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

			if (!postContainerElement.querySelector(`div.${appParams.FEED_POST_WIDGET_CLASS_NAME}`)){

				// Adding the marker
				var newDivTag = document.createElement('div');
				newDivTag.classList.add(appParams.FEED_POST_WIDGET_CLASS_NAME);
	      postContainerElement.prepend(newDivTag);
	      newDivTag.attachShadow({ mode: 'open' });

				ReactDOM.createRoot(newDivTag.shadowRoot).render(
		            <React.StrictMode>
		              <style type="text/css">{styles}</style>
		              <AboveFeedPostWidgetView 
		              	postUid={postContainerElement.getAttribute("data-id")}
		              	tabId={props.tabId}
		              	// timerDisplay={this.timerDisplay}
		              	allKeywords={props.allKeywords}
		              	visitId={props.visitId}
		              	highlightedKeywordBadgeColors={props.highlightedKeywordBadgeColors}/>
		            </React.StrictMode>
		        );

			}

		});

	}

}
