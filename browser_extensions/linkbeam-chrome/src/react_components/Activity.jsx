import React from 'react';
import HomeMenu from "./widgets/HomeMenu";
import SearchListView from "./widgets/SearchListView";
import BookmarkListView from "./widgets/BookmarkListView";
import { Navigate } from "react-router-dom";
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
/*import 'bootstrap/dist/css/bootstrap.min.css';*/
import { 
  saveCurrentPageTitle, 
  sendDatabaseActionMessage, 
  ack, 
  startMessageListener,
  messageParams,
  dbData,
  appParams, 
  checkCurrentTab,
  } from "./Local_library";

export default class Activity extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      searchList: null,
      searchLeft: true,
      bookmarkList: null,
      currentPageTitle: "Activity",
      currentTabIndex: 0,
      loadingSearches: false,
      currentTabWebPageData: null,
    };

    this.setListData = this.setListData.bind(this);
    this.getSearchList = this.getSearchList.bind(this);
    this.switchCurrentTab = this.switchCurrentTab.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSearchesDataReceived = this.onSearchesDataReceived.bind(this);
    this.onSettingsDataReceived = this.onSettingsDataReceived.bind(this);
    this.onBookmarksDataReceived = this.onBookmarksDataReceived.bind(this);
    this.onSwResponseReceived = this.onSwResponseReceived.bind(this);

  }

  componentDidMount() {

    // Start the message listener
    this.listenToMessages();

    // Setting bookmark list if possible
    if (this.props.globalData.bookmarkList){
      this.setState({bookmarkList: this.props.globalData.bookmarkList});
    }

    // setting the local variable with the global data
    var offset = 0;
    if (this.props.globalData.searchList){
      offset = this.props.globalData.searchList.length;
      this.setState({searchList: this.props.globalData.searchList});
    }

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const origin = urlParams.get("origin");

    // Getting the current page title in order to switch to it
    if (origin){
      saveCurrentPageTitle("Activity");
      this.getSearchList(offset);
    }
    else{
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["currentPageTitle", "notifications"]);
    }

  }

  onSearchesDataReceived(message, sendResponse){

    var context = message.data.objectData.context; 
    if (context != "Activity"){
      return;
    }

    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    var listData = message.data.objectData.list;
    this.setListData(listData);

  }

  onBookmarksDataReceived(message, sendResponse){
    
    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    let listData = message.data.objectData;
    this.setState({bookmarkList: listData});

  }

  onSettingsDataReceived(message, sendResponse){
    
    // acknowledge receipt
    ack(sendResponse);

    switch(message.data.objectData.property){

      case "currentPageTitle":{
        
        var currentPageTitle = message.data.objectData.value;
        if (currentPageTitle == "Activity"){
          var offset = (this.props.globalData.searchList ? this.props.globalData.searchList.length : 0);
          this.getSearchList(offset);
        }
        else{
          this.setState({currentPageTitle: currentPageTitle});
        }

        break;

      }

      case "notifications":{
        
        // Deciding whether to display the grow spinner for plugin activation or not 
        var notificationSetting = message.data.objectData.value;
        if (notificationSetting){
          return;
        }

        checkCurrentTab();

        break;
        
      }
    }

  }

  onSwResponseReceived(message, sendResponse){
    
    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    let currentTabWebPageData = message.data.objectData;
    this.setState({currentTabWebPageData: currentTabWebPageData});

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
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.SETTINGS].join(messageParams.separator), 
        callback: this.onSettingsDataReceived
      },
      {
        param: [messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_WEB_PAGE_CHECKED].join(messageParams.separator), 
        callback: this.onSwResponseReceived
      },
    ]);

  }

  switchCurrentTab(index){

    this.setState({currentTabIndex: index});

    switch(index){
      case 0:{
        // this.getSearchList();
        break;
      }
      case 1: {
        this.getBookmarkList();
        break;
      }
    }

  }

  getSearchList(offset = 0){

    if (this.state.searchLeft){
      this.setState({loadingSearches: true});
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.SEARCHES, {offset: (this.state.searchList ? this.state.searchList.length : 0), context: "Activity"});
    }

  }

  getBookmarkList(){

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.BOOKMARKS, null);

  }

  setListData(listData){

    if (this.state.searchList == null){
      this.setState({searchList: []}, () => {
        this.setListData(listData);
      });
      return;
    }

    if (listData.length < appParams.searchPageLimit){
      this.setState({searchLeft: false});
    }

    listData = this.state.searchList.concat(listData);
    this.setState({searchList: listData, loadingSearches: false});

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
          <HomeMenu envData={this.state.currentTabWebPageData} />
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

        { this.state.currentTabIndex == 0 && <SearchListView objects={this.state.searchList} seeMore={this.getSearchList} loading={this.state.loadingSearches} searchLeft={this.state.searchLeft}/>}

        {/* Bookmark List Tab */}

        { this.state.currentTabIndex == 1 && <BookmarkListView objects={this.state.bookmarkList} />}

      </>
    )
  }
}

