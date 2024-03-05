import React from 'react';
import HomeMenuView from "./widgets/HomeMenuView";
import VisitListView from "./widgets/VisitListView";
import AggregatedVisitListView from "./widgets/AggregatedVisitListView";
import { OverlayTrigger, Tooltip as ReactTooltip, Offcanvas } from "react-bootstrap";
import ReminderListView from "./widgets/ReminderListView";
import SearchInputView from "./widgets/SearchInputView";
import { 
  saveCurrentPageTitle, 
  appParams, 
  deactivateTodayReminders,
  getTodayReminders,
} from "./Local_library";
import eventBus from "./EventBus";
import { db } from "../db";

export default class HomeView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      allVisitLeft: true,
      currentTabIndex: 0,
      loadingAllVisits: false,
      offCanvasShow: false,
    };

    // Binding all the needed functions
    this.getVisitList = this.getVisitList.bind(this);
    this.switchCurrentTab = this.switchCurrentTab.bind(this);

  }

  componentDidMount() {

    // Listening to every event dictating the retrieving of all visits
    eventBus.on(eventBus.GET_ALL_VISITS, (data) => {
        
        this.getVisitList("all");

      }
    );

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.HOME);

    getTodayReminders(db, (reminders) => {
      
    });

    if (!this.props.globalData.homeTodayVisitsList){
      this.getVisitList("today");
    }
    
  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.globalData.allVisits != this.props.globalData.allVisits){

      if (this.props.globalData.allVisits.scope == "search"){
        this.setState({allVisitLeft: false});
      }
      else{

        this.setState({loadingAllVisits: false, allVisitLeft: true});

        if (prevProps.globalData.allVisits){
          // check if the end of the all visits list has been hit
          if (prevProps.globalData.allVisits.scope == "all"
              && this.props.globalData.allVisits.visitCount == prevProps.globalData.allVisits.visitCount){
            this.setState({allVisitLeft: false});
          }

        }
        else{

          if (this.props.globalData.allVisits.scope == "all" 
              && this.props.globalData.allVisits.visitCount == this.props.globalData.homeTodayVisitsList.length){
            // console.log("************ 1 : ", this.props.globalData.allVisits, this.props.globalData.allVisits.visitCount, this.props.globalData.homeTodayVisitsList.length);
            this.getVisitList("all");  
          }

        }

      }

    }

  }

  componentWillUnmount() {

    eventBus.remove(eventBus.GET_ALL_VISITS);

  }

  handleOffCanvasClose = () => {this.setState({offCanvasShow: false}, 
      () => {
        deactivateTodayReminders(this.props.globalData.todayReminderList);
        eventBus.dispatch(eventBus.RESET_TODAY_REMINDER_LIST, null);
      }
    )
  };

  handleOffCanvasShow = () => {
      this.setState({offCanvasShow: true}
    )
  };

  // onExtensionCodeInjected(message, sendResponse){
    
  //   // acknowledge receipt
  //   ack(sendResponse);

  //   // hiding the popup
  //   // window.close();

  // }

  // onExtensionWebUiVisible(message, sendResponse){
    
  //   // acknowledge receipt
  //   ack(sendResponse);

  //   // hiding the popup
  //   window.close();

  // }

  // Function for switching between tabs
  switchCurrentTab(index){

    this.setState({currentTabIndex: index});

    switch(index){
      case 0:{
        break;
      }
      case 1: {
        eventBus.dispatch(eventBus.ALL_VISITS_TAB_CLICKED, null);
        break;
      }
    }

  }

  // Function requesting the list of all visits made
  getVisitList(scope){

    if (scope == "all"){
      if (this.state.allVisitLeft){
        this.setState({loadingAllVisits: true});
        sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.VISITS, {context: [appParams.COMPONENT_CONTEXT_NAMES.HOME, scope].join("-"), criteria: { offset: this.props.globalData.allVisits ? this.props.globalData.allVisits.visitCount : 0 }});
      }
    }
    else{ // today      

      (async () => {
        var visits = await db
                               .visits
                               .where("date")
                               .startsWith((new Date()).toISOString().split("T")[0])
                               .toArray();

        await Promise.all (visits.map (async visit => {
          [visit.profile] = await Promise.all([
            db.profiles.where('url').equals(visit.url).first()
          ]);
        }));

        visits.sort((a,b) => new Date(b.date) - new Date(a.date));

        eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "homeTodayVisitsList", value: visits});
        
      })();
    }

  }

  render(){

    return (
      <>

        <div class="clearfix">
          {/*setting icon*/}
          <HomeMenuView globalData={this.props.globalData} handleOffCanvasShow={this.handleOffCanvasShow} />
        </div>
        <div class="text-center">
          <div class="btn-group btn-group-sm mb-2 shadow" role="group" aria-label="Small button group">
            <button type="button" class={"btn btn-primary badge" + (this.state.currentTabIndex == 0 ? " active " : "") } title="Today's visits" onClick={() => {this.switchCurrentTab(0)}} >
              Today {(this.props.globalData.homeTodayVisitsList && this.props.globalData.homeTodayVisitsList.length != 0) ? "("+this.props.globalData.homeTodayVisitsList.length+")" : null}
            </button>
            <button type="button" class={"btn btn-secondary badge" + (this.state.currentTabIndex == 1 ? " active " : "")} title="All visits" onClick={() => {this.switchCurrentTab(1)}}>
              All {(this.props.globalData.allVisits && this.props.globalData.allVisits.visitCount != this.props.globalData.homeTodayVisitsList.length) ? "("+this.props.globalData.allVisits.visitCount+")" : null}
            </button>
          </div>
        </div>

        {/* Today visits List Tab */}
        { this.state.currentTabIndex == 0 && <div class="mt-4">
                                              <VisitListView objects={this.props.globalData.homeTodayVisitsList} seeMore={() => {}} loading={false} visitLeft={false} />
                                              </div>}

        {/* All visits List Tab */}
        { this.state.currentTabIndex == 1 && <div>
                                              <SearchInputView objectStoreName={dbData.objectStoreNames.PROFILES} context={appParams.COMPONENT_CONTEXT_NAMES.HOME} />
                                              <AggregatedVisitListView objects={this.props.globalData.allVisits ? this.props.globalData.allVisits.list : null} seeMore={() => {this.getVisitList("all")}} loading={this.state.loadingAllVisits} visitLeft={this.state.allVisitLeft} context={this.props.globalData.allVisits ? this.props.globalData.allVisits.scope : "all"}/>
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

