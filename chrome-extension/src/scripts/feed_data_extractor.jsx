
import { DataExtractorBase } from "./data_extractor_lib";

const categoryVerbMap = {
	likes: "likes",
	loves: "loves",
	contributions: "contributed",
	supports: "supports",
	celebrations: "celebrates",
	comments: "commented",
	reposts: "reposted",
	suggestions: "suggested",
}

const beaconClassName = "linkbeam-beacon-symbol";

class FeedDataExtractor extends DataExtractorBase {

	constructor(){
		super();
		this.posts = [];
	}

	extractPostDataFrom(postTagContainer, category){

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
			};

		}

		var reactionsTagContent = postTagContainer.querySelector(".social-details-social-counts") 
									? postTagContainer.querySelector(".social-details-social-counts").textContent
									: null ;

		const getPostReactionsValues = metric => {

			var value = null;

			if (reactionsTagContent){

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
			

			return value;
		};

		post.content = {
			author:{
				name: postTagContainer.querySelector(".update-components-actor__name .visually-hidden")
						? postTagContainer.querySelector(".update-components-actor__name .visually-hidden").textContent
						: null,
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
			reactions: null,
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

		while (beaconTag){

			var postTagContainer = beaconTag;
			beaconTag = beaconTag.nextElementSibling;

			if (!beaconTag){
				postTagContainer.classList.add(beaconClassName);
			}

			if (postTagContainer.tagName != "DIV" || !postTagContainer.querySelector("div.relative[data-id]")){
				continue;
			}

			postTagContainer = postTagContainer.querySelector("div.relative[data-id]");

			if (postTagContainer.getAttribute("data-id").indexOf("urn:li:aggregate") != -1){
				continue;
			}

			const postTagContainerHeader = postTagContainer.querySelector(".update-components-header");
			var postCategory = null;
			if (postTagContainerHeader){
				for (var category in categoryVerbMap){
					if (postTagContainerHeader.textContent.indexOf(categoryVerbMap[category]) != -1){
						metrics[category] += 1;
						postCategory = category;
						break;
					}
				}
			}

			if (!postCategory){
				metrics.publications += 1;
			}

			var post = this.extractPostDataFrom(postTagContainer, postCategory);
			this.posts.push(post);

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
