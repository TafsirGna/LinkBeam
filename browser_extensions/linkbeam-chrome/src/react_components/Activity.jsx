import React from 'react';
import HomeMenu from "./widgets/HomeMenuView";
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
      allSearchList: null,
      todaySearchList: null,
      allSearchLeft: true,
      // bookmarkList: null,
      currentPageTitle: null,
      currentTabIndex: 0,
      loadingAllSearches: false,
      currentTabWebPageData: null,
    };

    // Binding all the needed functions
    this.setListData = this.setListData.bind(this);
    this.getSearchList = this.getSearchList.bind(this);
    this.switchCurrentTab = this.switchCurrentTab.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSearchesDataReceived = this.onSearchesDataReceived.bind(this);
    this.onSettingsDataReceived = this.onSettingsDataReceived.bind(this);
    // this.onBookmarksDataReceived = this.onBookmarksDataReceived.bind(this);
    this.onSwResponseReceived = this.onSwResponseReceived.bind(this);
    this.onExtensionCodeInjected = this.onExtensionCodeInjected.bind(this);
    this.onExtensionWebUiVisible = this.onExtensionWebUiVisible.bind(this);

  }

  componentDidMount() {

    // Start the message listener
    this.listenToMessages();

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const origin = urlParams.get("origin");

    if (origin == null){
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["currentPageTitle"]);
      return;
    }

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY);

    // Setting bookmark list if possible
    // this.setState({bookmarkList: this.props.globalData.bookmarkList});

    // Setting current tab info if possible
    if (this.props.globalData.currentTabWebPageData){
      this.setState({currentTabWebPageData: this.props.globalData.currentTabWebPageData});
    }

    // setting the local variable with the global data
    this.setState({allSearchList: this.props.globalData.allSearchList});

    this.setState({todaySearchList: this.props.globalData.todaySearchList}, () => {
      if (this.state.todaySearchList == null){
        this.getSearchList("today");
      }
    });
    
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
    this.setListData(listData, scope);

  }

  // onBookmarksDataReceived(message, sendResponse){
    
  //   // acknowledge receipt
  //   ack(sendResponse);

  //   // setting the new value
  //   let listData = message.data.objectData;
  //   this.setState({bookmarkList: listData});

  // }

  onSettingsDataReceived(message, sendResponse){
    
    // acknowledge receipt
    ack(sendResponse);

    switch(message.data.objectData.property){

      case "currentPageTitle":{
        
        var pageTitle = message.data.objectData.value;
        this.setState({currentPageTitle: pageTitle}, () => {
          if (this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY){
            // Getting the list of all searches
            if (this.state.todaySearchList == null){
              this.getSearchList("today");
            }

            // Requesting the notification settings
            sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["notifications"]);
          }
        });

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

  onExtensionCodeInjected(message, sendResponse){
    
    // acknowledge receipt
    ack(sendResponse);

    // hiding the popup
    // window.close();

  }

  onExtensionWebUiVisible(message, sendResponse){
    
    // acknowledge receipt
    ack(sendResponse);

    // hiding the popup
    window.close();

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
      {
        param: [messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_WEB_PAGE_ACTIVATED].join(messageParams.separator), 
        callback: this.onExtensionCodeInjected
      },
      {
        param: [messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_WEB_PAGE_LOADED].join(messageParams.separator), 
        callback: this.onExtensionWebUiVisible
      },
    ]);

  }

  // Function for switching between tabs
  switchCurrentTab(index){

    this.setState({currentTabIndex: index});

    switch(index){
      case 0:{
        break;
      }
      case 1: {
        if (!this.state.allSearchList){
          this.getSearchList("all");
        }
        break;
      }
    }

  }

  // Function requesting the list of all searches made
  getSearchList(scope){

    if (scope == "all"){
      if (this.state.allSearchLeft){
        this.setState({loadingAllSearches: true});
        sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.SEARCHES, {offset: (this.state.allSearchList ? this.state.allSearchList.length : 0), context: [appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY, scope].join("-")});
      }
    }
    else{ // today
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.SEARCHES, {date: ((new Date()).toISOString().split("T")[0]), context: [appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY, scope].join("-")});
    }

  }

  getBookmarkList(){

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.BOOKMARKS, null);

  }

  setListData(listData, scope){

    if (scope == "all"){

      if (this.state.allSearchList == null){
        this.setState({allSearchList: []}, () => {
          this.setListData(listData, scope);
        });
        return;
      }

      if (listData.length < appParams.searchPageLimit){
        this.setState({allSearchLeft: false});
      }

      listData = this.state.allSearchList.concat(listData);
      this.setState({allSearchList: listData, loadingAllSearches: false});

    }
    else{ // today

      this.setState({todaySearchList: listData});

    }

  }

  render(){

    if (!this.state.currentPageTitle){
      return (<></>)
    }

    // Redirecting to a different interface depending on the url params
    if (this.state.currentPageTitle != appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY){
      return <Navigate replace to={"/index.html/" + this.state.currentPageTitle} />;
    }

    if (this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY){
      return (
        <>

          <div class="clearfix">
            {/*setting icon*/}
            <HomeMenu envData={this.state.currentTabWebPageData} globalData={this.props.globalData} />
          </div>
          <div class="text-center">
            <div class="btn-group btn-group-sm mb-2 shadow" role="group" aria-label="Small button group">
              <button type="button" class={"btn btn-primary badge" + (this.state.currentTabIndex == 0 ? " active " : "") } title="Today's searches" onClick={() => {this.switchCurrentTab(0)}} >
                Today {(this.state.todaySearchList && this.state.todaySearchList.length != 0) ? "("+this.state.todaySearchList.length+")" : null}
              </button>
              <button type="button" class={"btn btn-secondary badge" + (this.state.currentTabIndex == 1 ? " active " : "")} title="All searches" onClick={() => {this.switchCurrentTab(1)}}>
                All {(this.state.allSearchList && this.state.allSearchList.length != 0) ? "("+this.state.allSearchList.length+")" : null}
              </button>
              {/*<button type="button" class={"btn btn-secondary badge" + (this.state.currentTabIndex == 1 ? " active " : "") } title="See Bookmarks" onClick={() => {this.switchCurrentTab(1)}} >
                Bookmarks {(this.state.bookmarkList && this.state.bookmarkList.length != 0) ? "("+this.state.bookmarkList.length+")" : null}
              </button>*/}
            </div>
          </div>

          {/* Today Search List Tab */}

          { this.state.currentTabIndex == 0 && <SearchListView objects={this.state.todaySearchList} seeMore={() => {}} loading={false} searchLeft={false} />}

          {/* All Search List Tab */}

          { this.state.currentTabIndex == 1 && <SearchListView objects={this.state.allSearchList} seeMore={() => {this.getSearchList("all")}} loading={this.state.loadingAllSearches} searchLeft={this.state.allSearchLeft}/>}

          {/* Bookmark List Tab */}

          {/*{ this.state.currentTabIndex == 1 && <BookmarkListView objects={this.state.bookmarkList} />}*/}

        </>
      )
    }

  }
}

