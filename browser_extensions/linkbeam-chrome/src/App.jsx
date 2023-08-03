import React from 'react'
import './App.css'
import app_logo_white from '/app_logo_white.png'
import About from "./react_components/About";
import Activity from "./react_components/Activity";
import Settings from "./react_components/Settings";
import Statistics from "./react_components/Statistics";
import Keywords from "./react_components/Keywords";


export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      onDisplay: "Activity",
      globalData: {
        keywordList: null,
        searchList: null,
        appParams: null,
        lastDataResetDate: null
      }
    };
  }

  componentDidMount() {

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

          if (message.data.property == "lastDataResetDate"){
              // Setting the search list here too
              this.setState((prevState) => ({
                globalData: {
                  keywordList: prevState.globalData.keywordList,
                  searchList: [],
                  appParams: prevState.globalData.appParams,
                  lastDataResetDate: prevState.globalData.lastDataResetDate,
                }
              }));
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

  switchOnDisplay = (newValue) => {
    this.setState({onDisplay: newValue});
  }

  render(){

    return(
      <>
        {this.state.onDisplay == "Activity" && <Activity globalData={this.state.globalData} switchOnDisplay={this.switchOnDisplay} />}

        {this.state.onDisplay == "About" && <About switchOnDisplay={this.switchOnDisplay} globalData={this.state.globalData} />}

        {this.state.onDisplay == "Settings" && <Settings globalData={this.state.globalData} switchOnDisplay={this.switchOnDisplay} />}

        {this.state.onDisplay == "Statistics" && <Statistics globalData={this.state.globalData} switchOnDisplay={this.switchOnDisplay} />}

        {this.state.onDisplay == "Keywords" && <Keywords globalData={this.state.globalData} switchOnDisplay={this.switchOnDisplay} />}

      </>
    );
  }

}
