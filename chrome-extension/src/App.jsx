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
  groupVisitsByProfile,
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
        allVisits: null,
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
      }
      else{

        // Getting the window url params
        const urlParams = new URLSearchParams(window.location.search);
        var currentPageTitle = urlParams.get("view");

        if (!currentPageTitle){
          currentPageTitle = localStorage.getItem('currentPageTitle');
        }

        this.setState({currentPageTitle: currentPageTitle});
        
      }
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

    eventBus.on(eventBus.RESET_TODAY_REMINDER_LIST, (data) => {
        // Resetting the today reminder list here too
        this.setState(prevState => {
          let globalData = Object.assign({}, prevState.globalData);
          globalData.todayReminderList = null;
          return { globalData };
        });
      }
    );

    eventBus.on(eventBus.EMPTY_SEARCH_TEXT_VISIT, (data) => {
        // Resetting the today reminder list here too
        if (this.state.globalData.allVisits.scope == "search"){

          this.setState(prevState => {
            let globalData = Object.assign({}, prevState.globalData);
            globalData.allVisits = this.state.tmps.visitList;
            return { globalData };
          }, () => {
            this.setState(prevState => {
              let tmps = Object.assign({}, prevState.tmps);
              tmps.visitList = null;
              return { tmps };
            });
          });

        }
      }
    );

    eventBus.on(eventBus.EMPTY_SEARCH_TEXT_REMINDER, (data) => {
        
        if (this.state.globalData.reminderList.scope == "search"){

          this.setState(prevState => {
            let globalData = Object.assign({}, prevState.globalData);
            globalData.reminderList = this.state.tmps.reminderList;
            return { globalData };
          }, () => {
            this.setState(prevState => {
              let tmps = Object.assign({}, prevState.tmps);
              tmps.reminderList = null;
              return { tmps };
            });
          });

        }
      }
    );

    eventBus.on(eventBus.ALL_VISITS_TAB_CLICKED, (data) => {
        
        if (this.state.globalData.homeTodayVisitsList.length != 0){
          this.setVisitList(this.state.globalData.homeTodayVisitsList, "all");
        }
        else{
          eventBus.dispatch(eventBus.GET_ALL_VISITS, null);
        }

      }
    );

    eventBus.on(eventBus.SWITCH_TO_VIEW, (data) => {
        
        this.setState({currentPageTitle: data.pageTitle});

      }
    );


  }

  componentWillUnmount() {

    eventBus.remove(eventBus.RESET_TODAY_REMINDER_LIST);
    eventBus.remove(eventBus.EMPTY_SEARCH_TEXT_VISIT);
    eventBus.remove(eventBus.EMPTY_SEARCH_TEXT_REMINDER);
    eventBus.remove(eventBus.ALL_VISITS_TAB_CLICKED);
    eventBus.remove(eventBus.SWITCH_TO_VIEW);
    eventBus.remove(eventBus.SET_APP_GLOBAL_DATA);

  }

  // onProfilesDataReceived(message, sendResponse){

  //   var context = message.data.objectData.context; 
  //   if (context.indexOf(appParams.COMPONENT_CONTEXT_NAMES.HOME) == -1){
  //     return;
  //   }

  //   // acknowledge receipt
  //   ack(sendResponse);

  //   // setting the new value
  //   var listData = message.data.objectData.list,
  //       scope = context.split("-")[1];

  //   this.setVisitList(listData, scope);

  // }

  // onKeywordsDataReceived(message, sendResponse){

  //   // acknowledge receipt
  //   ack(sendResponse);

  //   var keywordList = null;
  //   if (Object.hasOwn(message.data.objectData, "list")){
  //     keywordList = message.data.objectData.list;
  //   }
  //   else if (Object.hasOwn(message.data.objectData, "object")){
  //     keywordList = this.state.globalData.keywordList;
  //     var keywordObject = message.data.objectData.object;
  //     keywordList.push(keywordObject);
  //   }

  //   // Setting the visit list here too
  //   this.setState(prevState => {
  //     let globalData = Object.assign({}, prevState.globalData);
  //     globalData.keywordList = keywordList;
  //     return { globalData };
  //   });

  // }

  // onRemindersDataReceived(message, sendResponse){

  //   // acknowledge receipt
  //   ack(sendResponse);

  //   var context = message.data.objectData.context,
  //       reminderList = {
  //         list: message.data.objectData.list,
  //       };

  //   if (context.indexOf(appParams.COMPONENT_CONTEXT_NAMES.REMINDERS) != -1 ){

  //     if (context.indexOf("search") != -1){
  //       reminderList.scope = "search";
  //     }
  //     else{
  //       reminderList.scope = "all";
  //     }

  //     var tmp = { ...this.state.globalData.reminderList };

  //     this.setState(prevState => {
  //       let globalData = Object.assign({}, prevState.globalData);
  //       globalData.reminderList = reminderList;
  //       return { globalData };
  //     }, () => {
  //       if (!this.state.tmps.reminderList || (this.state.tmps.reminderList && tmp.scope == "all")){
  //         this.setState(prevState => {
  //           let tmps = Object.assign({}, prevState.tmps);
  //           tmps.reminderList = tmp;
  //           return { tmps };
  //         });
  //       }
  //     });

  //   }
  //   else if (context == "App"){

  //     // Setting the reminder list here too
  //     this.setState(prevState => {
  //       let globalData = Object.assign({}, prevState.globalData);
  //       globalData.todayReminderList = reminderList.list;
  //       return { globalData };
  //     }); 

  //   }

  // }

  setVisitList(listData, scope){

    if (scope == "all"){

      listData = groupVisitsByProfile(listData);

      if (this.state.globalData.allVisits){
        listData = {
          list: this.state.globalData.allVisits.list.concat(listData.list),
          visitCount: this.state.globalData.allVisits.visitCount + listData.visitCount,
        };
      }

      listData.scope = scope;
      this.setState(prevState => {
        let globalData = Object.assign({}, prevState.globalData);
        globalData.allVisits = listData;
        return { globalData };
      });

    }
    else if (scope == "today"){ // today

      this.setState(prevState => {
        let globalData = Object.assign({}, prevState.globalData);
        globalData.homeTodayVisitsList = listData;
        return { globalData };
      }/*, () => {
        this.setVisitList(listData, "all");
      }*/);

    }
    else if (scope == "search"){

      listData = groupVisitsByProfile(listData);

      // var tmp = (this.state.globalData.allVisits.scope == "all") ? this.state.globalData.allVisits : null;
      var tmp = { ...this.state.globalData.allVisits };
      this.setState(prevState => {
        let globalData = Object.assign({}, prevState.globalData);
        globalData.allVisits = listData;
        globalData.allVisits.scope = "search";
        return { globalData };
      }, () => {
        if (!this.state.tmps.visitList || (this.state.tmps.visitList && tmp.scope == "all")){
          this.setState(prevState => {
            let tmps = Object.assign({}, prevState.tmps);
            tmps.visitList = tmp;
            return { tmps };
          });
        }
      });
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
