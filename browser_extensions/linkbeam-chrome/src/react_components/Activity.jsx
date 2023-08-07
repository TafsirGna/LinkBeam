import React from 'react'
import HomeMenu from "./widgets/HomeMenu"
import user_icon from '../assets/user_icon.png'
import { Navigate } from "react-router-dom";
import moment from 'moment';

export default class Activity extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      searchList: null,
      searchListTags: null,
      currentPageTitle: "Activity",
      lastBatchList: [],
      offset: 0,
      processingState: {
        status: "NO", 
        info: "",
      }
    };

    this.setListData = this.setListData.bind(this);
    this.requestNextSearchBatch = this.requestNextSearchBatch.bind(this);
    this.getSearchList = this.getSearchList.bind(this);

  }

  componentDidMount() {

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const origin = urlParams.get("origin");

    // Getting the current page title in order to switch to it
    if (origin == null){
      chrome.runtime.sendMessage({header: 'get-current-page-title', data: null}, (response) => {
        // Got an asynchronous response with the data from the service worker
        console.log('Get current page title request sent', response);
      });
    }

    // resetting before starting over
    this.setState({searchList: null, offset: 0}, () => {

      // setting the local variable with the global data
      if (this.props.globalData.searchList){
        this.setListData("INIT",this.props.globalData.searchList);
      }
      else{
        this.getSearchList();
      }

    });

    // Listening for messages from the service worker
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

      switch(message.header){
        case "search-list":{

          console.log("Activity Message received Search List: ", message);
          // sending a response
          sendResponse({
              status: "ACK"
          });

          // setting the new value
          this.setListData("ADD", message.data);

          // setting that the process stopped
          this.setState({
            processingState: {
              status: "NO",
              info: ""
            }
          });
          break;
        }
        case "settings-data":{
          console.log("Activity Message received settings-data: ", message);
          // sending a response
          sendResponse({
              status: "ACK"
          });

          switch(message.data.property){
            /*case "lastDataResetDate":{

              break;
            }*/
            case "currentPageTitle":{
              
              this.setState({currentPageTitle: message.data.value});
              break;
            }
          }
          break;
        }
      }

    });

    // Saving the current page title
    chrome.runtime.sendMessage({header: 'save-page-title', data: "Activity"}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Save page title request sent', response);
    });

  }

  getSearchList(){
    chrome.runtime.sendMessage({header: 'get-search-list', data: this.state.offset}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Search list request sent', response);
    });
  }

  requestNextSearchBatch(){
    this.setState({
      processingState: {
        status: "YES",
        info: "NEXT-BATCH"
      }
    });

    // requesting the next batch
    this.getSearchList()
  }

  setListData(context, listData){

    if (this.state.searchList == null){
      this.setState({searchList: []}, () => {
        this.setListData(context, listData);
      });
      return;
    }

    this.setState({lastBatchList: listData}, () => {

      listData = this.state.searchList.concat(listData);

      this.setState((prevState) => ({
        searchList: listData,
        searchListTags: listData.map((search) => (<a href={"index.html?profile-url=" + search.url} target="_blank" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                                <img src={user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                                <div class="d-flex gap-2 w-100 justify-content-between">
                                  <div>
                                    <h6 class="mb-0">{search.profile.fullName}</h6>
                                    <p class="mb-0 opacity-75">{search.profile.title}</p>
                                    <p class="fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-info-subtle">{search.profile.nFollowers} followers · {search.profile.nConnections} connections</p>
                                  </div>
                                  <small class="opacity-50 text-nowrap">{moment(search.date, moment.ISO_8601).fromNow()}</small>
                                </div>
                              </a>)),
        offset: prevState.offset + listData.length,
      }), () => {
        if (context == "INIT"){
          // Getting the search list
          this.getSearchList();
        }
      });

    });
  }

  render(){

    // Redirecting to a different interface depending on the url params
    if (this.state.currentPageTitle != "Activity"){
      return <Navigate replace to={"/index.html/" + this.state.currentPageTitle} />;
    }

    return (
      <>
        <div class="clearfix">
          {/*setting icon*/}
          <HomeMenu />
        </div>
        <div class="text-center">
          <div class="btn-group btn-group-sm mb-2 shadow-sm" role="group" aria-label="Small button group">
            <button type="button" class="btn btn-primary badge">
              All {(this.state.searchList && this.state.searchList.length != 0) ? "("+this.state.searchList.length+")" : null}
            </button>
            <button type="button" class="btn btn-secondary badge" title="See Bookmarks">Bookmarks</button>
          </div>
        </div>
        {this.state.searchList == null && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                    {/*<span class="visually-hidden">Loading...</span>*/}
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div>}

        {this.state.searchList != null && this.state.searchList.length == 0 && <div class="text-center m-5 mt-2">
                    <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p><span class="badge text-bg-primary fst-italic shadow">No viewed profiles yet</span></p>
                  </div>}

        {this.state.searchList != null && this.state.searchList.length != 0 && <div>
                <div class="list-group m-1 shadow-sm small">
                  {this.state.searchListTags}
                </div>
                <div class="text-center my-2 ">
                    <button class={"btn btn-light rounded-pill btn-sm fst-italic text-muted border badge shadow-sm " + (((this.state.processingState.status == "YES" && this.state.processingState.info ==  "NEXT-BATCH") || (this.state.processingState.status == "NO" && this.state.lastBatchList.length < this.props.globalData.appParams.searchPageLimit)) ? "d-none" : "")} onClick={this.requestNextSearchBatch} type="button">See more</button>
                    <div class={"spinner-border spinner-border-sm text-secondary " + ((this.state.processingState.status == "YES" && this.state.processingState.info ==  "NEXT-BATCH") ? "" : "d-none")} role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
              </div>}
      </>
    )
  }
}

