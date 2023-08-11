import React from 'react'
import './App.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import app_logo_white from '/app_logo_white.png'
import About from "./react_components/About";
import Activity from "./react_components/Activity";
import Settings from "./react_components/Settings";
import Statistics from "./react_components/Statistics";
import Keywords from "./react_components/Keywords";
import Profile from "./react_components/Profile";
import MyAccount from "./react_components/MyAccount";
import Reminders from "./react_components/Reminders";
import Notifications from "./react_components/Notifications";
import NewsFeed from "./react_components/NewsFeed";


export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profileUrlValue: null,
      globalData: {
        keywordList: null,
        searchList: null,
        searchListOffset: 0,
        lastSearchBatchList: null,
        appParams: null,
        lastDataResetDate: null,
        installedOn: null,
        productID: null,
      }
    };
  }

  componentDidMount() {

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const profileUrlValue = urlParams.get("profile-url");

    this.setState({profileUrlValue: profileUrlValue});

    // Getting the app parameters
    chrome.runtime.sendMessage({header: 'get-app-params', data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('App params list request sent', response);
    });

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
        case "search-list":{
          console.log("App Message received Search List: ", message);
          // sending a response
          sendResponse({
              status: "ACK"
          });

          this.setSearchList(message.data);

          break;
        }

        case "settings-data":{
          console.log("App Message received settings-data: ", message);
          // sending a response
          sendResponse({
              status: "ACK"
          });

          switch(message.data.property){
            case "lastDataResetDate":{
              
              this.setState(prevState => {
                let globalData = Object.assign({}, prevState.globalData);
                globalData.searchList = [];
                globalData.searchListOffset = 0;
                return { globalData };
              });
              break;
            }
          }
          break;
        }

        case "keyword-list":{
          console.log("App Message received Keyword List: ", message);
          // sending a response
          sendResponse({
              status: "ACK"
          });

          // Setting the search list here too
          this.setState(prevState => {
            let globalData = Object.assign({}, prevState.globalData);
            globalData.keywordList = message.data;
            return { globalData };
          });
          break;
        }
        case "last-reset-date":{
          console.log("App Message received last Reset date: ", message);
          // sending a response
          sendResponse({
              status: "ACK"
          });

          // Setting the search list here too
          this.setState(prevState => {
            let globalData = Object.assign({}, prevState.globalData);
            globalData.lastDataResetDate = message.data;
            return { globalData };
          });
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
        globalData.searchListOffset = 0;
        return { globalData };
      }, () => {
        this.setSearchList(listData);
      });
      return;
    }

    this.setState(prevState => {
        let globalData = Object.assign({}, prevState.globalData);
        globalData.lastSearchBatchList = listData;
        return { globalData };
      }, () => {

        listData = this.state.globalData.searchList.concat(listData);

        this.setState(prevState => {
          let globalData = Object.assign({}, prevState.globalData);
          globalData.searchList = listData;
          globalData.searchListOffset = prevState.offset + listData.length
          return { globalData };
        });

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
                : <Activity globalData={this.state.globalData} />
            }/>
            <Route path="/index.html/About" element={<About globalData={this.state.globalData} />} />
            <Route path="/index.html/Settings" element={<Settings globalData={this.state.globalData} />} />
            <Route path="/index.html/Statistics" element={<Statistics globalData={this.state.globalData}/>} />
            <Route path="/index.html/Keywords" element={<Keywords globalData={this.state.globalData} />} />
            <Route path="/index.html/MyAccount" element={<MyAccount globalData={this.state.globalData} />} />
            <Route path="/index.html/Profile" element={<Profile />} />
            <Route path="/index.html/Reminders" element={<Reminders globalData={this.state.globalData} />} />
            <Route path="/index.html/Notifications" element={<Notifications globalData={this.state.globalData} />} />
            <Route path="/index.html/NewsFeed" element={<NewsFeed globalData={this.state.globalData} />} />
            {/*<Route path="*" element={<NoPage />} />*/}
          </Routes>
        </BrowserRouter>

      </>
    );
  }

}
