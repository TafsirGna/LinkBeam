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

/*import './Calendar.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  appParams ,
  groupObjectsByDate,
  setGlobalDataSettings,
  dbData,
  isLinkedinProfilePage,
  setReminderObject,
  getProfileDataFrom,
} from "./Local_library";
import { Calendar as Cal } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import VisitListView from "./widgets/VisitListView";
import { DateTime as LuxonDateTime } from "luxon";
import ReminderListView from "./widgets/ReminderListView";
import PageTitleView from "./widgets/PageTitleView";
import CustomToast from "./widgets/toasts/CustomToast";
import DailyVisitsBarChart from "./widgets/charts/DailyVisitsBarChart";
import app_logo from '../assets/app_logo.png';
import { db } from "../db";
import eventBus from "./EventBus";
import { liveQuery } from "dexie"; 

export default class CalendarView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      monthVisitsList: null,
      monthReminderList: null,
      selectedDate: (new Date()),
      activeStartDate: null,
      tabTitles: ["Visits", "Time Chart"],
      tabActiveKey: "",
      toastMessage: "",
      toastShow: false,
      dataType: null,
      processing: false,
    };

    this.onClickDay = this.onClickDay.bind(this);
    this.tileDisabled = this.tileDisabled.bind(this);
    this.onActiveStartDateChange = this.onActiveStartDateChange.bind(this);
    this.tileClassName = this.tileClassName.bind(this);
  }

  componentDidMount() {

    const urlParams = new URLSearchParams(window.location.search);
    const dataType = urlParams.get("dataType");
    var currentDate = urlParams.get("currentDate");
    if (currentDate){
      currentDate = new Date(currentDate);
      this.setState({selectedDate: currentDate});
    }

    if (!dataType){
      return;
    }

    // Setting the nav default active key
    this.setState({
      tabActiveKey: dataType, 
      activeStartDate: LuxonDateTime.fromJSDate(currentDate || this.state.selectedDate).startOf('month').toFormat("yyyy-MM-dd"),
      dataType: dataType,
    });

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

    this.getMonthObjectList((currentDate || this.state.selectedDate), dataType.toLowerCase());

  }

  componentDidUpdate(prevProps, prevState){

  }

  getDayObjectList(monthObjectList){

    var dateString = LuxonDateTime.fromJSDate(this.state.selectedDate).toFormat("yyyy-MM-dd");

    if (monthObjectList){
      return dateString in monthObjectList ? monthObjectList[dateString] : [];
    }

    return null;

  }

  getMonthObjectList(date, objectStoreName){

    this.setState({processing: true}, async () => {

      const startOfMonth = LuxonDateTime.fromJSDate(date).startOf('month').toJSDate();
      const endOfMonth   = LuxonDateTime.fromJSDate(date).endOf('month').toJSDate();

      var monthList = null;
      switch(objectStoreName){

        case dbData.objectStoreNames.REMINDERS: {

          monthList = await db.reminders
                                           .filter(reminder => (startOfMonth <= new Date(reminder.createdOn) && new Date(reminder.createdOn) <= endOfMonth))
                                           .toArray();

          await Promise.all (monthList.map (async reminder => {

            await setReminderObject(db, reminder);

          }));

          this.setState({monthReminderList: groupObjectsByDate(monthList), processing: false});

          break;
        }

        case dbData.objectStoreNames.VISITS: {

          monthList = await db.visits
                               .filter(visit => (startOfMonth <= new Date(visit.date) && new Date(visit.date) <= endOfMonth))
                               .toArray();

          var profiles = [];
          for (var visit of monthList){

            if (!Object.hasOwn(visit, "profileData")){
              continue;
            }

            const index = profiles.map(p => p.url).indexOf(visit.url);
            if (index != -1){
              visit.profileData = profiles[index];
            }
            else{
              visit.profileData = await getProfileDataFrom(db, visit.url);
              profiles.push(visit.profileData);
            }

          }

          this.setState({monthVisitsList: groupObjectsByDate(monthList), processing: false});

          break;
        }

      };

    });
  
  }

  tileDisabled({ activeStartDate, date, view }){

    if (view != "month"){
      return false;
    }
    
    date = date.toLocaleDateString();
    date = new Date(LuxonDateTime.fromJSDate(new Date(date)).toFormat("yyyy-MM-dd"));

    return date < (new Date(this.props.globalData.settings.lastDataResetDate.split('T')[0])); 

  }

  onActiveStartDateChange({ action, activeStartDate, value, view }){

    console.log('Changed view to: ', activeStartDate, view, activeStartDate.getMonth());
    
    if (view === "month"){

      this.setState({activeStartDate: activeStartDate}, () => {
        this.getMonthObjectList(activeStartDate, this.state.dataType.toLowerCase());
      });

    }

  }

  tileClassName({ activeStartDate, date, view }){

    if (view != "month"){
      return null;
    }

    if (!this.state.monthReminderList && !this.state.monthVisitsList){
      return null
    }

    var date = date.toLocaleDateString();
    date = LuxonDateTime.fromJSDate(new Date(date)).toFormat("yyyy-MM-dd");

    // month reminder list
    if (this.state.monthReminderList && date in this.state.monthReminderList){
      return "bg-info text-white shadow";
    }

    // month visits list
    if (this.state.monthVisitsList && date in this.state.monthVisitsList){
      return "bg-warning text-black shadow text-muted";
    }


    return null;

  }

  onClickDay(value, event){
    
    var date = new Date(value.toLocaleDateString());

    this.setState({selectedDate: date});

  }

  onNavSelectKey = (selectedKey) => {

    this.setState({tabActiveKey: selectedKey});

  }

  render(){
    return (
			<>
        <div class="mt-5 pb-5 pt-3">

          <div class="text-center">
            <img src={app_logo}  alt="" width="40" height="40"/>
            <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.CALENDAR}/>
          </div>

  				<div class="offset-1 col-10 mt-4 row">
            <div class="col-4">
              { this.state.processing
                  && <div>
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>}
              { this.props.globalData.settings 
                  && <Cal 
                        onClickDay={this.onClickDay} 
                        tileDisabled={this.tileDisabled} 
                        onActiveStartDateChange={this.onActiveStartDateChange} 
                        value={new Date((new URLSearchParams(window.location.search)).get("currentDate") || (new Date()).toISOString())} 
                        tileClassName={this.tileClassName}
                        className="rounded shadow"/>}
            </div>
            <div class="col-7 ps-3">
              <div>
                <span class="badge shadow text-muted border border-warning mb-2">{LuxonDateTime.fromJSDate(this.state.selectedDate).toLocaleString(LuxonDateTime.DATE_FULL)}</span>
              </div>
              <div class="small shadow-sm mb-3 mt-2 p-1 fst-italic border-start border-info ps-2 border-4 bg-info-subtle text-muted">
                Explore 
                <a href={`/index.html?view=FeedDash&data=${JSON.stringify({from: LuxonDateTime.fromJSDate(this.state.selectedDate).toISO(), to: LuxonDateTime.fromJSDate(this.state.selectedDate).toISO()})}`} target="_blank" class="mx-1">feed</a> 
                data as well for that {LuxonDateTime.fromJSDate(this.state.selectedDate).toLocaleString({weekday: 'long'})}
              </div>
              <Card className="shadow">
                <Card.Header>
                  <Nav 
                    variant="tabs" 
                    activeKey={this.state.tabActiveKey}
                    onSelect={this.onNavSelectKey}>

                    {this.state.dataType == "Reminders"
                      && <Nav.Item>
                          <Nav.Link href="#Reminders" eventKey="Reminders">
                            Reminders
                            { this.getDayObjectList(this.state.monthReminderList)
                                && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">{this.getDayObjectList(this.state.monthReminderList).length}</span>}
                          </Nav.Link>
                        </Nav.Item>}

                    {this.state.dataType == "Visits" 
                      && this.state.tabTitles.map((tabTitle, index) => (
                                                      <Nav.Item>
                                                        <Nav.Link href={`#${tabTitle}`} eventKey={tabTitle}>
                                                          {tabTitle}
                                                          { (index == 0 
                                                                && this.getDayObjectList(this.state.monthVisitsList)) 
                                                              && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">{this.getDayObjectList(this.state.monthVisitsList).length}</span>}
                                                        </Nav.Link>
                                                      </Nav.Item>
                                                    ))}

                  </Nav>
                </Card.Header>
                <Card.Body>
                  {/*<Card.Title>Special title treatment</Card.Title>
                  <Card.Text>
                    With supporting text below as a natural lead-in to additional content.
                  </Card.Text>*/}

                  { this.state.dataType == "Reminders" 
                      && <ReminderListView 
                            objects={this.getDayObjectList(this.state.monthReminderList)}/>}

                  { this.state.dataType == "Visits"
                      && <div>

                          { this.state.tabActiveKey == this.state.tabTitles[0] 
                              && <VisitListView 
                                  objects={this.getDayObjectList(this.state.monthVisitsList)} 
                                  seeMore={() => {}} 
                                  loading={false} 
                                  visitLeft={false}/>}

                          { this.state.tabActiveKey == this.state.tabTitles[1] 
                              && <DailyVisitsBarChart 
                                  objects={this.getDayObjectList(this.state.monthVisitsList)}/>}

                      </div>}

                </Card.Body>
              </Card>
            </div>
          </div>

          <CustomToast globalData={this.props.globalData} />
        </div>
        
	    </>
    );
  }
}
