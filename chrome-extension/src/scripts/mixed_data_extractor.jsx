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
import {
    isLinkedinFeed,
    isLinkedinProfilePage,
} from "../popup/Local_library";
import FeedDataExtractor from "./feed_data_extractor";
import ProfileDataExtractor from "./profile_data_extractor";
import eventBus from "../popup/EventBus";


class MixedDataExtractor extends DataExtractorBase {

    constructor(){
        super();
        this.timer = null;

        eventBus.on(eventBus.TIMER_DISPLAY_UPDATED, (data) => {
            FeedDataExtractor.timerDisplay = data.timerDisplay;
          }
        );
    }

    setUpExtensionWidgets(){

        if (isLinkedinFeed(this.pageUrl)){
            FeedDataExtractor.setUpExtensionWidgets();
        }
        else if (isLinkedinProfilePage(this.pageUrl)){
            ProfileDataExtractor.setUpExtensionWidgets();
        }

    }

    runTabDataExtractionProcess(){

        this.timer = setTimeout(() => {

            if (!this.isActiveTab){
                this.runTabDataExtractionProcess();
                return;
            }

            const pageUrl = window.location.href;
            var props = {
                tabId: this.tabId, 
            };

            if (isLinkedinFeed(pageUrl)){

                props = {
                    ...props,
                    allKeywords: this.allKeywords,
                    appSettings: this.appSettings,
                }

                if (this.pageUrl != pageUrl){
                    FeedDataExtractor.setUpExtensionWidgets();
                    this.pageUrl = pageUrl;
                }

                FeedDataExtractor.runTabDataExtractionProcess(props);
                this.runTabDataExtractionProcess();

            }
            else if (isLinkedinProfilePage(pageUrl)){

                props = {
                    ...props,
                    pageUrl: pageUrl,
                }

                if (this.pageUrl != pageUrl){
                    ProfileDataExtractor.webPageData = null;
                    ProfileDataExtractor.setUpExtensionWidgets();
                    this.pageUrl = pageUrl;
                }

                ProfileDataExtractor.runTabDataExtractionProcess(props);
                this.runTabDataExtractionProcess();

            }

        }, DataExtractorBase.EXTRACTION_PROCESS_INTERVAL_TIME);

    }

}

const mixedDataExtractor = new MixedDataExtractor();
