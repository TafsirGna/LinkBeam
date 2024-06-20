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


	// // Get the relevant measurements and positions
  	// const viewportHeight = window.innerHeight;
  	// const scrollTop = window.scrollY;
  	// const elementOffsetTop = element.offsetTop;
  	// const elementHeight = element.offsetHeight;

  	// // Calculate percentage of the element that's been seen
  	// const distance = scrollTop + viewportHeight - elementOffsetTop;
  	// const percentage = Math.round(
    // 	distance / ((viewportHeight + elementHeight) / 100)
  	// );

  	// // Restrict the range to between 0 and 100
  	// return Math.min(100, Math.max(0, percentage));



  // const rect = element.getBoundingClientRect();
  
  // const elementArea = (rect.width * rect.height);
  
  // let visibleWidth = (
  //   rect.left >= 0 ? rect.width : rect.width + rect.left
  // );
  // if (visibleWidth < 0) {
  //   visibleWidth = 0;
  // }
  
  // let visibleHeight = (
  //   rect.top >= 0 ? rect.height : rect.height + rect.top
  // );
  // if (visibleHeight < 0) {
  //   visibleHeight = 0;
  // }
  
  // const visibleArea = visibleWidth * visibleHeight;
  
  // return { 
  //   elementArea,
  //   visibleWidth,
  //   visibleHeight,
  //   visibleArea,
  //   visiblePercentage: (visibleArea / elementArea * 100)
  // };
  
}

export default class FeedPageScriptAgent extends ScriptAgentBase {

	static activePostContainerElementUid = null;

	constructor(){
		super();
	}

	static scrollEventHandler(){

		const postContainerElements = this.getPostContainerElements();

		if (!postContainerElements){
			return;
		}

		var postContainerElementsExposurePercentage = [];

		Array.from(postContainerElements).forEach(postContainerElement => {

			postContainerElementsExposurePercentage.push({
				uid: postContainerElement.getAttribute("data-id"),
				exposurePercentage: getElementVisibility(postContainerElement)/*.visiblePercentage*/,
			});

		});

		postContainerElementsExposurePercentage.sort((a, b) => b.exposurePercentage - a.exposurePercentage);

		console.log("QQQQQQQQQQQQQQQQQQQQ : ", postContainerElementsExposurePercentage);

		if (this.activePostContainerElementUid != postContainerElementsExposurePercentage[0].uid){
			this.activePostContainerElementUid = postContainerElementsExposurePercentage[0].uid;
			eventBus.dispatch(eventBus.ACTIVE_POST_CONTAINER_ELEMENT, { uid: this.activePostContainerElementUid });
		}

	}

	static getPostContainerElements(){

		const mainSectionHtmlEl = document.querySelector(".scaffold-finite-scroll__content");

		if (!mainSectionHtmlEl){
			return null;
		}

		return mainSectionHtmlEl.querySelectorAll("div[data-id]");

	}

	static updateUi(props){

		if (document.querySelector(".scaffold-finite-scroll__content")
			&& !document.querySelector(".scaffold-finite-scroll__content")
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

	}

	static runTabDataExtractionProcess(props){

		const postContainerElements = this.getPostContainerElements();

		if (!postContainerElements){
			return;
		}

		Array.from(postContainerElements).forEach((postContainerElement, index) => {

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
		              	allKeywords={props.allKeywords}
		              	visitId={props.visitId}
		              	highlightedKeywordBadgeColors={props.highlightedKeywordBadgeColors}
		              	// index={index}
		              	appSettings={props.appSettings}/>
		            </React.StrictMode>
		        );

			}

		});

		this.updateUi(props);

	}

}
