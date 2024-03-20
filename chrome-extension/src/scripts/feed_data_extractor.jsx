
import { DataExtractorBase } from "./data_extractor_lib";
import { categoryVerbMap } from "../popup/Local_library";
import { db } from "../db";

const beaconClassName = "linkbeam-beacon-symbol";

class FeedDataExtractor extends DataExtractorBase {

	constructor(){
		super();
		this.posts = [];
	}

	extractPostDataFrom(postTagContainer, category, authorName){

		var post = {
			id: postTagContainer.getAttribute("data-id"),
			category: category, 
			content: {}
		};

		if (category){

			const postTagContainerHeader = postTagContainer.querySelector(".update-components-header");

			post.initiator = {
				name: postTagContainerHeader.querySelector("a.update-components-text-view__mention") 
						? postTagContainerHeader.querySelector("a.update-components-text-view__mention").textContent 
						: null,
				url: postTagContainerHeader.querySelector("a.app-aware-link ") 
						? postTagContainerHeader.querySelector("a.app-aware-link ").href.split("?")[0]
						: null,
				picture: null,
			};

		}

		var reactionsTagContent = postTagContainer.querySelector(".social-details-social-counts") 
									? postTagContainer.querySelector(".social-details-social-counts").textContent
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
				url: postTagContainer.querySelector(".update-components-actor__meta a.app-aware-link")
						? postTagContainer.querySelector(".update-components-actor__meta a.app-aware-link").href.split("?")[0]
						: null,
				picture: postTagContainer.querySelector(".update-components-actor__container .update-components-actor__image img")
							? postTagContainer.querySelector(".update-components-actor__container .update-components-actor__image img").src
							: null,
			},
			text: postTagContainer.querySelector(".feed-shared-update-v2__description-wrapper")
					? postTagContainer.querySelector(".feed-shared-update-v2__description-wrapper").textContent
					: null,
			reactions: getPostReactionsValues("reaction"),
			commentsCount: getPostReactionsValues("comment"),               
			repostsCount: getPostReactionsValues("repost"),
		}

		return post;

	}

	extractItemsCountByCategory(){

		var metrics = {publications: 0};

		// initializing the metrics variable
		for (var category in categoryVerbMap){
			metrics[category] = 0;
		}

		var beaconTag = document.querySelector(`.${beaconClassName}`);
		beaconTag = beaconTag ? beaconTag.nextElementSibling : document.querySelector(".scaffold-finite-scroll__content").firstChild;

		this.posts = [];
		
		while (beaconTag){

			var postTagContainer = beaconTag;
			beaconTag = beaconTag.nextElementSibling;

			if (!beaconTag){
				document.querySelector(`.${beaconClassName}`).classList.remove(beaconClassName);
				postTagContainer.classList.add(beaconClassName);
			}

			if (postTagContainer.tagName != "DIV" || !postTagContainer.querySelector("div.relative[data-id]")){
				continue;
			}

			postTagContainer = postTagContainer.querySelector("div.relative[data-id]");

			if (postTagContainer.getAttribute("data-id").indexOf("urn:li:aggregate") != -1){
				continue;
			}

			const postTagContainerHeader = postTagContainer.querySelector(".update-components-header"),
				  authorName = postTagContainer.querySelector(".update-components-actor__name .visually-hidden")
								? postTagContainer.querySelector(".update-components-actor__name .visually-hidden").textContent
								: null;

			var postCategory = null;
			if (postTagContainerHeader){
				for (var category in categoryVerbMap){
					if (postTagContainerHeader.textContent.toLowerCase().indexOf(categoryVerbMap[category].toLowerCase()) != -1){
						metrics[category] += 1;
						postCategory = category;
						break;
					}
				}
			}

			if (!postCategory && authorName){
				metrics.publications += 1;
			}

			if (["suggestions"].indexOf(postCategory) == -1
					&& authorName){
				var post = this.extractPostDataFrom(postTagContainer, postCategory, authorName);
				this.posts.push(post);
			}

		}

		return metrics;

	}

	extractData(){

		let pageData = { 
			metrics: this.extractItemsCountByCategory(), 
		};

		pageData.posts = this.posts;

		return pageData;

	}

}

var feedDataExtractor = new FeedDataExtractor();
