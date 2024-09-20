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

import React from 'react';
import './App.css';
import AboutView from "./popup/AboutView";
import HomeView from "./popup/HomeView";
import SettingsView from "./popup/SettingsViews/SettingsView";
import ObjectsSettingsView from "./popup/SettingsViews/ObjectsSettingsView";
import FeedSettingsView from "./popup/SettingsViews/FeedSettingsView";
import VisualsSettingsView from "./popup/SettingsViews/VisualsSettingsView";
import AiSettingsView from "./popup/SettingsViews/AiSettingsView";
import TagSettingsView from "./popup/SettingsViews/TagSettingsView";
import StatisticsView from "./popup/StatisticsView";
import ModelsTrainingView from "./popup/ModelsTrainingView";
import ProfileStudiosView from "./popup/ProfileStudiosView";
import KeywordView from "./popup/KeywordView";
import PostsWithSameImageView from "./popup/PostsWithSameImageView";
import MainProfileView from "./popup/MainProfileView";
import MyAccount from "./popup/MyAccount";
import ReminderView from "./popup/ReminderView";
import MediaView from "./popup/MediaView";
import BookmarkView from "./popup/BookmarkView";
import CalendarView from "./popup/CalendarView";
import SavedQuotesView from "./popup/SavedQuotesView";
import FoldersSettingsView from "./popup/SettingsViews/FoldersSettingsView";
import FeedVisitDataView from "./popup/FeedVisitDataView";
import DataSettingsView from "./popup/SettingsViews/DataSettingsView";
import FoldersView from "./popup/FoldersView";
import LicenseCreditsView from "./popup/LicenseCredits";
import ErrorPageView from "./popup/ErrorPageView";
import ChartExpansionView from "./popup/ChartExpansionView";
import FeedDashView from "./popup/FeedDashView";
import Dexie from 'dexie';
import { liveQuery } from "dexie";
import { db } from "./db";
import { 
  appParams,
  getTodayReminders,
  applyFontFamilySetting,
  setGlobalDataSettings,
  checkForDbIncoherences,
} from "./popup/Local_library";
import eventBus from "./popup/EventBus";

const subscriptionProperties = ["settings", "keywordList", "profileStudios", "folderList", "tagList"];

export default class App extends React.Component{

    constructor(props){
        super(props);
        this.state = {
          missingDatabase: null,
          currentPageTitle: null,
          globalData: {
            keywordList: null,
            folderList: null,
            tagList: null,
            bookmarkList: null,
            reminderList: null,
            todayReminderList: null,
            homeAllVisitsList: null,
            homeTodayVisitsList: null,
            settings: null,
            profileStudios: null,
          }
        };

    }

    componentDidMount() {

        Dexie.exists(appParams.appDbName).then((async function (exists) {
            if (!exists) {
              // on install, open a web page for information
              this.setState({missingDatabase: true});
              return;
            }

            this.listenToBusEvents();

            // checks for database incoherences
            // checkForDbIncoherences(db);

            getTodayReminders(db, reminders => {
                this.setState({globalData: {...this.state.globalData, todayReminderList: reminders}});
            });

            setGlobalDataSettings(db, eventBus, liveQuery);

            // Getting the window url params
            const urlParams = new URLSearchParams(window.location.search);
            const currentPageTitle = urlParams.get("view")
                                      || (await chrome.storage.local.get(["currentPageTitle"])).currentPageTitle 
                                      || appParams.COMPONENT_CONTEXT_NAMES.HOME;

            this.setState({currentPageTitle: currentPageTitle});

        }).bind(this));

    }

    componentDidUpdate(prevProps, prevState){
        if (this.state.globalData != prevState.globalData){
            if (this.state.globalData.settings != prevState.globalData.settings){
                console.log("aaaaaaaaaaaaa : ", prevState.globalData.settings, this.state.globalData.settings);
                if (!prevState.globalData.settings
                        || (prevState.globalData.settings && this.state.globalData.settings.fontFamily != prevState.globalData.settings.fontFamily)){
                    applyFontFamilySetting(this.state.globalData.settings);
                }
            }
        }
    }

    listenToBusEvents(){

        eventBus.on(eventBus.SET_APP_GLOBAL_DATA, (data) => {

            this.setState(prevState => {
              let globalData = Object.assign({}, prevState.globalData);
              globalData[data.property] = data.value;
              return { globalData };
            });
            
          }
        );

        eventBus.on(eventBus.SWITCH_TO_VIEW, (data) => {
            
            this.setState({currentPageTitle: data.pageTitle});

          }
        );

        eventBus.on(eventBus.SET_APP_SUBSCRIPTION, (data) => {

            this[`${data.property}Subscription`] = data.value.subscribe(
                result => this.setState(prevState => {
                                          let globalData = Object.assign({}, prevState.globalData);
                                          globalData[data.property] = result;
                                          return { globalData };
                                        }),
                error => this.setState({error})
            );

        });

    }

