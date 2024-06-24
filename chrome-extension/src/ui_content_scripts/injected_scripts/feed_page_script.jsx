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
	isLinkedinFeed,
} from "../../popup/Local_library";
import ReactDOM from 'react-dom/client';
import styles from "../styles.min.css";
import AboveFeedPostWidgetView from "../widgets/feed/AboveFeedPostWidgetView";
import FeedPostViewsChartModal from "../widgets/feed/FeedPostViewsChartModal";
import FeedPostRelatedPostsModal from "../widgets/feed/FeedPostRelatedPostsModal";
import eventBus from "../../popup/EventBus";

const LINKBEAM_ALL_FEED_MODALS = "LINKBEAM_ALL_FEED_MODALS";

function getElementVisibility(element) {

	var windowHeight = window.innerHeight,
        docScroll = window.scrollY,
        divPosition = element.offsetTop,
        divHeight = element.offsetHeight,
        hiddenBefore = docScroll - divPosition,
        hiddenAfter = (divPosition + divHeight) - (docScroll + windowHeight);

    if ((docScroll > divPosition + divHeight) || (divPosition > docScroll + windowHeight)) {
        return 0;
    } else {
        var result = 100;

        if (hiddenBefore > 0) {
            result -= (hiddenBefore * 100) / divHeight;
        }

        if (hiddenAfter > 0) {
            result -= (hiddenAfter * 100) / divHeight;
        }

        return Math.round(result);
    }
  
}

export default class FeedPageScriptAgent extends ScriptAgentBase {

	static activePostContainerElementUid = null;

	constructor(){
		super();
	}

	static scrollEventHandler(props){

		if (!isLinkedinFeed(window.location.href)){
			return;
		}

		const postContainerElements = this.getPostContainerElements();

		if (!postContainerElements){
			return;
		}

		var postContainerElementsExposurePercentage = postContainerElements.map(postContainerElement => ({
			uid: postContainerElement.getAttribute("data-id"),
			exposurePercentage: getElementVisibility(postContainerElement),
		}));

		postContainerElementsExposurePercentage.sort((a, b) => (b.exposurePercentage - a.exposurePercentage));

		if (this.activePostContainerElementUid != postContainerElementsExposurePercentage[0].uid){

			this.activePostContainerElementUid = postContainerElementsExposurePercentage[0].uid;

			const postContainerElement = postContainerElements.filter(postContainerElement => postContainerElement.getAttribute("data-id") == this.activePostContainerElementUid)[0];
			if (!postContainerElement.querySelector(`div.${appParams.FEED_POST_WIDGET_CLASS_NAME}`)){
				this.attachPostWidget(postContainerElement, props);
			}
			else{

				eventBus.dispatch(eventBus.ACTIVE_POST_CONTAINER_ELEMENT, { uid: this.activePostContainerElementUid });
				console.log("QQQQQQQQQQQQQQQQQQQQ 1 : ", this.activePostContainerElementUid, postContainerElementsExposurePercentage);

			}

		}

	}

	static getPostContainerElements(){

		const mainSectionHtmlEl = document.querySelector(".scaffold-finite-scroll__content");

		if (!mainSectionHtmlEl){
			return null;
		}

		return Array.from(mainSectionHtmlEl.querySelectorAll("div[data-id]")).filter(htmlElement => {

			if (htmlElement.querySelector(".feed-shared-update-v2")){
				if (window.getComputedStyle(htmlElement.querySelector(".feed-shared-update-v2")).display === "none"){
					return false;
				}
			}
			else{
				return false;
			}

			// if a post doesn't have neither a category (publication) nor author, then pass
			if (!htmlElement.querySelector(".update-components-actor__name .visually-hidden")){
				return false;
			}

			return true;

		});

	}

	static checkAndUpdateUi(props){

		if (document.querySelector(".scaffold-finite-scroll__content")){

			if (!document.querySelector(".scaffold-finite-scroll__content")
					 	.querySelector(`.${LINKBEAM_ALL_FEED_MODALS}`)){

				var newDivTag = document.createElement('div');
				newDivTag.classList.add("LINKBEAM_ALL_FEED_MODALS");
			    document.querySelector(".scaffold-finite-scroll__content")
			    		.prepend(newDivTag);
			    newDivTag.attachShadow({ mode: 'open' });

				ReactDOM.createRoot(newDivTag.shadowRoot).render(
		            <React.StrictMode>
		              <style type="text/css">{styles}</style>
		              <div>
		              	<FeedPostViewsChartModal
		                  appSettings={props.appSettings}
		                  tabId={props.tabId}/>

		                <FeedPostRelatedPostsModal
		                  appSettings={props.appSettings}
		                  tabId={props.tabId}/>
		              </div>
		            </React.StrictMode>
		        );

			}

			if (!this.getPostContainerElements()[0].querySelector(`div.${appParams.FEED_POST_WIDGET_CLASS_NAME}`)){

				this.attachPostWidget(this.getPostContainerElements()[0], props);

			}

		}

	}

	static attachPostWidget(postContainerElement, props){

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
              	allKeywords={props.allKeywords}
              	visitId={props.visitId}
              	highlightedKeywordBadgeColors={props.highlightedKeywordBadgeColors}
              	// index={index}
              	appSettings={props.appSettings}/>
            </React.StrictMode>
        );

	}

	// static runTabDataExtractionProcess(props){

	// }

}
