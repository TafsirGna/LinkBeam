import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AboutView from "./popup/AboutView";
import HomeView from "./popup/HomeView";
import SettingsView from "./popup/SettingsView";
import StatisticsView from "./popup/StatisticsView";
import KeywordView from "./popup/KeywordView";
import MainProfileView from "./popup/MainProfileView";
import MyAccount from "./popup/MyAccount";
import ReminderView from "./popup/ReminderView";
import BookmarkView from "./popup/BookmarkView";
import Feed from "./popup/Feed";
import NewsFeed from "./popup/NewsFeed";
import CalendarView from "./popup/CalendarView";
import FeedbackView from "./popup/FeedbackView";
import LicenseCreditsView from "./popup/LicenseCredits";
import ErrorPageView from "./popup/ErrorPageView";
import { 
  sendDatabaseActionMessage,
  ack,
  startMessageListener, 
  messageParams,
  dbData,
  appParams,
} from "./popup/Local_library";
import { genPassword } from "./.private_library";
import eventBus from "./popup/EventBus";

export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      redirect_to: null,
      swDbStatus: null,
      globalData: {
        keywordList: null,
        bookmarkList: null,
        reminderList: null,
        todayReminderList: null,
        allSearchList: null,
        todaySearchList: null,
        settings: {},
        currentTabWebPageData: null,
      }
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onRemindersDataReceived = this.onRemindersDataReceived.bind(this);
    this.onSearchesDataReceived = this.onSearchesDataReceived.bind(this);
    this.onKeywordsDataReceived = this.onKeywordsDataReceived.bind(this);
    this.onSettingsDataReceived = this.onSettingsDataReceived.bind(this);
    this.onBookmarksDataReceived = this.onBookmarksDataReceived.bind(this);
    this.onSwResponseReceived = this.onSwResponseReceived.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();

    eventBus.on(eventBus.RESET_TODAY_REMINDER_LIST, (data) =>
      {
        // Resetting the today reminder list here too
        this.setState(prevState => {
          let globalData = Object.assign({}, prevState.globalData);
          globalData.todayReminderList = null;
          return { globalData };
        });
      }
    );

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("redirect_to") != null){
      var redirect_to = {view: urlParams.get("redirect_to"), data: urlParams.get("data")};
      this.setState({redirect_to: redirect_to});
    }

    // Sending a request for getting some settings
    // sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["productID"]);

    // Sending a request to know if some reminders are set for today
    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.REMINDERS, {context: "Notifications"});

  }

  componentWillUnmount() {

    eventBus.remove(eventBus.RESET_TODAY_REMINDER_LIST);

  }

  onProcessingErrorReport(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);
    
    alert("Something went wrong when performing this operation!. Try again later." );

  }

  onSearchesDataReceived(message, sendResponse){

    var context = message.data.objectData.context; 
    if (context.indexOf(appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY) == -1){
      return;
    }

    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    var listData = message.data.objectData.list,
        scope = context.split("-")[1];

    this.setSearchList(listData, scope);

  }

  onBookmarksDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var bookmarkList = message.data.objectData;

    // Setting the search list here too
    this.setState(prevState => {
      let globalData = Object.assign({}, prevState.globalData);
      globalData.bookmarkList = bookmarkList;
      return { globalData };
    });

  }

  onKeywordsDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var keywordList = message.data.objectData;

    // Setting the search list here too
    this.setState(prevState => {
      let globalData = Object.assign({}, prevState.globalData);
      globalData.keywordList = keywordList;
      return { globalData };
    });

  }

  onRemindersDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var context = message.data.objectData.context,
        reminderList = message.data.objectData.list;

    if (context == appParams.COMPONENT_CONTEXT_NAMES.REMINDERS){

      // Setting the reminder list here too
      this.setState(prevState => {
        let globalData = Object.assign({}, prevState.globalData);
        globalData.reminderList = reminderList;
        return { globalData };
      }); 

    }
    else if (context == "Notifications"){

      // Setting the reminder list here too
      this.setState(prevState => {
        let globalData = Object.assign({}, prevState.globalData);
        globalData.todayReminderList = reminderList;
        return { globalData };
      }); 

    }

  }

  onSettingsDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    switch(message.data.objectData.property){
      case "lastDataResetDate":{
        
        this.setState(prevState => {
          let globalData = Object.assign({}, prevState.globalData);
          globalData.settings.lastDataResetDate = message.data.objectData.value;
          return { globalData };
        });
        break;

      }

      case "productID":{

        var productID = message.data.objectData.value;
        this.setState(prevState => {
          let globalData = Object.assign({}, prevState.globalData);
          globalData.settings.productID = productID;
          return { globalData };
        });

        break;

      }

      case "notifications":{
        
        var notificationSetting = message.data.objectData.value;

        this.setState(prevState => {
          let globalData = Object.assign({}, prevState.globalData);
          globalData.settings.notifications = notificationSetting;
          return { globalData };
        });

        if (notificationSetting){
          this.setState(prevState => {
            let globalData = Object.assign({}, prevState.globalData);
            globalData.currentTabWebPageData = null;
            return { globalData };
          });
        }

        break;

      }
    }

  }

  onSwResponseReceived(message, sendResponse){
    
    // acknowledge receipt
    ack(sendResponse);

    if (message.data.objectStoreName == messageParams.contentMetaData.SW_DB_NOT_CREATED_YET){
      var alertMessage = "Database not created yet!";
      console.log(alertMessage);
      // alert(alertMessage);
      this.setState({swDbStatus: messageParams.contentMetaData.SW_DB_NOT_CREATED_YET});
      return;
    }

    // setting the new value
    let currentTabWebPageData = message.data.objectData;
    this.setState(prevState => {
      let globalData = Object.assign({}, prevState.globalData);
      globalData.currentTabWebPageData = currentTabWebPageData;
      return { globalData };
    });

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.SEARCHES].join(messageParams.separator), 
        callback: this.onSearchesDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.BOOKMARKS].join(messageParams.separator), 
        callback: this.onBookmarksDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.KEYWORDS].join(messageParams.separator), 
        callback: this.onKeywordsDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.REMINDERS].join(messageParams.separator), 
        callback: this.onRemindersDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.SETTINGS].join(messageParams.separator), 
        callback: this.onSettingsDataReceived
      },
      {
        param: [messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_WEB_PAGE_CHECKED].join(messageParams.separator), 
        callback: this.onSwResponseReceived
      },
      {
        param: [messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_PROCESS_FAILED].join(messageParams.separator), 
        callback: this.onProcessingErrorReport
      },
      {
        param: [messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_DB_NOT_CREATED_YET].join(messageParams.separator), 
        callback: this.onSwResponseReceived
      },
    ]);

  }

  setSearchList(listData, scope){

    if (scope == "all"){

      if (this.state.globalData.allSearchList){
        listData = this.state.globalData.allSearchList.concat(listData);
      }

      this.setState(prevState => {
        let globalData = Object.assign({}, prevState.globalData);
        globalData.allSearchList = listData;
        return { globalData };
      });

    }
    else{ // today

      this.setState(prevState => {
        let globalData = Object.assign({}, prevState.globalData);
        globalData.todaySearchList = listData;
        return { globalData };
      }, () => {
        this.setSearchList(listData, "all");
      });

    }

  }

  render(){

    return(
      <>
        <BrowserRouter>
          <Routes>
            <Route path="/index.html" element={
              this.state.swDbStatus == messageParams.contentMetaData.SW_DB_NOT_CREATED_YET ?
                <Navigate replace to={"/index.html/Error?data="+this.state.swDbStatus} />
                : this.state.redirect_to && this.state.redirect_to.view == "ProfileView" ? 
                  <Navigate replace to={"/index.html/Profile?url=" + this.state.redirect_to.data} />
                  : this.state.redirect_to && this.state.redirect_to.view == "CalendarView" ?
                      <Navigate replace to={"/index.html/Calendar"} />
                      : <HomeView globalData={this.state.globalData} />
            }/>
            <Route path="/index.html/About" element={<AboutView />} />
            <Route path="/index.html/Settings" element={<SettingsView globalData={this.state.globalData} />} />
            <Route path="/index.html/Statistics" element={<StatisticsView globalData={this.state.globalData}/>} />
            <Route path="/index.html/Keywords" element={<KeywordView globalData={this.state.globalData} />} />
            <Route path="/index.html/MyAccount" element={<MyAccount globalData={this.state.globalData} />} />
            <Route path="/index.html/Profile" element={<MainProfileView globalData={this.state.globalData} />} />
            <Route path="/index.html/Reminders" element={<ReminderView globalData={this.state.globalData} />} />
            <Route path="/index.html/Feed" element={<Feed globalData={this.state.globalData} />} />
            <Route path="/index.html/Bookmarks" element={<BookmarkView globalData={this.state.globalData} />} />
            <Route path="/index.html/Feedback" element={<FeedbackView globalData={this.state.globalData} />} />
            <Route path="/index.html/Calendar" element={<CalendarView globalData={this.state.globalData} />} />
            <Route path="/index.html/LicenseCredits" element={<LicenseCreditsView globalData={this.state.globalData} />} />
            <Route path="/index.html/Error" element={<ErrorPageView />} />
          </Routes>
        </BrowserRouter>

      </>
    );
  }

}