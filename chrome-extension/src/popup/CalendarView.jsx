/*import './Calendar.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  appParams ,
  groupObjectsByDate,
  setGlobalDataSettings,
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

export default class CalendarView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      monthVisitsList: null,
      monthReminderList: null,
      selectedDate: (new Date()),
      activeStartDate: null,
      tabTitles: ["Profile Visits", "Reminders", "Activity List", "Time Chart"],
      tabActiveKey: "",
      toastMessage: "",
      toastShow: false,
      selectedDateProfiles: null,
    };

    this.onClickDay = this.onClickDay.bind(this);
    // this.onVisitsDataReceived = this.onVisitsDataReceived.bind(this);
    // this.onRemindersDataReceived = this.onRemindersDataReceived.bind(this);
    this.tileDisabled = this.tileDisabled.bind(this);
    this.onActiveStartDateChange = this.onActiveStartDateChange.bind(this);
    this.tileClassName = this.tileClassName.bind(this);
    this.isSelectedMonthResponse = this.isSelectedMonthResponse.bind(this);
    this.getDatePostCount = this.getDatePostCount.bind(this);
  }

  componentDidMount() {

    // Setting the nav default active key
    this.setState({
      tabActiveKey: this.state.tabTitles[0], 
      activeStartDate: moment(this.state.selectedDate).startOf('month').format("YYYY-MM-DD"),
    });

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus);
    }

    // Requesting this month's visits list
    // this.getMonthObjectList(this.state.selectedDate, dbData.objectStoreNames.VISITS);

    // this.getMonthObjectList(this.state.selectedDate, dbData.objectStoreNames.REMINDERS);

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

  getMonthObjectList(date, objectStoreName){

    const startOfMonth = moment(date).startOf('month').toDate();
    const endOfMonth   = moment(date).endOf('month').toDate();

    var timePeriod = [startOfMonth, "to", endOfMonth];

    var props = null;
    switch(objectStoreName){

      case dbData.objectStoreNames.REMINDERS: {
        props = {createdOn: timePeriod};
        break;
      }

      case dbData.objectStoreNames.VISITS: {
        props = {date: timePeriod};
        break;
      }

    };
    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, objectStoreName, { context: appParams.COMPONENT_CONTEXT_NAMES.CALENDAR+"|"+JSON.stringify(timePeriod), criteria: { props: props }});

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

      // var month = activeStartDate.getMonth() + 1;
      // month = (month >= 10 ? "" : "0") + month;

      // var activeDate = activeStartDate.getFullYear()+"-"+month+"-01";

      // this.setState({activeStartDate: activeDate}, () => {

      //   this.getMonthObjectList(activeDate, dbData.objectStoreNames.VISITS);
      //   this.getMonthObjectList(activeDate, dbData.objectStoreNames.REMINDERS);

      // });

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
    
    var date = value.toLocaleDateString();
    date = new Date(date);

    this.setState({selectedDate: date}, () => {

      var visitList = this.getDayObjectList(this.state.monthVisitsList),
          profileList = [];

      // Setting 'selectedDateProfiles' variable
      for (var visit of visitList){
        if (profileList.map(e => e.url).indexOf(visit.url) == -1){
          profileList.push(visit.profile);
        }
      }

      this.setState({selectedDateProfiles: profileList});

    });

  }

  // onVisitsDataReceived(message, sendResponse){

  //   var context = message.data.objectData.context; 
  //   if (context.indexOf(appParams.COMPONENT_CONTEXT_NAMES.CALENDAR) == -1){
  //     return;
  //   }

  //   // acknowledge receipt
  //   ack(sendResponse);

  //   var monthVisitsList = message.data.objectData.list;

  //   // Following code essential to avoid crossover between calendar tabs
  //   if (!this.isSelectedMonthResponse(context)){
  //     return;
  //   }

  //   // Grouping the visits by date
  //   var results = groupObjectsByDate(monthVisitsList);

  //   this.setState({monthVisitsList: results}, () => {

  //     var profileList = [];

  //     // Setting 'selectedDateProfiles' variable
  //     for (var visit of this.getDayObjectList(this.state.monthVisitsList)){
  //       if (profileList.map(e => e.url).indexOf(visit.url) == -1){
  //         profileList.push(visit.profile);
  //       }
  //     }

  //     this.setState({selectedDateProfiles: profileList});

  //   });

  // }

  getDatePostCount(){

    var visits = this.getDayObjectList(this.state.monthVisitsList),
        count = 0;

    for (var visit of visits){
      count += (visit.profile.activity ? visit.profile.activity.length : 0);
    }

    return count;

  }

  isSelectedMonthResponse(context){
    context = context.replace(appParams.COMPONENT_CONTEXT_NAMES.CALENDAR, "");
    context = context.replace("|", "");
    var timePeriod = JSON.parse(context);

    var activeStartDate = new Date(this.state.activeStartDate);
    if ((new Date(timePeriod[0])) <= activeStartDate && activeStartDate <= (new Date(timePeriod[2]))){
      return true;
    }

    return false;

  }

  // onRemindersDataReceived(message, sendResponse){

  //   var context = message.data.objectData.context; 
  //   if (context.indexOf(appParams.COMPONENT_CONTEXT_NAMES.CALENDAR) == -1){
  //     return;
  //   }

  //   // acknowledge receipt
  //   ack(sendResponse);

  //   var monthReminderList = message.data.objectData.list;

  //   // Following code essential to avoid crossover between calendar tabs
  //   if (!this.isSelectedMonthResponse(context)){
  //     return;
  //   }

  //   // Grouping the reminders by date
  //   var results = groupObjectsByDate(monthReminderList);

  //   this.setState({monthReminderList: results});

  // }

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
                <a href={`/index.html?view=FeedDash&data=${moment(this.state.selectedDate).toISOString()}`} target="_blank" class="mx-1">feed</a> 
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
                                                          { (index == 2 && this.getDayObjectList(this.state.monthVisitsList)) && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">{this.getDatePostCount()}</span>}
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

                  { this.state.tabActiveKey == this.state.tabTitles[2] && <ProfileActivityListView 
                                                                            objects={this.state.selectedDateProfiles} 
                                                                            variant="timeline"/>}

                  { this.state.tabActiveKey == this.state.tabTitles[3] && <DailyVisitsBarChart 
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
