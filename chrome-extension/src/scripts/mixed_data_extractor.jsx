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
// import { categoryVerbMap, appParams } from "../popup/Local_library";
import ReactDOM from 'react-dom/client';
import styles from "../contentScriptUi/styles.min.css";
import FeedDataExtractor from "./feed_data_extractor";
import ProfileDataExtractor from "./profile_data_extractor";

class MixedDataExtractor extends DataExtractorBase {

    constructor(){
        super();
    }

    setUpExtensionWidgets(){

        if (this.pageUrl.indexOf("/feed") != -1){
            FeedDataExtractor.setUpExtensionWidgets(this.tabId);
        }
        else if (this.pageUrl.indexOf("/in/") != -1){
            ProfileDataExtractor.setUpExtensionWidgets(this.tabId);
        }

    }

    extractData(){

        const pageUrl = window.location.href;

        if (pageUrl.indexOf("/feed") != -1){
            
            if (this.pageUrl != pageUrl){
                FeedDataExtractor.posts = [];
                FeedDataExtractor.viewedPosts = {};
                FeedDataExtractor.setUpExtensionWidgets(this.tabId);

                this.pageUrl = pageUrl;
                this.webPageData = null;
            }
            return FeedDataExtractor.extractData();

        }
        else if (pageUrl.indexOf("/in/") != -1){

            if (this.pageUrl != pageUrl){
                ProfileDataExtractor.setUpExtensionWidgets(this.tabId);

                this.pageUrl = pageUrl;
                this.webPageData = null;
            }
            return ProfileDataExtractor.extractData();

        }

        return null;

    }

}

var mixedDataExtractor = new MixedDataExtractor();
