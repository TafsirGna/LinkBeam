import React from 'react';
import HomeMenuView from "./widgets/HomeMenuView";
import SearchListView from "./widgets/SearchListView";
import AggregatedSearchListView from "./widgets/AggregatedSearchListView";
import { Navigate } from "react-router-dom";
import { OverlayTrigger, Tooltip as ReactTooltip, Offcanvas } from "react-bootstrap";
import ReminderListView from "./widgets/ReminderListView";
import SearchInputView from "./widgets/SearchInputView";
import { 
  saveCurrentPageTitle, 
  sendDatabaseActionMessage, 
  ack, 
  startMessageListener,
  messageParams,
  dbData,
  appParams, 
  checkCurrentTab,
  deactivateTodayReminders,
  } from "./Local_library";
  import eventBus from "./EventBus";

export default class HomeView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      allSearchLeft: true,
      currentPageTitle: null,
      currentTabIndex: 0,
      loadingAllSearches: false,
      offCanvasShow: false,
    };

    // Binding all the needed functions
    this.getSearchList = this.getSearchList.bind(this);
    this.switchCurrentTab = this.switchCurrentTab.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSettingsDataReceived = this.onSettingsDataReceived.bind(this);
    this.onExtensionCodeInjected = this.onExtensionCodeInjected.bind(this);
    this.onExtensionWebUiVisible = this.onExtensionWebUiVisible.bind(this);

  }

  componentDidMount() {

    // Start the message listener
    this.listenToMessages();

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const origin = urlParams.get("origin");

    if (!origin){
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["currentPageTitle"]);
      return;
    }

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY);

    if (!this.props.globalData.todaySearchList){
      this.getSearchList("today");
    }
    
  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.globalData.allSearches != this.props.globalData.allSearches){

      this.setState({loadingAllSearches: false});

      if (prevProps.globalData.allSearches){
        // check if the end of the all searches list has been hit
        var hit = ((this.props.globalData.allSearches.searchCount == prevProps.globalData.allSearches.searchCount));
        if (hit){
          this.setState({allSearchLeft: false});
        }

      }

    }

  }

  handleOffCanvasClose = () => {this.setState({offCanvasShow: false}, 
      () => {
        deactivateTodayReminders();
        eventBus.dispatch(eventBus.RESET_TODAY_REMINDER_LIST, null);
      }
    )
  };

  handleOffCanvasShow = () => {
      this.setState({offCanvasShow: true}
    )
  };

  onSettingsDataReceived(message, sendResponse){
    
    // acknowledge receipt
    ack(sendResponse);

    switch(message.data.objectData.property){

      case "currentPageTitle":{
        
        var pageTitle = message.data.objectData.value;
        this.setState({currentPageTitle: pageTitle}, () => {
          if (this.state.currentPageTitle == appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY){
            // Getting the list of all searches
            if (this.props.globalData.todaySearchList == null){
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
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.SETTINGS].join(messageParams.separator), 
        callback: this.onSettingsDataReceived
      },
      // {
      //   param: [messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_WEB_PAGE_CHECKED].join(messageParams.separator), 
      //   callback: this.onSwResponseReceived
      // },
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

        if (this.props.globalData.allSearches.searchCount == this.props.globalData.todaySearchList.length){
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
        sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.SEARCHES, {offset: this.props.globalData.allSearches.searchCount, context: [appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY, scope].join("-")});
      }
    }
    else{ // today
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.SEARCHES, {timePeriod: (new Date()), context: [appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY, scope].join("-")});
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
            <HomeMenuView globalData={this.props.globalData} handleOffCanvasShow={this.handleOffCanvasShow} />
          </div>
          <div class="text-center">
            <div class="btn-group btn-group-sm mb-2 shadow" role="group" aria-label="Small button group">
              <button type="button" class={"btn btn-primary badge" + (this.state.currentTabIndex == 0 ? " active " : "") } title="Today's searches" onClick={() => {this.switchCurrentTab(0)}} >
                Today {(this.props.globalData.todaySearchList && this.props.globalData.todaySearchList.length != 0) ? "("+this.props.globalData.todaySearchList.length+")" : null}
              </button>
              <button type="button" class={"btn btn-secondary badge" + (this.state.currentTabIndex == 1 ? " active " : "")} title="All searches" onClick={() => {this.switchCurrentTab(1)}}>
                All {(this.props.globalData.allSearches && this.props.globalData.allSearches.searchCount != this.props.globalData.todaySearchList.length) ? "("+this.props.globalData.allSearches.searchCount+")" : null}
              </button>
            </div>
          </div>

          {/* Today Search List Tab */}
          { this.state.currentTabIndex == 0 && <div class="mt-4">
                                                <SearchListView objects={this.props.globalData.todaySearchList} seeMore={() => {}} loading={false} searchLeft={false} />
                                                </div>}

          {/* All Search List Tab */}
          { this.state.currentTabIndex == 1 && <div>
                                                <SearchInputView objectStoreName={dbData.objectStoreNames.PROFILES}/>
                                                <AggregatedSearchListView objects={this.props.globalData.allSearches.list} seeMore={() => {this.getSearchList("all")}} loading={this.state.loadingAllSearches} searchLeft={this.state.allSearchLeft}/>
                                              </div>}

          <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Reminders</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              { this.props.globalData.todayReminderList && <ReminderListView objects={this.props.globalData.todayReminderList} />}
            </Offcanvas.Body>
          </Offcanvas>

        </>
      )
    }

  }
}

