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
import FeedbackView from "./popup/FeedbackView";
import LicenseCreditsView from "./popup/LicenseCredits";
import ErrorPageView from "./popup/ErrorPageView";
import ChartExpansionView from "./popup/ChartExpansionView";
import FeedDashView from "./popup/FeedDashView";
import moment from 'moment';
import 'moment/dist/locale/fr';
import 'moment/dist/locale/en-gb';
// import { v4 as uuidv4 } from 'uuid';
import Dexie from 'dexie';
import { db } from "./db";
import { 
  appParams,
  getTodayReminders,
} from "./popup/Local_library";
// import { genPassword } from "./.private_library";
import eventBus from "./popup/EventBus";

export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      // uuid: uuidv4(),
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
        // Resetting the today reminder list here too
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


  }

  componentWillUnmount() {
    
    eventBus.remove(eventBus.SWITCH_TO_VIEW);
    eventBus.remove(eventBus.SET_APP_GLOBAL_DATA);

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

        {/*Feedback Page*/}
        { this.state.currentPageTitle == "Feedback" && <FeedbackView globalData={this.state.globalData} />}

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
