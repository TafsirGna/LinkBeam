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
        appParams: null,
        settings: {},
      }
    };
  }

  componentDidMount() {

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const profileUrlValue = urlParams.get("profile-url");
    const calendarView = urlParams.get("calendar-view");

    this.setState({profileUrlValue: profileUrlValue});
    this.setState({calendarView: calendarView});

    // Getting the app parameters
    chrome.runtime.sendMessage({header: 'get-app-params', data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('App params list request sent', response);
    });

    this.startMessageListener();

  }

  startMessageListener(){

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch(message.header){

        case "app-params-list":{
          console.log("App Message received App Params List: ", message);
          // sending a response
          sendResponse({
              status: "ACK"
          });

          // setting the new value
          this.setState(prevState => {
            let globalData = Object.assign({}, prevState.globalData);
            globalData.appParams = message.data;
            return { globalData };
          });
          break;
        }

        case "object-list":{

          switch(message.data.objectStoreName){
            case "searches":{

              console.log("App Message received Search List: ", message);
              // sending a response
              sendResponse({
                  status: "ACK"
              });
              this.setSearchList(message.data.objectData);
              break;

            }

            case "keywords":{

              console.log("App Message received Keyword List: ", message);
              // sending a response
              sendResponse({
                  status: "ACK"
              });

              // Setting the search list here too
              this.setState(prevState => {
                let globalData = Object.assign({}, prevState.globalData);
                globalData.keywordList = message.data.objectData;
                return { globalData };
              });

              break;
            }

            case "bookmarks":{

              console.log("App Message received Bookmarks List: ", message);
              // sending a response
              sendResponse({
                  status: "ACK"
              });

              // Setting the search list here too
              this.setState(prevState => {
                let globalData = Object.assign({}, prevState.globalData);
                globalData.bookmarkList = message.data.objectData;
                return { globalData };
              });

              break;
            }

          case "reminders":{

              console.log("App Message received Reminders List: ", message);
              // sending a response
              sendResponse({
                  status: "ACK"
              });

              // Setting the search list here too
              this.setState(prevState => {
                let globalData = Object.assign({}, prevState.globalData);
                globalData.reminderList = message.data.objectData;
                return { globalData };
              });

              break;
            }
          }

          break;
        }

        case "object-data":{

          switch(message.data.objectStoreName){
            case "settings": {

              console.log("App Message received settings-data: ", message);
              // sending a response
              sendResponse({
                  status: "ACK"
              });

              switch(message.data.objectData.property){
                case "lastDataResetDate":{
                  
                  this.setState(prevState => {
                    let globalData = Object.assign({}, prevState.globalData);
                    globalData.settings.lastDataResetDate = message.data.objectData.value;
                    return { globalData };
                  });
                  break;

                }

                case "notifications":{
                  
                  this.setState(prevState => {
                    let globalData = Object.assign({}, prevState.globalData);
                    globalData.settings.notifications = message.data.objectData.value;
                    return { globalData };
                  });
                  break;

                }
              }

              break;
            }
          }

          break;

        }
      }

    });

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
            <Route path="/index.html/About" element={<About globalData={this.state.globalData} />} />
            <Route path="/index.html/Settings" element={<Settings globalData={this.state.globalData} />} />
            <Route path="/index.html/Statistics" element={<Statistics globalData={this.state.globalData}/>} />
            <Route path="/index.html/Keywords" element={<Keywords globalData={this.state.globalData} />} />
            <Route path="/index.html/MyAccount" element={<MyAccount globalData={this.state.globalData} />} />
            <Route path="/index.html/Profile" element={<Profile />} />
            <Route path="/index.html/Reminders" element={<Reminders globalData={this.state.globalData} />} />
            <Route path="/index.html/Feed" element={<Feed globalData={this.state.globalData} />} />
            <Route path="/index.html/Feedback" element={<Feedback globalData={this.state.globalData} />} />
            <Route path="/index.html/Calendar" element={<Calendar globalData={this.state.globalData} />} />
            {/*<Route path="*" element={<NoPage />} />*/}
          </Routes>
        </BrowserRouter>

      </>
    );
  }

}
