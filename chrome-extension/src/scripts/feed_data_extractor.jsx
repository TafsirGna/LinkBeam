
import { DataExtractorBase } from "./data_extractor_lib";

function extractPosts(){
	// document.querySelectorAll[]
}

class FeedDataExtractor extends DataExtractorBase {

	constructor(){
		super();
	}

	extractData(){

		let pageData = null;

		pageData = {
			metrics: {
				reposts: 0,
				likes: 0,
				loves: 0,
				contributions: 0,
				supports: 0,
				comments: 0,
				celebrations: 0,
			},
			posts: [
			],
		}

		return pageData;

	}

}

var feedDataExtractor = new FeedDataExtractor();
