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


export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profileUrlValue: null,
      currentPageTitle: null,
      globalData: {
        keywordList: null,
        searchList: null,
        appParams: null,
        lastDataResetDate: null,
        installedOn: null,
        productID: null,
      }
    };
  }

  componentDidMount() {

    console.log("Mounting App -----------------------------------");

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const profileUrlValue = urlParams.get("profile-url");
    this.setState({profileUrlValue: profileUrlValue});

    // Getting the app parameters
    chrome.runtime.sendMessage({header: 'get-app-params', data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('App params list request sent', response);
    });

    // Getting the current page title in order to switch to it
    chrome.runtime.sendMessage({header: 'get-current-page-title', data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Get current page title request sent', response);
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
          this.setState((prevState) => ({
            globalData: {
              keywordList: prevState.globalData.keywordList,
              searchList: prevState.globalData.searchList,
              appParams: message.data,
              lastDataResetDate: prevState.globalData.lastDataResetDate,
            }
          }));
          break;
        }
        case "search-list":{
          console.log("App Message received Search List: ", message);
          // sending a response
          sendResponse({
              status: "ACK"
          });

          // Setting the search list here too
          this.setState((prevState) => ({
            globalData: {
              keywordList: prevState.globalData.keywordList,
              searchList: message.data,
              appParams: prevState.globalData.appParams,
              lastDataResetDate: prevState.globalData.lastDataResetDate,
            }
          }));
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
              
              this.setState((prevState) => ({
                globalData: {
                  keywordList: prevState.globalData.keywordList,
                  searchList: [],
                  appParams: prevState.globalData.appParams,
                  lastDataResetDate: prevState.globalData.lastDataResetDate,
                }
              }));
              break;
            }
            case "currentPageTitle":{
              
              this.setState((prevState) => ({currentPageTitle: message.data.value}));
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
          this.setState((prevState) => ({
            globalData: {
              keywordList: message.data,
              searchList: prevState.globalData.searchList,
              appParams: prevState.globalData.appParams,
              lastDataResetDate: prevState.globalData.lastDataResetDate,
            }
          }));
          break;
        }
        case "last-reset-date":{
          console.log("App Message received last Reset date: ", message);
          // sending a response
          sendResponse({
              status: "ACK"
          });

          // Setting the search list here too
          this.setState((prevState) => ({
            globalData: {
              keywordList: prevState.globalData.keywordList,
              searchList: prevState.globalData.searchList,
              appParams: prevState.globalData.appParams,
              lastDataResetDate: message.data,
            }
          }));
          break;
        }
      }

    });

  }

  render(){

    return(
      <>
        {/*{this.state.onDisplay == "Activity" && <Activity globalData={this.state.globalData} switchOnDisplay={this.switchOnDisplay} />}
        {this.state.onDisplay == "About" && <About switchOnDisplay={this.switchOnDisplay} globalData={this.state.globalData} />}
        {this.state.onDisplay == "Settings" && <Settings globalData={this.state.globalData} switchOnDisplay={this.switchOnDisplay} />}
        {this.state.onDisplay == "Statistics" && <Statistics globalData={this.state.globalData} switchOnDisplay={this.switchOnDisplay} />}
        {this.state.onDisplay == "Keywords" && <Keywords globalData={this.state.globalData} switchOnDisplay={this.switchOnDisplay} />}*/}

        <BrowserRouter>
          <Routes>
            <Route path="/index.html" element={
              this.state.profileUrlValue ? 
                <Navigate replace to="/index.html/Profile" />
                /*: this.state.currentPageTitle == "About" ? 
                  <Navigate replace to="/index.html/About" />
                  : this.state.currentPageTitle == "Settings" ? 
                    <Navigate replace to="/index.html/Settings" />
                    : this.state.currentPageTitle == "Statistics" ? 
                      <Navigate replace to="/index.html/Statistics" />
                        : this.state.currentPageTitle == "Keywords" ?
                          <Navigate replace to="/index.html/Keywords" />
                          : this.state.currentPageTitle == "MyAccount" ?
                            <Navigate replace to="/index.html/MyAccount" />*/
                            : <Activity globalData={this.state.globalData} />
            }/>
            <Route path="/index.html/About" element={<About globalData={this.state.globalData} />} />
            <Route path="/index.html/Settings" element={<Settings globalData={this.state.globalData} />} />
            <Route path="/index.html/Statistics" element={<Statistics globalData={this.state.globalData}/>} />
            <Route path="/index.html/Keywords" element={<Keywords globalData={this.state.globalData} />} />
            <Route path="/index.html/MyAccount" element={<MyAccount globalData={this.state.globalData} />} />
            <Route path="/index.html/Profile" element={<Profile />} />
            {/*<Route path="*" element={<NoPage />} />*/}
          </Routes>
        </BrowserRouter>

      </>
    );
  }

}
