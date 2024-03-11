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
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AboutView from "./popup/AboutView";
import HomeView from "./popup/HomeView";
import SettingsView from "./popup/SettingsView";
import StatisticsView from "./popup/StatisticsView";
import KeywordView from "./popup/KeywordView";
import MainProfileView from "./popup/MainProfileView";
import MyAccount from "./popup/MyAccount";
import ReminderView from "./popup/ReminderView";
import BookmarkView from "./popup/BookmarkView";
import ProfileActivityView from "./popup/ProfileActivityView";
import CalendarView from "./popup/CalendarView";
import LicenseCreditsView from "./popup/LicenseCredits";
import ErrorPageView from "./popup/ErrorPageView";
import ChartExpansionView from "./popup/ChartExpansionView";
import FeedDashView from "./popup/FeedDashView";
import moment from 'moment';
import 'moment/dist/locale/fr';
import 'moment/dist/locale/en-gb';
import Dexie from 'dexie';
import { db } from "./db";
import { 
  appParams,
  getTodayReminders,
} from "./popup/Local_library";
// import { genPassword } from "./.private_library";
import eventBus from "./popup/EventBus";
import { liveQuery } from "dexie"; 

export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      missingDatabase: null,
      currentPageTitle: null,
      tmps: {
        visitsList: null,
        reminderList: null,
      },
      globalData: {
        keywordList: null,
        bookmarkList: null,
        reminderList: null,
        todayReminderList: null,
        homeAllVisitsList: null,
        homeTodayVisitsList: null,
        settings: null,
        currentTabWebPageData: null,
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

      getTodayReminders(db, (reminders) => {

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

  }

  render(){

    return(
      <>

        {/*Error Page */}
        { this.state.missingDatabase == true && <ErrorPageView data="missingDb" />}

        {/*Index Page*/}
        { this.state.currentPageTitle == "Home" && <HomeView globalData={this.state.globalData} /> }

        {/*About Page*/}
        { this.state.currentPageTitle == "About" && <AboutView /> }

        {/*Settings Page */}
        { this.state.currentPageTitle == "Settings" && <SettingsView globalData={this.state.globalData} /> }

        {/*FeedDash Page */}
        { this.state.currentPageTitle == "FeedDash" && <FeedDashView globalData={this.state.globalData} /> }

        {/*Statistics Page*/}
        { this.state.currentPageTitle == "Statistics" && <StatisticsView globalData={this.state.globalData}/>}

        {/*Keywords Page */}
        { this.state.currentPageTitle == "Keywords" && <KeywordView globalData={this.state.globalData} />}

        {/*MyAccount Page */}
        { this.state.currentPageTitle == "MyAccount" && <MyAccount globalData={this.state.globalData} />}

        {/*Profile Page */}
        { this.state.currentPageTitle == "Profile" && <MainProfileView globalData={this.state.globalData} />}

        {/*Reminders Page*/}
        { this.state.currentPageTitle == "Reminders" && <ReminderView globalData={this.state.globalData} />}

        {/*ProfileActivity Page*/}
        { this.state.currentPageTitle == "ProfileActivity" && <ProfileActivityView globalData={this.state.globalData} />}

        {/*Bookmarks Page*/}
        { this.state.currentPageTitle == "Bookmarks" && <BookmarkView globalData={this.state.globalData} />}

        {/*Calendar Page*/}
        { this.state.currentPageTitle == "Calendar" && <CalendarView globalData={this.state.globalData} />}

        {/*LicenseCredits Page */}
        { this.state.currentPageTitle == "LicenseCredits" && <LicenseCreditsView globalData={this.state.globalData} />}

        {/*ChartExpansion Page*/}
        { this.state.currentPageTitle == "ChartExpansion" && <ChartExpansionView globalData={this.state.globalData} />}

      </>
    );
  }

}
