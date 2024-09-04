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
    appParams,
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
        this.timerIntervalInc = 0;
        this.props = {
            highlightedKeywordBadgeColors: shuffle([
                "bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 text-yellow-800",
                "bg-green-100 dark:bg-green-900 dark:text-green-300 text-green-800",
                "bg-pink-100 dark:bg-pink-900 dark:text-pink-300 text-pink-800",
                "bg-blue-100 dark:bg-blue-900 dark:text-blue-300 text-blue-800",
                "bg-purple-100 dark:bg-purple-900 dark:text-purple-300 text-purple-800",
                "bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 text-indigo-800",
            ]),
        };
        
    }

    handleIncomingMessages(message, sender, sendResponse){

        switch(message.header){
            case "FEED_POSTS_HIDE_STATUS_RESPONSE" :{

                // Acknowledge the message
                sendResponse({
                    status: "ACK"
                });

                for (const htmlElId in message.data){
                    FeedPageScriptAgent.allPostsHideStatus[htmlElId] = message.data[htmlElId];
                    if (FeedPageScriptAgent.allPostsHideStatus[htmlElId]){
                        FeedPageScriptAgent.hidePost(htmlElId);
                    }
                }
                break;
            }

            case "SAVED_PROFILE_OBJECT":{

                // Acknowledge the message
                sendResponse({
                    status: "ACK"
                });
                      
                ProfilePageScriptAgent.profileData = message.data;

                break;

            }

            case "CONTEXT_MENU_ITEM_CLICKED":{

                switch(message.data.menuItemId){
                    case appParams.immersiveModeMenuActionId:{

                        if (isLinkedinFeed(this.pageUrl)){
                            FeedPageScriptAgent.toggleImmersiveMode(FeedPageScriptAgent);
                        }

                        if (isLinkedinProfilePage(this.pageUrl)){
                            ProfilePageScriptAgent.toggleImmersiveMode(ProfilePageScriptAgent);
                        }

                        if (isLinkedinFeedPostPage(this.pageUrl)){
                            FeedPostPageScriptAgent.toggleImmersiveMode(FeedPostPageScriptAgent);
                        }

                        break;
                    }

                    case appParams.saveAsQuoteMenuActionId:{
                        FeedPageScriptAgent.onSaveAsQuoteMenuActionClicked(message.data.args.selectedText, this.props);
                        break;
                    }
                }

                break;
            }
        }

    }

    scrollEventHandler2(){

        this.props = {
            ...this.props,
            tabId: this.tabId, 
            allKeywords: this.allKeywords,
            appSettings: this.appSettings,
            visitId: this.visitId,
            otherArgs: this.otherArgs,
        };
    
        if (isLinkedinFeed(this.pageUrl)){
            FeedPageScriptAgent.scrollEventHandler(this.props);
        }
        else if (isLinkedinProfilePage(this.pageUrl)){
            // if (isLinkedinProfileSectionDetailsPage(this.pageUrl)){
            //     ProfileSectionDetailsPageScriptAgent.scrollEventHandler(this.props);
            // }
            // else{
            //     ProfilePageScriptAgent.scrollEventHandler(this.props);
            // }
        }
        else if (isLinkedinFeedPostPage(this.pageUrl)){
            // FeedPostPageScriptAgent.scrollEventHandler(this.props);
        }

    }

    runTabDataExtractionProcess(){

        this.timerInterval = setInterval(() => {

            this.timerIntervalInc++;
            // console.log("GGGGGGGGGGGGGG I : ", this.timerIntervalInc);

            if (!this.isActiveTab){
                return;
            }

            const pageUrl = window.location.href;
            this.props = {
                ...this.props,
                tabId: this.tabId, 
                allKeywords: this.allKeywords,
                appSettings: this.appSettings,
                visitId: this.visitId,
                otherArgs: this.otherArgs,
                idleStatus: this.idleStatus,
            };

            // console.log("GGGGGGGGGGGGGG II : ", this.pageUrl, pageUrl, isLinkedinFeed(pageUrl));

            if (isLinkedinFeedPostPage(pageUrl)){

                if (this.pageUrl != pageUrl){
                    FeedPageScriptAgent.allExtensionWidgetsSet = false;
                    this.pageUrl = pageUrl;
                }

                FeedPostPageScriptAgent.checkAndUpdateUi(this.props);
                
            }
            else if (isLinkedinFeed(pageUrl)){

                if (this.pageUrl != pageUrl){
                    FeedPageScriptAgent.activePostContainerElementId = null;
                    FeedPageScriptAgent.allExtensionWidgetsSet = false;
                    FeedPageScriptAgent.allPostsHideStatus = {};
                    this.pageUrl = pageUrl;
                }

                FeedPageScriptAgent.checkAndUpdateUi(this.props);
                // FeedPageScriptAgent.runTabDataExtractionProcess(this.props);

            }
            else if (isLinkedinProfilePage(pageUrl)){

                if (isLinkedinProfileSectionDetailsPage(pageUrl)){

                    if (this.pageUrl != pageUrl){
                        ProfileSectionDetailsPageScriptAgent.webPageData = null;
                        ProfileSectionDetailsPageScriptAgent.allExtensionWidgetsSet = false;
                        this.pageUrl = pageUrl;
                    }

                    ProfileSectionDetailsPageScriptAgent.runTabDataExtractionProcess(this.props);

                }
                else{

                    if (this.pageUrl != pageUrl){
                        ProfilePageScriptAgent.webPageData = null;
                        ProfilePageScriptAgent.detectedKeywords = {};
                        ProfilePageScriptAgent.keywordDetected = false;
                        ProfilePageScriptAgent.allExtensionWidgetsSet = false;
                        ProfilePageScriptAgent.profileData = null;
                        this.pageUrl = pageUrl;
                    }

                    ProfilePageScriptAgent.runTabDataExtractionProcess(this.props);

                }

            }
            else{
                if (this.pageUrl != pageUrl){
                    this.pageUrl = pageUrl;
                }
            }

        }, appParams.TIMER_VALUE_2);

    }

}

const mainScriptAgent = new MainScriptAgent();