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
import {
    isLinkedinFeed,
    isLinkedinProfilePage,
    isLinkedinFeedPostPage,
    isLinkedinProfileSectionDetailsPage,
    shuffle,
} from "../../popup/Local_library";
import FeedPageScriptAgent from "./feed_page_script";
import ProfilePageScriptAgent from "./profile_page_script";
import FeedPostPageScriptAgent from "./feed_post_page_script";
import ProfileSectionDetailsPageScriptAgent from "./profile_section_details_page_script";
import eventBus from "../../popup/EventBus";


class MainScriptAgent extends ScriptAgentBase {

    constructor(){

        super();
        this.timerInterval = null;
        this.highlightedKeywordBadgeColors = shuffle([
            "bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 text-yellow-800",
            "bg-green-100 dark:bg-green-900 dark:text-green-300 text-green-800",
            "bg-pink-100 dark:bg-pink-900 dark:text-pink-300 text-pink-800",
            "bg-blue-100 dark:bg-blue-900 dark:text-blue-300 text-blue-800",
            "bg-purple-100 dark:bg-purple-900 dark:text-purple-300 text-purple-800",
            "bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 text-indigo-800",
        ]);
        
    }

    handleIncomingMessages(message, sender, sendResponse){

        switch(message.header){
            case "FEED_POSTS_HIDE_STATUS_RESPONSE" :{
                console.log("~~~~~~~~~~~~~ 1 : ", message.data);
                for (const postUid in message.data){
                    FeedPageScriptAgent.allPostsHideStatus[postUid] = message.data[postUid];
                    console.log("~~~~~~~~~~~~~ 2 : ", postUid, FeedPageScriptAgent.allPostsHideStatus[postUid]);
                    if (FeedPageScriptAgent.allPostsHideStatus[postUid]){
                        console.log("~~~~~~~~~~~~~ 3 : ", postUid, FeedPageScriptAgent.allPostsHideStatus[postUid]);
                        FeedPageScriptAgent.hidePost(postUid);
                    }
                }
                break;
            }
        }

    }

    scrollEventHandler2(){

        var props = {
            tabId: this.tabId, 
            highlightedKeywordBadgeColors: this.highlightedKeywordBadgeColors,
            allKeywords: this.allKeywords,
            appSettings: this.appSettings,
            visitId: this.visitId,
            otherArgs: this.otherArgs,
        };
    
        if (isLinkedinFeed(this.pageUrl)){
            FeedPageScriptAgent.scrollEventHandler(props);
        }
        else if (isLinkedinProfilePage(this.pageUrl)){
            if (isLinkedinProfileSectionDetailsPage(this.pageUrl)){
                // ProfileSectionDetailsPageScriptAgent.scrollEventHandler(props);
            }
            else{
                // ProfilePageScriptAgent.scrollEventHandler(props);
            }
        }
        else if (isLinkedinFeedPostPage(this.pageUrl)){
            // FeedPostPageScriptAgent.scrollEventHandler(props);
        }

    }

    runTabDataExtractionProcess(){

        this.timerInterval = setInterval(() => {

            if (!this.isActiveTab){
                return;
            }

            const pageUrl = window.location.href;
            var props = {
                tabId: this.tabId, 
                highlightedKeywordBadgeColors: this.highlightedKeywordBadgeColors,
                allKeywords: this.allKeywords,
                appSettings: this.appSettings,
                visitId: this.visitId,
                otherArgs: this.otherArgs,
            };

            if (isLinkedinFeedPostPage(pageUrl)){

                if (this.pageUrl != pageUrl){
                    FeedPageScriptAgent.allExtensionWidgetsSet = false;
                    this.pageUrl = pageUrl;
                }

                FeedPostPageScriptAgent.checkAndUpdateUi(props);
                
            }
            else if (isLinkedinFeed(pageUrl)){

                if (this.pageUrl != pageUrl){
                    FeedPageScriptAgent.activePostContainerElementUid = null;
                    FeedPageScriptAgent.allExtensionWidgetsSet = false;
                    FeedPageScriptAgent.allPostsHideStatus = {};
                    this.pageUrl = pageUrl;
                }

                FeedPageScriptAgent.checkAndUpdateUi(props);
                // FeedPageScriptAgent.runTabDataExtractionProcess(props);

            }
            else if (isLinkedinProfilePage(pageUrl)){

                if (isLinkedinProfileSectionDetailsPage(pageUrl)){

                    if (this.pageUrl != pageUrl){
                        ProfileSectionDetailsPageScriptAgent.webPageData = null;
                        // ProfileSectionDetailsPageScriptAgent.checkAndUpdateUi(props);
                        this.pageUrl = pageUrl;
                    }

                    ProfileSectionDetailsPageScriptAgent.runTabDataExtractionProcess(props);

                }
                else{

                    if (this.pageUrl != pageUrl){
                        ProfilePageScriptAgent.webPageData = null;
                        ProfilePageScriptAgent.detectedKeywords = {};
                        ProfilePageScriptAgent.keywordDetected = false;
                        ProfilePageScriptAgent.checkAndUpdateUi(props);
                        this.pageUrl = pageUrl;
                    }

                    ProfilePageScriptAgent.runTabDataExtractionProcess(props);

                }

            }

        }, ScriptAgentBase.EXTRACTION_PROCESS_INTERVAL_TIME);

    }

}

const mainScriptAgent = new MainScriptAgent();