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
} from "./Local_library";
import { Calendar as Cal } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import VisitListView from "./widgets/VisitListView";
import moment from 'moment';
import ReminderListView from "./widgets/ReminderListView";
import PageTitleView from "./widgets/PageTitleView";
import CustomToast from "./widgets/toasts/CustomToast";
import DailyVisitsBarChart from "./widgets/charts/DailyVisitsBarChart";
import ProfileActivityListView from "./widgets/ProfileActivityListView";
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
      tabTitles: ["Profile Visits", "Reminders", "Time Chart"],
      tabActiveKey: "",
      toastMessage: "",
      toastShow: false,
    };

    this.onClickDay = this.onClickDay.bind(this);
    this.tileDisabled = this.tileDisabled.bind(this);
    this.onActiveStartDateChange = this.onActiveStartDateChange.bind(this);
    this.tileClassName = this.tileClassName.bind(this);
  }

  componentDidMount() {

    // Setting the nav default active key
    this.setState({
      tabActiveKey: this.state.tabTitles[0], 
      activeStartDate: moment(this.state.selectedDate).startOf('month').format("YYYY-MM-DD"),
    });

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

    // Requesting this month's visits list
    this.getMonthObjectList(this.state.selectedDate, dbData.objectStoreNames.VISITS);

    this.getMonthObjectList(this.state.selectedDate, dbData.objectStoreNames.REMINDERS);

  }

  componentDidUpdate(prevProps, prevState){

  }

  getDayObjectList(monthObjectList){

    var list = null;
    var dateString = moment(this.state.selectedDate).format("YYYY-MM-DD");

    if (monthObjectList){
      if (dateString in monthObjectList){
        list = monthObjectList[dateString];
      }
      else{
        list = [];
      }
    }
    else{
      list = null;
    }

    return list;

  }

  async getMonthObjectList(date, objectStoreName){

    const startOfMonth = moment(date).startOf('month').toDate();
    const endOfMonth   = moment(date).endOf('month').toDate();

    var props = null;
    switch(objectStoreName){

      case dbData.objectStoreNames.REMINDERS: {

        var monthReminderList = await db.reminders
                                         .filter(reminder => (startOfMonth <= new Date(reminder.createdOn) && new Date(reminder.createdOn) <= endOfMonth))
                                         .toArray();

        // Grouping the reminders by date
        var results = groupObjectsByDate(monthReminderList);

        this.setState({monthReminderList: results});

        break;
      }

      case dbData.objectStoreNames.VISITS: {

        var monthVisitsList = await db.visits
                             .filter(visit => (startOfMonth <= new Date(visit.date) && new Date(visit.date) <= endOfMonth)
                                                && Object.hasOwn(visit, "profileData"))
                             .toArray();

        // Grouping the visits by date
        var results = groupObjectsByDate(monthVisitsList);

        this.setState({monthVisitsList: results});

        break;
      }

    };
  


  }

  tileDisabled({ activeStartDate, date, view }){

    if (view != "month"){
      return false;
    }
    
    date = date.toLocaleDateString();
    date = new Date(moment(new Date(date)).format("YYYY-MM-DD"));

    return date < (new Date(this.props.globalData.settings.lastDataResetDate.split('T')[0])); 

  }

  onActiveStartDateChange({ action, activeStartDate, value, view }){

    console.log('Changed view to: ', activeStartDate, view, activeStartDate.getMonth());
    
    if (view === "month"){

      var month = activeStartDate.getMonth() + 1;
      month = (month >= 10 ? "" : "0") + month;

      var activeDate = activeStartDate.getFullYear()+"-"+month+"-01";

      this.setState({activeStartDate: activeDate}, () => {

        this.getMonthObjectList(activeDate, dbData.objectStoreNames.VISITS);
        this.getMonthObjectList(activeDate, dbData.objectStoreNames.REMINDERS);

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
    date = moment(new Date(date)).format("YYYY-MM-DD");

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
              { this.props.globalData.settings && <Cal onClickDay={this.onClickDay} 
                            tileDisabled={this.tileDisabled} 
                            onActiveStartDateChange={this.onActiveStartDateChange} 
                            value={new Date()} 
                            tileClassName={this.tileClassName}
                            className="rounded shadow-lg"/>}
            </div>
            <div class="col-7 ps-3">
              <div>
                <span class="badge shadow text-muted border border-warning mb-2">{moment(this.state.selectedDate).format('dddd, MMMM Do YYYY')}</span>
              </div>
              <div class="small shadow-sm mb-3 mt-2 p-1 fst-italic border-start border-info ps-2 border-4 bg-info-subtle text-muted">
                Explore 
                <a href={`/index.html?view=FeedDash&data=${JSON.stringify({from: moment(this.state.selectedDate).toISOString(), to: moment(this.state.selectedDate).toISOString()})}`} target="_blank" class="mx-1">feed</a> 
                data as well for that {moment(this.state.selectedDate).format('dddd, MMMM Do YYYY').split(",")[0].toLowerCase()}
              </div>
              <Card className="shadow">
                <Card.Header>
                  <Nav 
                    variant="tabs" 
                    activeKey={this.state.tabActiveKey}
                    onSelect={this.onNavSelectKey}>

                    {this.state.tabTitles.map((tabTitle, index) => (
                                                      <Nav.Item>
                                                        <Nav.Link href={"#"+tabTitle} eventKey={tabTitle}>
                                                          {tabTitle}
                                                          { (index == 0 && this.getDayObjectList(this.state.monthVisitsList)) && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">{this.getDayObjectList(this.state.monthVisitsList).length}</span>}
                                                          { (index == 1 && this.getDayObjectList(this.state.monthReminderList)) && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">{this.getDayObjectList(this.state.monthReminderList).length}</span>}
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
                  { this.state.tabActiveKey == this.state.tabTitles[0] && <VisitListView 
                                                                            objects={this.getDayObjectList(this.state.monthVisitsList)} 
                                                                            seeMore={() => {}} 
                                                                            loading={false} 
                                                                            visitLeft={false}/>}

                  { this.state.tabActiveKey == this.state.tabTitles[1] && <ReminderListView 
                                                                            objects={this.getDayObjectList(this.state.monthReminderList)}/>}

                  { this.state.tabActiveKey == this.state.tabTitles[2] && <DailyVisitsBarChart 
                                                                            objects={this.getDayObjectList(this.state.monthVisitsList)}/>}

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
