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
	getFeedPostHtmlElement,
	getFontFamilyStyle,
} from "./main_lib";
import React from 'react';
import { 
	appParams,
	isLinkedinFeed,
} from "../../popup/Local_library";
import ReactDOM from 'react-dom/client';
import styles from "../styles.min.css";
import AboveFeedPostWidgetView from "../widgets/feed/AboveFeedPostWidgetView";
import FeedPostHiddenMarkerView from "../widgets/feed/FeedPostHiddenMarkerView";
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
	static allPostsHideStatus = {};
	static allExtensionWidgetsSet = false;
	static mainHtmlEl = () => document.querySelector(".scaffold-finite-scroll__content");
	static distractiveElSelectors = () => [...ScriptAgentBase.distractiveElSelectors/*,
									 	   ".share-box-feed-entry__closed-share-box artdeco-card"*/];
	static automaticScrollStarted = false;

	constructor(){
		super();
	}

	static scrollEventHandler(props){

		if (!isLinkedinFeed(window.location.href)){
			return;
		}

		const postContainerElements = this.getPostContainerElements();

		if (!postContainerElements || !postContainerElements.length){
			return;
		}

		const postContainerElementsExposurePercentage = postContainerElements.map(postContainerElement => ({
																					uid: postContainerElement.getAttribute("data-id"),
																					exposurePercentage: getElementVisibility(postContainerElement),
																				}))
																			 .toSorted((a, b) => (b.exposurePercentage - a.exposurePercentage));

		console.log("<<<<<<<<<<<<<<<<<<<< : ", this.activePostContainerElementUid, postContainerElementsExposurePercentage[0].uid, postContainerElementsExposurePercentage);

		if (this.activePostContainerElementUid != postContainerElementsExposurePercentage[0].uid){

			this.activePostContainerElementUid = postContainerElementsExposurePercentage[0].uid;

			const postContainerElement = postContainerElements.filter(postContainerElement => postContainerElement.getAttribute("data-id") == this.activePostContainerElementUid)[0];
			console.log(">>>>>>>>>>>>>>>>>>> ||| : ", postContainerElement.getAttribute("data-id"), postContainerElement.querySelector(`div.${appParams.FEED_POST_WIDGET_CLASS_NAME}`));
			if (!postContainerElement.querySelector(`div.${appParams.FEED_POST_WIDGET_CLASS_NAME}`)){
				this.attachPostWidget(postContainerElement, props);
			}

			eventBus.dispatch(eventBus.ACTIVE_POST_CONTAINER_ELEMENT, { uid: this.activePostContainerElementUid });

			this.getAllPostsHideStatus(postContainerElements, props);

		}

	}

	static getPostContainerElements(){

		if (!this.mainHtmlEl()){
			return null;
		}

		return Array.from(this.mainHtmlEl().querySelectorAll("div[data-id]")).filter(htmlElement => {

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

		this.checkAndUpdateDistractiveUi(FeedPageScriptAgent, props);

		if (this.allExtensionWidgetsSet || !this.mainHtmlEl()){
			return;
		}

		if (!this.mainHtmlEl().querySelector(`.${LINKBEAM_ALL_FEED_MODALS}`)){

			try{
				var newDivTag = document.createElement('div');
				newDivTag.classList.add(LINKBEAM_ALL_FEED_MODALS);
			    this.mainHtmlEl().prepend(newDivTag);
			    newDivTag.attachShadow({ mode: 'open' });

				ReactDOM.createRoot(newDivTag.shadowRoot).render(
		            <React.StrictMode>
		              	<style type="text/css">{styles}</style>
		              	{ getFontFamilyStyle(props) }
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

				this.allExtensionWidgetsSet = true;
			}
			catch(error){
				console.log("An error occured when inserting some initial widgets : ", error);
			}

		}
		else{
			this.allExtensionWidgetsSet = true;
		}

		// showing the widget above every adequate posts
		const postContainerElements = this.getPostContainerElements();

		if (!postContainerElements || !postContainerElements.length){
			this.allExtensionWidgetsSet = false;
			return;
		}

		// for that purpose, getting the currently visible post
		const visiblePostContainerElement = document.querySelector(`[data-id='${postContainerElements.map(postContainerElement => ({
																											uid: postContainerElement.getAttribute("data-id"),
																											exposurePercentage: getElementVisibility(postContainerElement),
																										}))
																									 .toSorted((a, b) => (b.exposurePercentage - a.exposurePercentage))[0].uid}']`);

		try{
			var index = 0;
			while(true){
				if (!postContainerElements[index].querySelector(`div.${appParams.FEED_POST_WIDGET_CLASS_NAME}`)){
					this.attachPostWidget(postContainerElements[index], props);
				}

				if (postContainerElements[index].getAttribute("data-id") == visiblePostContainerElement.getAttribute("data-id")){
					break;
				}
				index++;
			}

			if ((new URLSearchParams(window.location.search)).get("automated") == "true" && !this.automaticScrollStarted){
				this.automaticScroll(visiblePostContainerElement, props);
			}

		}
		catch(error){
			console.log("An error occured when inserting some initial widgets : ", error);
			this.allExtensionWidgetsSet &&= false;
		}
		
		this.getAllPostsHideStatus(postContainerElements, props);

	}

	static getAllPostsHideStatus(postContainerElements, props){

		var postUids = postContainerElements.filter(postContainerElement => !(postContainerElement.getAttribute("data-id") in this.allPostsHideStatus))
										   .map(postContainerElement => {
										   	const postUid = postContainerElement.getAttribute("data-id");
										   	this.allPostsHideStatus[postUid] = null;
										   	return postUid;
										   });

		chrome.runtime.sendMessage({header: "FEED_POSTS_HIDE_STATUS", data: {tabId: props.tabId, objects: postUids}}, (response) => {
	      console.log('tab idle status sent', response, postUids);
	    });		

	}

	static hidePost(postUid){

		var postContainerElement = getFeedPostHtmlElement(postUid);
		if (postContainerElement.querySelector(`div.${appParams.FEED_POST_WIDGET_CLASS_NAME}`)){
			postContainerElement.querySelector(`div.${appParams.FEED_POST_WIDGET_CLASS_NAME}`)
								.remove();
		}
		this.attachPostWidget(postContainerElement);

	}

	static attachPostWidget(postContainerElement, props){

		const postUid = postContainerElement.getAttribute("data-id");

		// Adding the marker
		var newDivTag = document.createElement('div');
		newDivTag.classList.add(appParams.FEED_POST_WIDGET_CLASS_NAME);
	    postContainerElement.prepend(newDivTag);
	    newDivTag.attachShadow({ mode: 'open' });

		if (this.allPostsHideStatus[postUid] == true){ // then hide the post

			ReactDOM.createRoot(newDivTag.shadowRoot).render(
	            <React.StrictMode>
	              <style type="text/css">{styles}</style>
	              { getFontFamilyStyle(props) }
	              <FeedPostHiddenMarkerView 
	              	postUid={postUid}/>
	            </React.StrictMode>
	        );

	        postContainerElement.querySelector(".feed-shared-update-v2").style.cssText = "display: none;";

		}
		else{

			ReactDOM.createRoot(newDivTag.shadowRoot).render(
	            <React.StrictMode>
	              <style type="text/css">{styles}</style>
	              { getFontFamilyStyle(props) }
	              <AboveFeedPostWidgetView 
	              	postUid={postUid}
	              	tabId={props.tabId}
	              	allKeywords={props.allKeywords}
	              	visitId={props.visitId}
	              	highlightedKeywordBadgeColors={props.highlightedKeywordBadgeColors}
	              	// index={index}
	              	appSettings={props.appSettings}/>
	            </React.StrictMode>
	        );

		}

	}

	// static runTabDataExtractionProcess(props){

	// }

	static async automaticScroll(postContainerElement, props){

		postContainerElement.scrollIntoView({ behavior: "smooth" });

		this.automaticScrollStarted = !this.automaticScrollStarted ? true : this.automaticScrollStarted;

		const timer = ms => new Promise(res => setTimeout(res, ms))

		// updating the new scroll target
		while(true){
			// Setting the new scroll target
			const postContainerElements = this.getPostContainerElements();
			const postContainerElementIndex = postContainerElements.findIndex(el => el.getAttribute("data-id") == postContainerElement.getAttribute("data-id"));

			if ((postContainerElementIndex + 1) >= props.appSettings.browseFeedForMePostCount){

				chrome.runtime.sendMessage({header: "AUTO_FEED_VISIT_ENDED", data: {tabId: props.tabId, tabUrl: window.location.href.split("?")[0]}}, (response) => {
			      console.log('tab idle status sent', response);
			    });		
				return;
			}

			if (postContainerElements[postContainerElementIndex + 1]){
				postContainerElement = postContainerElements[postContainerElementIndex + 1];
				break;
			}

			window.scrollBy(0, parseInt(window.innerHeight / 2));

			// waiting for 3 seconds before resuming 
			await timer(1000);
		}

		// Set a timeout for scrolling to this target
		const timeOut = setTimeout(() => {
			this.automaticScroll(postContainerElement, props);
		}, 1000);

	}

}
