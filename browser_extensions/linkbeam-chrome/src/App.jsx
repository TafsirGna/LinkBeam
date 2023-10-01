import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import About from "./react_components/About";
import Activity from "./react_components/Activity";
import Settings from "./react_components/Settings";
import Statistics from "./react_components/Statistics";
import Keywords from "./react_components/Keywords";
import Profile from "./react_components/Profile";
import MyAccount from "./react_components/MyAccount";
import Reminders from "./react_components/Reminders";
import Feed from "./react_components/Feed";
import NewsFeed from "./react_components/NewsFeed";
import Calendar from "./react_components/Calendar";
import Feedback from "./react_components/Feedback";
import { env } from "../.env.js";
/*import 'bootstrap/dist/css/bootstrap.min.css';*/
import { 
  sendDatabaseActionMessage,
  ack,
  startMessageListener, 
  messageParams,
  dbData,
  appParams,
  logInParseUser,
} from "./react_components/Local_library";
import Parse from 'parse/dist/parse.min.js';

// Parse initialization configuration goes here
Parse.initialize(env.PARSE_APPLICATION_ID, env.PARSE_JAVASCRIPT_KEY);
Parse.serverURL = appParams.PARSE_HOST_URL;

export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profileUrlValue: null,
      calendarView: null,
      globalData: {
        keywordList: null,
        bookmarkList: null,
        reminderList: null,
        searchList: null,
        settings: {},
        currentTabWebPageData: null,
        currentParseUser: null,
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

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const profileUrlValue = urlParams.get("profile-url");
    const calendarView = urlParams.get("calendar-view");

    this.setState({profileUrlValue: profileUrlValue});
    this.setState({calendarView: calendarView});

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["productID"]);

  }

  onSearchesDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var context = message.data.objectData.context;    
    if (context == "Activity"){
      var listData = message.data.objectData.list;
      this.setSearchList(listData);
    }

  }

  onBookmarksDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // Setting the search list here too
    this.setState(prevState => {
      let globalData = Object.assign({}, prevState.globalData);
      globalData.bookmarkList = message.data.objectData;
      return { globalData };
    });

  }

  onKeywordsDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // Setting the search list here too
    this.setState(prevState => {
      let globalData = Object.assign({}, prevState.globalData);
      globalData.keywordList = message.data.objectData;
      return { globalData };
    });

  }

  onRemindersDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // Setting the search list here too
    this.setState(prevState => {
      let globalData = Object.assign({}, prevState.globalData);
      globalData.reminderList = message.data.objectData;
      return { globalData };
    });

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

        // log in to the parse
        logInParseUser(
          Parse,
          productID,
          productID,
          (currentParseUser) => {
            this.setState({currentParseUser: currentParseUser});
          }
        );

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
    ]);

  }

  setSearchList(listData){

    if (this.state.globalData.searchList == null){
      this.setState(prevState => {
        let globalData = Object.assign({}, prevState.globalData);
        globalData.searchList = [];
        return { globalData };
      }, () => {
        this.setSearchList(listData);
      });
      return;
    }

    listData = this.state.globalData.searchList.concat(listData);
    this.setState(prevState => {
      let globalData = Object.assign({}, prevState.globalData);
      globalData.searchList = listData;
      return { globalData };
    });

  }

  render(){

    return(
      <>
        <BrowserRouter>
          <Routes>
            <Route path="/index.html" element={
              this.state.profileUrlValue ? 
                <Navigate replace to={"/index.html/Profile?profile-url=" + this.state.profileUrlValue} />
                : this.state.calendarView ?
                    <Navigate replace to={"/index.html/Calendar"} />
                    : <Activity globalData={this.state.globalData} />
            }/>
            <Route path="/index.html/About" element={<About />} />
            <Route path="/index.html/Settings" element={<Settings globalData={this.state.globalData} />} />
            <Route path="/index.html/Statistics" element={<Statistics globalData={this.state.globalData}/>} />
            <Route path="/index.html/Keywords" element={<Keywords globalData={this.state.globalData} />} />
            <Route path="/index.html/MyAccount" element={<MyAccount globalData={this.state.globalData} />} />
            <Route path="/index.html/Profile" element={<Profile />} />
            <Route path="/index.html/Reminders" element={<Reminders globalData={this.state.globalData} />} />
            <Route path="/index.html/Feed" element={<Feed globalData={this.state.globalData} />} />
            <Route path="/index.html/Feedback" element={<Feedback globalData={this.state.globalData} currentParseUser={this.state.currentParseUser} handleParseUserLoggedIn={(currentParseUser) => { this.setState({currentParseUser: currentParseUser}); }} />} />
            <Route path="/index.html/Calendar" element={<Calendar globalData={this.state.globalData} />} />
            {/*<Route path="*" element={<NoPage />} />*/}
          </Routes>
        </BrowserRouter>

      </>
    );
  }

}