    componentWillUnmount() {
    
        // removing event listeners
        eventBus.remove(eventBus.SWITCH_TO_VIEW);
        eventBus.remove(eventBus.SET_APP_GLOBAL_DATA);

        //disabling subscriptions
        subscriptionProperties.forEach(subscriptionProperty => {
            if (this[`${subscriptionProperty}Subscription`]) {
              this[`${subscriptionProperty}Subscription`].unsubscribe();
              this[`${subscriptionProperty}Subscription`] = null;
            }
        });

    }

    render(){

        return(
          <>

            {/*Error Page */}
            { this.state.missingDatabase == true && <ErrorPageView data="missingDb" />}

            {/*Index Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.HOME 
                && <HomeView globalData={this.state.globalData} /> }

            {/*About Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.ABOUT 
                && <AboutView /> }

            {/*Settings Page */}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.SETTINGS 
                && <SettingsView globalData={this.state.globalData} /> }

            {/*FeedDash Page */}
            { this.state.currentPageTitle == "FeedDash" 
                && <FeedDashView globalData={this.state.globalData} /> }

            {/*Statistics Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.STATISTICS 
                && <StatisticsView globalData={this.state.globalData}/>}

            {/*Keywords Page */}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.KEYWORDS 
                && <KeywordView globalData={this.state.globalData} />}

            {/*Tags Page */}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.TAGS
                && <TagSettingsView globalData={this.state.globalData} />}

            {/*Folders Settings Page */}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.FOLDERS_SETTINGS
                && <FoldersSettingsView globalData={this.state.globalData} />}

            {/*Folders Page */}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.FOLDERS 
                && <FoldersView globalData={this.state.globalData} />}

            {/*MyAccount Page */}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.MY_ACCOUNT 
                && <MyAccount globalData={this.state.globalData} />}

            {/*Profile Page */}
            { this.state.currentPageTitle == "Profile" 
                && <MainProfileView globalData={this.state.globalData} />}

            {/*Reminders Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.REMINDERS 
                && <ReminderView globalData={this.state.globalData} />}

            {/*Bookmarks Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.BOOKMARKS 
                && <BookmarkView globalData={this.state.globalData} />}

            {/*Calendar Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.CALENDAR 
                && <CalendarView globalData={this.state.globalData} />}

            {/*LicenseCredits Page */}
            { this.state.currentPageTitle == "LicenseCredits" 
                && <LicenseCreditsView globalData={this.state.globalData} />}

            {/*ChartExpansion Page*/}
            { this.state.currentPageTitle == "ChartExpansion" 
                && <ChartExpansionView globalData={this.state.globalData} />}

            {/*Media Page*/}
            { this.state.currentPageTitle == "Media" 
                && <MediaView globalData={this.state.globalData} />}

            {/*Object settings Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.OBJECTS_SETTINGS 
                && <ObjectsSettingsView globalData={this.state.globalData} />}

            {/*Feed settings Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.FEED_SETTINGS 
                && <FeedSettingsView globalData={this.state.globalData} />}

            {/*Data settings Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.DATA_SETTINGS 
                && <DataSettingsView globalData={this.state.globalData} />}

            {/*Visuals settings Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.VISUALS_SETTINGS 
                && <VisualsSettingsView globalData={this.state.globalData} />}

            {/*Feed visit Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.FEED_VISIT.replaceAll(" ", "")
                && <FeedVisitDataView globalData={this.state.globalData} />}

            {/*AI Settings Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.AI_SETTINGS
                && <AiSettingsView globalData={this.state.globalData} />}

            {/*Saved quotes Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.SAVED_QUOTES.replaceAll(" ", "_")
                && <SavedQuotesView globalData={this.state.globalData} />}

            {/*Saved quotes Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.PROFILE_STUDIOS.replaceAll(" ", "_")
                && <ProfileStudiosView globalData={this.state.globalData} />}

            {/*Saved quotes Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.POSTS_WITH_SAME_IMAGE.replaceAll(" ", "_")
                && <PostsWithSameImageView globalData={this.state.globalData} />}

            {/*Models training Page*/}
            { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.MODELS_TRAINING.replaceAll(" ", "_")
                && <ModelsTrainingView globalData={this.state.globalData} />}

          </>
        );
    }

}
