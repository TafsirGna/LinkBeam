import React from 'react';
import HomeMenu from "./widgets/HomeMenu";
import user_icon from '../assets/user_icon.png';
import { Navigate } from "react-router-dom";
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import moment from 'moment';
import { saveCurrentPageTitle, sendDatabaseActionMessage } from "./Local_library";

export default class Activity extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      searchList: null,
      searchListTags: null,
      bookmarkList: null,
      bookmarkListTags: null,
      currentPageTitle: "Activity",
      lastBatchList: [],
      offset: 0,
      currentTabIndex: 0,
      processingState: {
        status: "NO", 
        info: "",
      }
    };

    this.setListData = this.setListData.bind(this);
    this.requestNextSearchBatch = this.requestNextSearchBatch.bind(this);
    this.getSearchList = this.getSearchList.bind(this);
    this.switchCurrentTab = this.switchCurrentTab.bind(this);
    this.startMessageListener = this.startMessageListener.bind(this);
    this.setBookmarkList = this.setBookmarkList.bind(this);

  }

  componentDidMount() {

    // Setting bookmark list if possible
    if (this.props.globalData.bookmarkList){
      this.setBookmarkList(this.props.globalData.bookmarkList);
    }

    // Start the message listener
    this.startMessageListener();

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const origin = urlParams.get("origin");

    // Getting the current page title in order to switch to it
    if (origin == null){
      sendDatabaseActionMessage("get-object", "settings", ["currentPageTitle"]);
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

    saveCurrentPageTitle("Activity");

  }

  startMessageListener(){

    // Listening for messages from the service worker
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

      switch(message.header){
        case "object-list":{

          switch(message.data.objectStoreName){
            case "searches":{

              console.log("Activity Message received Search List: ", message);
              // sending a response
              sendResponse({
                  status: "ACK"
              });

              // setting the new value
              this.setListData("ADD", message.data.objectData);

              // setting that the process stopped
              this.setState({
                processingState: {
                  status: "NO",
                  info: ""
                }
              });
              
              break;
            }
            case "bookmarks": {
              console.log("Activity Message received Bookmark List: ", message);
              // sending a response
              sendResponse({
                  status: "ACK"
              });

              // setting the new value
              let listData = message.data.objectData;
              this.setBookmarkList(listData);

              // setting that the process stopped
              this.setState({
                processingState: {
                  status: "NO",
                  info: ""
                }
              });
              break;
            }
          }
          
          break;
        }
        case "object-data":{
          
          switch(message.data.objectStoreName){
            case "settings": {

              console.log("Activity Message received settings-data: ", message);
              // sending a response
              sendResponse({
                  status: "ACK"
              });

              switch(message.data.objectData.property){
                /*case "lastDataResetDate":{

                  break;
                }*/
                case "currentPageTitle":{
                  
                  var currentPageTitle = message.data.objectData.value;
                  this.setState({currentPageTitle: currentPageTitle});

                  // if (currentPageTitle == "Activity"){

                  // }
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

  setBookmarkList(listData){

    this.setState({
                bookmarkList: listData,
                bookmarkListTags: listData.map((bookmark) => (<a href={"index.html?profile-url=" + bookmark.url} target="_blank" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                                    <img src={user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                                    <div class="d-flex gap-2 w-100 justify-content-between">
                                      <div>
                                        <h6 class="mb-0">{bookmark.profile.fullName}</h6>
                                        <p class="mb-0 opacity-75">{bookmark.profile.title}</p>
                                        {/*<p class="fst-italic opacity-50 mb-0 bg-light-subtle text-light-emphasis">
                                          <OverlayTrigger
                                            placement="top"
                                            overlay={<ReactTooltip id="tooltip1">Bookmarked</ReactTooltip>}
                                          >
                                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                          </OverlayTrigger>
                                        </p>*/}
                                      </div>
                                      <small class="opacity-50 text-nowrap">{moment(bookmark.createdOn, moment.ISO_8601).fromNow()}</small>
                                    </div>
                                  </a>)),
              });

  }

  switchCurrentTab(index){

    this.setState({currentTabIndex: index});

    if (index == 1){
      this.getBookmarkList();
    }

  }

  getSearchList(){
    sendDatabaseActionMessage("get-list", "searches", this.state.offset);
  }

  getBookmarkList(){
    sendDatabaseActionMessage("get-list", "bookmarks", null);
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
            <button type="button" class={"btn btn-primary badge" + (this.state.currentTabIndex == 0 ? " active " : "")} onClick={() => {this.switchCurrentTab(0)}}>
              All {(this.state.searchList && this.state.searchList.length != 0) ? "("+this.state.searchList.length+")" : null}
            </button>
            <button type="button" class={"btn btn-secondary badge" + (this.state.currentTabIndex == 1 ? " active " : "") } title="See Bookmarks" onClick={() => {this.switchCurrentTab(1)}} >
              Bookmarks {(this.state.bookmarkList && this.state.bookmarkList.length != 0) ? "("+this.state.bookmarkList.length+")" : null}
            </button>
          </div>
        </div>

        {/* Search List Tab */}

        { this.state.currentTabIndex == 0 && this.state.searchList == null && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                    {/*<span class="visually-hidden">Loading...</span>*/}
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div> }

        { this.state.currentTabIndex == 0 && this.state.searchList != null && this.state.searchList.length == 0 && <div class="text-center m-5 mt-2">
                    <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p><span class="badge text-bg-primary fst-italic shadow">No viewed profiles yet</span></p>
                  </div> }

        { this.state.currentTabIndex == 0 && this.state.searchList != null && this.state.searchList.length != 0 && <div>
                <div class="list-group m-1 shadow-sm small">
                  {this.state.searchListTags}
                </div>
                <div class="text-center my-2 ">
                    <button class={"btn btn-light rounded-pill btn-sm fst-italic text-muted border badge shadow-sm " + (((this.state.processingState.status == "YES" && this.state.processingState.info ==  "NEXT-BATCH") || (this.state.processingState.status == "NO" && this.state.lastBatchList.length < this.props.globalData.appParams.searchPageLimit)) ? "d-none" : "")} onClick={this.requestNextSearchBatch} type="button">See more</button>
                    <div class={"spinner-border spinner-border-sm text-secondary " + ((this.state.processingState.status == "YES" && this.state.processingState.info ==  "NEXT-BATCH") ? "" : "d-none")} role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
              </div> }


        {/* Bookmark List Tab */}

        { this.state.currentTabIndex == 1 && this.state.bookmarkList == null && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                    {/*<span class="visually-hidden">Loading...</span>*/}
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div> }

        { this.state.currentTabIndex == 1 && this.state.bookmarkList != null && this.state.bookmarkList.length == 0 && <div class="text-center m-5 mt-2">
                    <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p><span class="badge text-bg-primary fst-italic shadow">No bookmarks yet</span></p>
                  </div> }

        { this.state.currentTabIndex == 1 && this.state.bookmarkList != null && this.state.bookmarkList.length != 0 && <div>
                <div class="list-group m-1 shadow-sm small">
                  {this.state.bookmarkListTags}
                </div>
              </div> }
      </>
    )
  }
}

