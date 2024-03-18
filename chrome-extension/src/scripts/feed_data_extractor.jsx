
import { DataExtractorBase } from "./data_extractor_lib";

function extractPosts(){
	// document.querySelectorAll[]
}

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

		post.content = {
			author:{
				name: postTagContainer.querySelector(".update-components-actor__name .visually-hidden")
						? postTagContainer.querySelector(".update-components-actor__name .visually-hidden").textContent
						: null,
				url: postTagContainer.querySelector(".update-components-actor__meta a.app-aware-link")
						? postTagContainer.querySelector(".update-components-actor__meta a.app-aware-link").href.split("?")[0]
						: null,
			},
			text: postTagContainer.querySelector(".feed-shared-update-v2__description-wrapper")
					? postTagContainer.querySelector(".feed-shared-update-v2__description-wrapper").textContent
					: null,
			reactions: postTagContainer.querySelector(".social-details-social-counts__social-proof-container")
						? postTagContainer.querySelector(".social-details-social-counts__social-proof-container").textContent
						: null,
			commentsCount: postTagContainer.querySelector(".social-details-social-counts__comments")
							? postTagContainer.querySelector(".social-details-social-counts__comments").textContent
							: null,               
			repostsCount: postTagContainer.querySelector(".social-details-social-counts__reactions")
							? postTagContainer.querySelector(".social-details-social-counts__reactions").textContent
							: null,
		}

		return post;

	}

	extractItemsCountByCategory(){

		var metrics = {publications: 0};
		// initializing the metrics variable
		for (var category in categoryVerbMap){
			metrics[category] = 0;
		}

		const postTagContainers = document.querySelectorAll(".scaffold-finite-scroll__content div.relative[data-id]");

		Array.from(postTagContainers).forEach((postTagContainer) => {

			if (postTagContainer.getAttribute("data-id").indexOf("urn:li:aggregate") != -1){
				return;
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

		});

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
