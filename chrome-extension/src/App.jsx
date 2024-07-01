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
import SettingsView from "./popup/SettingsView";
import ObjectsSettingsView from "./popup/ObjectsSettingsView";
import FeedSettingsView from "./popup/FeedSettingsView";
import StatisticsView from "./popup/StatisticsView";
import KeywordView from "./popup/KeywordView";
import MainProfileView from "./popup/MainProfileView";
import MyAccount from "./popup/MyAccount";
import ReminderView from "./popup/ReminderView";
import MediaView from "./popup/MediaView";
import BookmarkView from "./popup/BookmarkView";
import CalendarView from "./popup/CalendarView";
import TagView from "./popup/TagView";
import FoldersSettingsView from "./popup/FoldersSettingsView";
import FolderView from "./popup/FolderView";
import LicenseCreditsView from "./popup/LicenseCredits";
import ErrorPageView from "./popup/ErrorPageView";
import ChartExpansionView from "./popup/ChartExpansionView";
import FeedDashView from "./popup/FeedDashView";
import Dexie from 'dexie';
import { db } from "./db";
import { 
  appParams,
  getTodayReminders,
} from "./popup/Local_library";
import eventBus from "./popup/EventBus";

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
      }
    };

  }

  componentDidMount() {

    this.listenToBusEvents();

    Dexie.exists(appParams.appDbName).then((function (exists) {
      if (!exists) {
          // on install, open a web page for information
          this.setState({missingDatabase: true});
          return;
      }

      getTodayReminders(db, reminders => {

        this.setState(prevState => {
          let globalData = Object.assign({}, prevState.globalData);
          globalData.todayReminderList = reminders;
          return { globalData };
        });
        
      });

      // Getting the window url params
      const urlParams = new URLSearchParams(window.location.search);
      var currentPageTitle = urlParams.get("view");

      if (!currentPageTitle){
        currentPageTitle = localStorage.getItem('currentPageTitle');
        currentPageTitle = currentPageTitle ? currentPageTitle : appParams.COMPONENT_CONTEXT_NAMES.HOME;
      }

      this.setState({currentPageTitle: currentPageTitle});

    }).bind(this));

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

      const subscription = data.value;

      switch(data.property){

        case "settings":{
          this.settingsSubscription = subscription.subscribe(
            result => this.setState(prevState => {
                                      let globalData = Object.assign({}, prevState.globalData);
                                      globalData[data.property] = result;
                                      return { globalData };
                                    }),
            error => this.setState({error})
          );
          break;
        }

        case "keywordList":{
          this.keywordsSubscription = subscription.subscribe(
            result => this.setState(prevState => {
                                      let globalData = Object.assign({}, prevState.globalData);
                                      globalData[data.property] = result;
                                      return { globalData };
                                    }),
            error => this.setState({error})
          );
          break;
        }

        case "folderList":{
          this.foldersSubscription = subscription.subscribe(
            result => this.setState(prevState => {
                                      let globalData = Object.assign({}, prevState.globalData);
                                      globalData[data.property] = result;
                                      return { globalData };
                                    }),
            error => this.setState({error})
          );
          break;
        }

        case "tagList":{
          this.tagsSubscription = subscription.subscribe(
            result => this.setState(prevState => {
                                      let globalData = Object.assign({}, prevState.globalData);
                                      globalData[data.property] = result;
                                      return { globalData };
                                    }),
            error => this.setState({error})
          );
          break;
        }

      }

    })


  }

  componentWillUnmount() {
    
    // removing event listeners
    eventBus.remove(eventBus.SWITCH_TO_VIEW);
    eventBus.remove(eventBus.SET_APP_GLOBAL_DATA);

    //disabling subscriptions
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
      this.settingsSubscription = null;
    }

    if (this.keywordsSubscription) {
      this.keywordsSubscription.unsubscribe();
      this.keywordsSubscription = null;
    }

    if (this.tagsSubscription) {
      this.tagsSubscription.unsubscribe();
      this.tagsSubscription = null;
    }

    if (this.foldersSubscription) {
      this.foldersSubscription.unsubscribe();
      this.foldersSubscription = null;
    }

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
            && <TagView globalData={this.state.globalData} />}

        {/*Folders Settings Page */}
        { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.FOLDERS_SETTINGS
            && <FoldersSettingsView globalData={this.state.globalData} />}

        {/*Folders Page */}
        { this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.FOLDERS 
            && <FolderView globalData={this.state.globalData} />}

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

      </>
    );
  }

}
