
import { 
	DataExtractorBase,
} from "./data_extractor_lib";
import React from 'react';
import { categoryVerbMap, appParams } from "../popup/Local_library";
import { db } from "../db";
import ReactDOM from 'react-dom/client';
import styles from "../contentScriptUi/styles.min.css";
import FeedPostDataMarkerView from "../contentScriptUi/widgets/FeedPostDataMarkerView";
import FeedPostDataModal from "../contentScriptUi/widgets/FeedPostDataModal";

class FeedDataExtractor extends DataExtractorBase {

	constructor(){
		super();
		this.posts = [];
		this.viewedPosts = {};

	}

	setUpExtensionWidgets(){

		// adding the post stats modal
		var newDivTag = document.createElement('div');
        document.querySelector(".scaffold-finite-scroll__content")
        		.prepend(newDivTag);
        newDivTag.attachShadow({ mode: 'open' });

		ReactDOM.createRoot(newDivTag.shadowRoot).render(
            <React.StrictMode>
              <style type="text/css">{styles}</style>
              <FeedPostDataModal tabId={this.tabId}/>
            </React.StrictMode>
        );
		
	}

	extractPostDataFrom(postContainerElement, postCategory, authorName){

		const uid = postContainerElement.getAttribute("data-id");
		
		if (!(uid in this.viewedPosts)){
			this.viewedPosts[uid] = {
				html: postContainerElement.innerHTML,
			}
		}
		else{
			if (this.viewedPosts[uid].html == postContainerElement.html){
				return null;
			}
		}

		var post = {
			id: uid,
			category: postCategory,
			content: {},
		};

		if (post.category){

			const postContainerHeaderElement = postContainerElement.querySelector(".update-components-header");

			post.initiator = {
				name: postContainerHeaderElement.querySelector("a.update-components-text-view__mention") 
						? postContainerHeaderElement.querySelector("a.update-components-text-view__mention").textContent 
						: null,
				url: postContainerHeaderElement.querySelector("a.app-aware-link ") 
						? postContainerHeaderElement.querySelector("a.app-aware-link ").href.split("?")[0]
						: null,
				picture: postContainerHeaderElement.querySelector("img")
							? postContainerHeaderElement.querySelector("img").src 
							: null,
			};

		}

		var reactionsTagContent = postContainerElement.querySelector(".social-details-social-counts") 
									? postContainerElement.querySelector(".social-details-social-counts").textContent
									: null ;

		const getPostReactionsValues = metric => {

			var value = null;

			if (!reactionsTagContent){
				return value;
			}

			if (["comment", "repost"].indexOf(metric) != -1){

				if (reactionsTagContent.indexOf(metric) != -1){
					for (var arrayItem of reactionsTagContent.split("\n")){
						var index = arrayItem.indexOf(metric);
						if (index != -1){
							value = Number(arrayItem.slice(0, index));
							break;
						}
					}
				}

			}

			if (metric == "reaction"){

				var otherTermIndex = reactionsTagContent.indexOf("other");
				if (otherTermIndex != -1){
					value = Number(reactionsTagContent.slice((reactionsTagContent.indexOf("and") + ("and").length), otherTermIndex));
				}
				else{

				}

			}
			
			return value;
		};

		post.content = {
			author:{
				name: authorName,
				url: postContainerElement.querySelector(".update-components-actor__meta a.app-aware-link")
						? postContainerElement.querySelector(".update-components-actor__meta a.app-aware-link").href.split("?")[0]
						: null,
				picture: postContainerElement.querySelector(".update-components-actor__container .update-components-actor__image img")
							? postContainerElement.querySelector(".update-components-actor__container .update-components-actor__image img").src
							: null,
			},
			// text: postContainerElement.querySelector(".feed-shared-update-v2__description-wrapper")
			// 		? postContainerElement.querySelector(".feed-shared-update-v2__description-wrapper").textContent
			// 		: null,
			reactions: getPostReactionsValues("reaction"),
			commentsCount: getPostReactionsValues("comment"),               
			repostsCount: getPostReactionsValues("repost"),
		};


		// displaying the info widget
		if (!postContainerElement.querySelector(`.${appParams.FEED_POST_WIDGET_CLASS_NAME}`)){

			var newDivTag = document.createElement('div');
			newDivTag.classList.add(appParams.FEED_POST_WIDGET_CLASS_NAME);
	        postContainerElement.prepend(newDivTag);
	        newDivTag.attachShadow({ mode: 'open' });

			ReactDOM.createRoot(newDivTag.shadowRoot).render(
	            <React.StrictMode>
	              <style type="text/css">{styles}</style>
	              <FeedPostDataMarkerView 
	              	object={post}/>
	            </React.StrictMode>
	        );

		}

		return post;

	}

	extractItemsCountByCategory(){

		var metricLabels = Object.keys(categoryVerbMap);
		metricLabels.push("publications"); 

		// initializing the metrics variable
		var metricValues = metricLabels.map(metricLabel => 0);

		this.posts = [];

		var postContainerElements = document.querySelector(".scaffold-finite-scroll__content")
											.querySelectorAll("div[data-id]");

		Array.from(postContainerElements).forEach(postContainerElement => {

			const postContainerHeaderElement = postContainerElement.querySelector(".update-components-header"),
				  authorName = postContainerElement.querySelector(".update-components-actor__name .visually-hidden")
								? postContainerElement.querySelector(".update-components-actor__name .visually-hidden").textContent
								: null;
			var postCategory = null;

			if (postContainerHeaderElement){

				const headerText = postContainerHeaderElement.textContent.toLowerCase();
				metricValues = metricLabels.map((metricLabel, index) => {

					var value = metricValues[index];
					if (headerText.indexOf(categoryVerbMap[metricLabel]) != -1){
						value++;
						postCategory = metricLabel;
					}

					return value;
				});

			}

			if (!postCategory && authorName){
				metricValues[metricValues.length - 1]++;
			}

			if (["suggestions"].indexOf(postCategory) == -1
					&& authorName){
				var post = this.extractPostDataFrom(postContainerElement, postCategory, authorName);
				if (post){
					this.posts.push(post);
				}
			}

		});

		var results = {};
		metricLabels.forEach((metricLabel, index) => {
			results[metricLabel] = metricValues[index];
		});

		return results;

	}

	extractData(){

		let pageData = { 
			metrics: this.extractItemsCountByCategory()
		};

		pageData.posts = this.posts;

		return pageData;

	}

}

var feedDataExtractor = new FeedDataExtractor();
