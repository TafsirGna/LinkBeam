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
  dbData,
  groupVisitsByProfile,
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

    if (!this.props.globalData.homeTodayVisitsList){
      this.getVisitList("today");
    }
    
  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.globalData.homeAllVisitsList != this.props.globalData.homeAllVisitsList){

      if (this.props.globalData.homeAllVisitsList.scope == "search"){
        this.setState({allVisitLeft: false});
      }
      else{

        this.setState({loadingAllVisits: false, allVisitLeft: true});

        if (prevProps.globalData.homeAllVisitsList){
          // check if the end of the all visits list has been hit
          if (prevProps.globalData.homeAllVisitsList.scope == "all"
              && this.props.globalData.homeAllVisitsList.list.length == prevProps.globalData.homeAllVisitsList.list.length){
            this.setState({allVisitLeft: false});
          }

        }
        else{

          this.getVisitList("all"); 

        }

      }

    }

  }

  componentWillUnmount() {

    eventBus.remove(eventBus.GET_ALL_VISITS);

  }

  handleOffCanvasClose = () => {this.setState({offCanvasShow: false}, 
      () => {
        deactivateTodayReminders(db);
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
        this.setState({loadingAllVisits: true}, () => {

          (async () => {
            var visits = await db
                                   .visits
                                   .offset(this.props.globalData.homeAllVisitsList.list.length).limit(5)
                                   .toArray();

            await Promise.all (visits.map (async visit => {
              [visit.profile] = await Promise.all([
                db.profiles.where('url').equals(visit.url).first()
              ]);
            }));

            var homeAllVisitsList = this.props.globalData.homeAllVisitsList;
            homeAllVisitsList.list = this.props.globalData.homeAllVisitsList.list.concat(visits); 

            console.log("eeeeeeeeeeeeeeeeeeeeeeee: ", homeAllVisitsList);

            eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "homeAllVisitsList", value: homeAllVisitsList});
            
          })();

        });
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
              All {(this.props.globalData.homeAllVisitsList && this.props.globalData.homeAllVisitsList.list.length != this.props.globalData.homeTodayVisitsList.length) ? "("+this.props.globalData.homeAllVisitsList.list.length+")" : null}
            </button>
          </div>
        </div>

        {/* Today visits List Tab */}
        { this.state.currentTabIndex == 0 && <div class="mt-4">

                                              <VisitListView 
                                                objects={this.props.globalData.homeTodayVisitsList} 
                                                seeMore={() => {}} 
                                                loading={false} 
                                                visitLeft={false} />

                                              </div>}

        {/* All visits List Tab */}
        { this.state.currentTabIndex == 1 && <div>

                                              { this.props.globalData.homeAllVisitsList 
                                                && (this.props.globalData.homeAllVisitsList.list.length != 0 || (this.props.globalData.homeAllVisitsList.list.length == 0 && this.props.globalData.homeAllVisitsList.list.scope == "search"))
                                                && <SearchInputView 
                                                      objectStoreName={dbData.objectStoreNames.PROFILES} 
                                                      globalData={this.props.globalData} />}

                                              <AggregatedVisitListView 
                                                objects={this.props.globalData.homeAllVisitsList ? groupVisitsByProfile(this.props.globalData.homeAllVisitsList.list) : null} 
                                                seeMore={() => {this.getVisitList("all")}} 
                                                loading={this.state.loadingAllVisits} 
                                                visitLeft={this.state.allVisitLeft} 
                                                context={this.props.globalData.homeAllVisitsList ? this.props.globalData.homeAllVisitsList.scope : "all"}/>
                                            
                                            </div>}

        <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Reminders</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            { this.props.globalData.todayReminderList 
              && <ReminderListView 
                  objects={this.props.globalData.todayReminderList} />}
          </Offcanvas.Body>
        </Offcanvas>

      </>
    )

  }
}

