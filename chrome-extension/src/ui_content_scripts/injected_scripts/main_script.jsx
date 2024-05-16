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
    shuffle,
} from "../../popup/Local_library";
import FeedPageScriptAgent from "./feed_page_script";
import ProfilePageScriptAgent from "./profile_page_script";
import FeedPostPageScriptAgent from "./feed_post_page_script";
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

    updateUi(){

        const props = {
            appSettings: this.appSettings,
            visitId: this.visitId,
            otherArgs: this.otherArgs,
            tabId: this.tabId,
            allKeywords: this.allKeywords,
            highlightedKeywordBadgeColors: this.highlightedKeywordBadgeColors,
        }
        
        if (isLinkedinFeed(this.pageUrl)){
            FeedPageScriptAgent.updateUi(props);
        }
        else if (isLinkedinProfilePage(this.pageUrl)){
            ProfilePageScriptAgent.updateUi(props);
        }
        else if (isLinkedinFeedPostPage(this.pageUrl)){
            FeedPostPageScriptAgent.updateUi(props);
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
            };

            if (isLinkedinFeed(pageUrl)){

                props = {
                    ...props,
                    visitId: this.visitId,
                }

                if (this.pageUrl != pageUrl){
                    FeedPageScriptAgent.updateUi(props);
                    this.pageUrl = pageUrl;
                }

                FeedPageScriptAgent.runTabDataExtractionProcess(props);

            }
            else if (isLinkedinProfilePage(pageUrl)){

                if (this.pageUrl != pageUrl){
                    ProfilePageScriptAgent.webPageData = null;
                    ProfilePageScriptAgent.detectedKeywords = {};
                    ProfilePageScriptAgent.updateUi(props);
                    this.pageUrl = pageUrl;
                }

                ProfilePageScriptAgent.runTabDataExtractionProcess(props);

            }

        }, ScriptAgentBase.EXTRACTION_PROCESS_INTERVAL_TIME);

    }

}

const mainScriptAgent = new MainScriptAgent();