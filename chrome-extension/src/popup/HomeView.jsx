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
import ProfileListItemView from "./widgets/ProfileListItemView";
import { Offcanvas } from "react-bootstrap";
import ReminderListView from "./widgets/ReminderListView";
import SearchInputView from "./widgets/SearchInputView";
import SearchPostFormView from "./widgets/SearchPostFormView";
import party_popper_icon from '../assets/party-popper_icon.png';
import { 
  saveCurrentPageTitle, 
  appParams, 
  deactivateTodayReminders,
  dbData,
  setGlobalDataHomeAllVisitsList,
  getProfileDataFrom,
  getVisitsTotalTime,
} from "./Local_library";
import eventBus from "./EventBus";
import { db } from "../db";
import { DateTime as LuxonDateTime } from "luxon";

export default class HomeView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      currentTabIndex: 0,
      offCanvasShow: false,
      offCanvasTitle: null,
      previousDaySavedTime: null, 
      outdatedProfiles: null,
    };

    // Binding all the needed functions
    this.getVisitList = this.getVisitList.bind(this);
    this.switchCurrentTab = this.switchCurrentTab.bind(this);
    this.checkPreviousDaySavedTime = this.checkPreviousDaySavedTime.bind(this);
    this.checkOutdatedProfiles = this.checkOutdatedProfiles.bind(this);

  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.HOME);

    if (!this.props.globalData.homeTodayVisitsList){
      this.getVisitList("today");
    }

    // check if the previous day, the user has been able to stick to its goal of saving time through the extension
    this.checkPreviousDaySavedTime();

    this.checkOutdatedProfiles();
    
  }

  async checkOutdatedProfiles(){

    var tippingPoint = null;

    const settings = await db.settings
                             .where({id: 1})
                             .first();

    if (settings.outdatedProfileReminder == "Never"){
      return;
    }

    const localItems = await chrome.storage.local.get(["outdatedProfileReminderMoment"]);
    if (localItems.outdatedProfileReminderMoment && LuxonDateTime.now().diff(LuxonDateTime.fromISO(localItems.outdatedProfileReminderMoment), "days").days < 7){
      return;
    }

    switch(settings.outdatedProfileReminder){

      case "> 1 month":{
        tippingPoint = LuxonDateTime.now().minus({months:1}).toJSDate();
        break;
      }

      case "> 6 months":{
        tippingPoint = LuxonDateTime.now().minus({months:1}).toJSDate();
        break;
      }

      case "> 1 year":{
        tippingPoint = LuxonDateTime.now().minus({years:1}).toJSDate();
        break;
      }

    }

    const visits = await db.visits
                           .filter(visit => new Date(visit.date) < tippingPoint
                                            && Object.hasOwn(visit, "profileData"))
                           .sortBy("date");

    var profiles = [];
    for (var visit of visits){

      const index = profiles.map(p => p.url).indexOf(visit.url);
      if (index == -1){

        var profile = await getProfileDataFrom(db, visit.url);
        profiles.push(profile);

      }

    }

    this.setState({outdatedProfiles: profiles});

  }

  async checkPreviousDaySavedTime(){

    const settings = await db.settings
                             .where({id: 1})
                             .first();

    if (settings.maxTimeAlarm == "Never"){
      return;
    }

    const localItems = await chrome.storage.local.get(["previousDaySavedTimeMoment"]);
    if (localItems.previousDaySavedTimeMoment && localItems.previousDaySavedTimeMoment.split("T")[0] == new Date().toISOString().split("T")[0]){
      return;
    }

    const visits = await db.visits
                          .where("date")
                          .startsWith(LuxonDateTime.now().minus({days:1}).toISO().split("T")[0])
                          .toArray();

    if (!visits.length){
      return;
    }

    const totalTime = getVisitsTotalTime(visits); // in minutes
    const maxTimeValue = settings.maxTimeAlarm == "1 hour" ? 60 : Number(settings.maxTimeAlarm.slice(0, 2));

    if (totalTime < maxTimeValue){
      this.setState({previousDaySavedTime: (maxTimeValue - totalTime)});
    }

  }

  componentDidUpdate(prevProps, prevState){

  }

  componentWillUnmount() {

  }

  handleOffCanvasClose = () => {this.setState({offCanvasShow: false}, 
      () => {
        switch(this.state.offCanvasTitle){
          case "Reminders":{
            deactivateTodayReminders(db);
            eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "todayReminderList", value: null});
            break;
          }
          case "Saved time":{
            this.setState({previousDaySavedTime: null});
            chrome.storage.local.set({ previousDaySavedTimeMoment: new Date().toISOString() });
            break;
          }
          case "Outdated profiles":{
            this.setState({outdatedProfiles: null});
            chrome.storage.local.set({ outdatedProfileReminderMoment: new Date().toISOString() });
            break;
          }
        }

        this.setState({offCanvasTitle: null});
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

                visit.profileData = await getProfileDataFrom(db, visit.url);
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
          <HomeMenuView 
            globalData={this.props.globalData} 
            handleOffCanvasShow={this.handleOffCanvasShow} 
            args={{
              previousDaySavedTime: this.state.previousDaySavedTime,
              outdatedProfiles: this.state.outdatedProfiles,
            }}
            />
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

            { this.state.offCanvasTitle == "Saved time"
                && <div class="text-center">
                    <img 
                      src={party_popper_icon} 
                      alt="twbs" 
                      width="100" 
                      height="100" 
                      class=""/>

                    <p class="mt-3">
                      <span class="badge text-bg-light fst-italic shadow text-muted border border-success">
                        Congratulations! You've saved {this.state.previousDaySavedTime.toFixed(2)} minutes yesterday
                      </span>
                    </p>
                </div>}

            { this.state.offCanvasTitle == "Outdated profiles"
                && this.state.outdatedProfiles.map(profile => <ProfileListItemView profile={profile}/>)}

          </Offcanvas.Body>
        </Offcanvas>

      </>
    )

  }
}

