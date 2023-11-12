import React from 'react';
import './App.css';
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
import LicenseCreditsView from "./react_components/LicenseCredits";
import ErrorPageView from "./react_components/ErrorPageView";
/*import 'bootstrap/dist/css/bootstrap.min.css';*/
import { 
  sendDatabaseActionMessage,
  ack,
  startMessageListener, 
  messageParams,
  dbData,
  appParams,
} from "./react_components/Local_library";
import { genPassword } from "./.private_library";

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

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("redirect_to") != null){
      var redirect_to = {view: urlParams.get("redirect_to"), data: urlParams.get("data")};
      this.setState({redirect_to: redirect_to});
    }

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["productID"]);

  }

  onSearchesDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var context = message.data.objectData.context;    
    if (context.indexOf(appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY) >= 0){
      var listData = message.data.objectData.list,
          scope = context.split("-")[1];
      this.setSearchList(listData, scope);
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
        param: [messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_DB_NOT_CREATED_YET].join(messageParams.separator), 
        callback: this.onSwResponseReceived
      },
    ]);

  }

  setSearchList(listData, scope){

    if (scope == "all"){

      if (this.state.globalData.allSearchList == null){
        this.setState(prevState => {
          let globalData = Object.assign({}, prevState.globalData);
          globalData.allSearchList = [];
          return { globalData };
        }, () => {
          this.setSearchList(listData, scope);
        });
        return;
      }

      listData = this.state.globalData.allSearchList.concat(listData);
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
                  <Navigate replace to={"/index.html/Profile?profile-url=" + this.state.redirect_to.data} />
                  : this.state.redirect_to && this.state.redirect_to.view == "CalendarView" ?
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
            <Route path="/index.html/Feedback" element={<Feedback globalData={this.state.globalData} />} />
            <Route path="/index.html/Calendar" element={<Calendar globalData={this.state.globalData} />} />
            <Route path="/index.html/LicenseCredits" element={<LicenseCreditsView globalData={this.state.globalData} />} />
            <Route path="/index.html/Error" element={<ErrorPageView />} />
          </Routes>
        </BrowserRouter>

      </>
    );
  }

}
