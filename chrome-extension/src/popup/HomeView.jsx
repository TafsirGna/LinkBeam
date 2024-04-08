/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

import React from 'react';
import HomeMenuView from "./widgets/HomeMenuView";
import VisitListView from "./widgets/VisitListView";
import AggregatedVisitListView from "./widgets/AggregatedVisitListView";
import { OverlayTrigger, Tooltip as ReactTooltip, Offcanvas } from "react-bootstrap";
import ReminderListView from "./widgets/ReminderListView";
import SearchInputView from "./widgets/SearchInputView";
import SearchPostFormView from "./widgets/SearchPostFormView";
import { 
  saveCurrentPageTitle, 
  appParams, 
  deactivateTodayReminders,
  dbData,
  setGlobalDataHomeAllVisitsList,
  getProfileDataFrom,
} from "./Local_library";
import eventBus from "./EventBus";
import { db } from "../db";

export default class HomeView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      currentTabIndex: 0,
      offCanvasShow: false,
      offCanvasTitle: null,
    };

    // Binding all the needed functions
    this.getVisitList = this.getVisitList.bind(this);
    this.switchCurrentTab = this.switchCurrentTab.bind(this);

  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.HOME);

    if (!this.props.globalData.homeTodayVisitsList){
      this.getVisitList("today");
    }
    
  }

  componentDidUpdate(prevProps, prevState){

  }

  componentWillUnmount() {

  }

  handleOffCanvasClose = () => {this.setState({offCanvasShow: false, offCanvasTitle: null}, 
      () => {
        deactivateTodayReminders(db);
        eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "todayReminderList", value: null});
      }
    )
  };

  handleOffCanvasShow = (title) => {
      this.setState({
        offCanvasShow: true,
        offCanvasTitle: title,
      }
    );
  };

  //   // hiding the popup
  //   // window.close();

  // Function for switching between tabs
  switchCurrentTab(index){

    this.setState({currentTabIndex: index});

    switch(index){
      case 0:{
        break;
      }
      case 1: {
        
        if (!this.props.globalData.homeAllVisitsList){
          
          var homeAllVisitsList = {list: this.props.globalData.homeTodayVisitsList, action: "display_all", inc: 0};
          eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "homeAllVisitsList", value: homeAllVisitsList});

        }

        break;
      }
    }

  }

  // Function requesting the list of all visits made
  getVisitList(action){

    if (action == "display_all"){

      setGlobalDataHomeAllVisitsList(db, eventBus, this.props.globalData);

    }
    else{ // today      

      (async () => {
        
        var visits = [];
        try{

          visits = await db
                         .visits
                         .where("date")
                         .startsWith((new Date()).toISOString().split("T")[0])
                         .toArray();

          var profiles = [];

          for (var visit of visits){

            if (Object.hasOwn(visit, "profileData")){

              const index = profiles.map(p => p.url).indexOf(visit.url);
              if (index == -1){

                const profileVisits = await db.visits
                                          .where('url')
                                          .equals(url)
                                          .sortBy("date");


                visit.profileData = getProfileDataFrom(profileVisits);
                visit.profileData.url = visit.url;
                profiles.push(visit.profileData);

              }
              else{
                visit.profileData = profiles[index];
              }
              
            }

          }

        }
        catch(error){
          console.error("Error : ", error);
        }

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
              Today {(this.props.globalData.homeTodayVisitsList && this.props.globalData.homeTodayVisitsList.length) ? `(${this.props.globalData.homeTodayVisitsList.length})` : null}
            </button>
            <button type="button" class={"btn btn-secondary badge" + (this.state.currentTabIndex == 1 ? " active " : "")} title="All visits" onClick={() => {this.switchCurrentTab(1)}}>
              All {(this.props.globalData.homeAllVisitsList) ? `(${this.props.globalData.homeAllVisitsList.list.length})` : null}
            </button>
          </div>
        </div>

        {/* Today visits List Tab */}
        { this.state.currentTabIndex == 0 && <div class="mt-4">
                                                <VisitListView 
                                                  objects={this.props.globalData.homeTodayVisitsList}/>
                                              </div>}

        {/* All visits List Tab */}
        { this.state.currentTabIndex == 1 && <div>

                                              { this.props.globalData.homeAllVisitsList 
                                                && (this.props.globalData.homeAllVisitsList.list.length != 0 || (this.props.globalData.homeAllVisitsList.list.length == 0 && this.props.globalData.homeAllVisitsList.action == "search"))
                                                && <SearchInputView 
                                                      objectStoreName={dbData.objectStoreNames.VISITS} 
                                                      globalData={this.props.globalData} />}

                                              <AggregatedVisitListView 
                                                object={this.props.globalData.homeAllVisitsList} 
                                                seeMore={() => {this.getVisitList("display_all")}} />
                                            
                                            </div>}

        <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>{this.state.offCanvasTitle}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            
            { this.state.offCanvasTitle == "Reminders" 
                && this.props.globalData.todayReminderList 
                && <ReminderListView 
                    objects={this.props.globalData.todayReminderList} />}

            { this.state.offCanvasTitle == "Posts"
                && <SearchPostFormView/>}

          </Offcanvas.Body>
        </Offcanvas>

      </>
    )

  }
}

