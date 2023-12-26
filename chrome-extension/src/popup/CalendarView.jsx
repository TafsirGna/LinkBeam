/*import './Calendar.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  sendDatabaseActionMessage, 
  ack, 
  startMessageListener, 
  messageParams, 
  dbData, 
  appParams ,
  groupObjectsByDate,
} from "./Local_library";
import { Calendar as Cal } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import SearchListView from "./widgets/SearchListView";
import moment from 'moment';
import ReminderListView from "./widgets/ReminderListView";
import PageTitleView from "./widgets/PageTitleView";
import CustomToast from "./widgets/toasts/CustomToast";
import DailySearchTimeChart from "./widgets/charts/DailySearchTimeChart";
import ProfileActivityListView from "./widgets/ProfileActivityListView";

export default class CalendarView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      monthSearchList: null,
      monthReminderList: null,
      selectedDate: (new Date()),
      activeStartDate: null,
      tabTitles: ["Searches", "Reminders", "Activity List", "Time Chart"],
      tabActiveKey: "",
      toastMessage: "",
      toastShow: false,
    };

    this.onClickDay = this.onClickDay.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSearchesDataReceived = this.onSearchesDataReceived.bind(this);
    this.onRemindersDataReceived = this.onRemindersDataReceived.bind(this);
    this.tileDisabled = this.tileDisabled.bind(this);
    this.onActiveStartDateChange = this.onActiveStartDateChange.bind(this);
    this.tileClassName = this.tileClassName.bind(this);
    this.isSelectedMonthResponse = this.isSelectedMonthResponse.bind(this);
  }

  componentDidMount() {

    // Setting the nav default active key
    this.setState({
      tabActiveKey: this.state.tabTitles[0], 
      activeStartDate: moment(this.state.selectedDate).startOf('month').format("YYYY-MM-DD"),
    });

    this.listenToMessages();

    if (!Object.hasOwn(this.props.globalData.settings, 'lastDataResetDate')){
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, { context: appParams.COMPONENT_CONTEXT_NAMES.CALENDAR, criteria: { props: ["lastDataResetDate"] }});
    }
    else{

    }

    // Requesting this month's search list
    this.getMonthObjectList(this.state.selectedDate, dbData.objectStoreNames.SEARCHES);

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

      case dbData.objectStoreNames.SEARCHES: {
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
    
    return date < (new Date(this.props.globalData.settings.lastDataResetDate)); // || date > (new Date());
  }

  onActiveStartDateChange({ action, activeStartDate, value, view }){

    console.log('Changed view to: ', activeStartDate, view, activeStartDate.getMonth());
    
    if (view === "month"){

      var month = activeStartDate.getMonth() + 1;
      month = (month >= 10 ? "" : "0") + month;

      var activeDate = activeStartDate.getFullYear()+"-"+month+"-01";

      this.setState({activeStartDate: activeDate}, () => {

        this.getMonthObjectList(activeDate, dbData.objectStoreNames.SEARCHES);
        this.getMonthObjectList(activeDate, dbData.objectStoreNames.REMINDERS);

      });

    }

  }

  tileClassName({ activeStartDate, date, view }){

    if (view != "month"){
      return null;
    }

    if (!this.state.monthReminderList && !this.state.monthSearchList){
      return null
    }

    var date = date.toLocaleString().split(",")[0];
    date = moment(new Date(date)).format("YYYY-MM-DD");

    // month reminder list
    if (this.state.monthReminderList && date in this.state.monthReminderList){
      return "bg-info text-white shadow";
    }

    // month search list
    if (this.state.monthSearchList && date in this.state.monthSearchList){
      return "bg-warning text-black shadow text-muted";
    }


    return null;

  }

  onClickDay(value, event){
    
    var date = value.toLocaleString().split(",")[0];
    date = new Date(date);

    this.setState({selectedDate: date}, () => {

      var searchList = this.getDayObjectList(this.state.monthSearchList),
          reminderList = this.getDayObjectList(this.state.monthReminderList);

      if (searchList.length == 0){
        this.onNavSelectKey(this.state.tabTitles[1]);
      }

      if (reminderList.length == 0){
        this.onNavSelectKey(this.state.tabTitles[0]);
      }

    });

  }

  onSearchesDataReceived(message, sendResponse){

    var context = message.data.objectData.context; 
    if (context.indexOf(appParams.COMPONENT_CONTEXT_NAMES.CALENDAR) == -1){
      return;
    }

    // acknowledge receipt
    ack(sendResponse);

    var monthSearchList = message.data.objectData.list;

    // Following code essential to avoid crossover between calendar tabs
    if (!this.isSelectedMonthResponse(context)){
      return;
    }

    // Grouping the searches by date
    var results = groupObjectsByDate(monthSearchList);

    this.setState({monthSearchList: results});

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

  onRemindersDataReceived(message, sendResponse){

    var context = message.data.objectData.context; 
    if (context.indexOf(appParams.COMPONENT_CONTEXT_NAMES.CALENDAR) == -1){
      return;
    }

    // acknowledge receipt
    ack(sendResponse);

    var monthReminderList = message.data.objectData.list;

    // Following code essential to avoid crossover between calendar tabs
    if (!this.isSelectedMonthResponse(context)){
      return;
    }

    // Grouping the reminders by date
    var results = groupObjectsByDate(monthReminderList);

    this.setState({monthReminderList: results});

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.SEARCHES].join(messageParams.separator), 
        callback: this.onSearchesDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.REMINDERS].join(messageParams.separator), 
        callback: this.onRemindersDataReceived
      },
    ]);

  }

  onNavSelectKey = (selectedKey) => {

    this.setState({tabActiveKey: selectedKey});

  }

  render(){
    return (
			<>
        <div class="mt-5 pb-5 pt-3">
          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.CALENDAR}/>

  				<div class="offset-1 col-10 mt-4 row">
            <div class="col-4">
              { this.props.globalData.settings.lastDataResetDate && <Cal onClickDay={this.onClickDay} 
                            tileDisabled={this.tileDisabled} 
                            onActiveStartDateChange={this.onActiveStartDateChange} 
                            value={new Date()} 
                            tileClassName={this.tileClassName}
                            className="rounded shadow"/>}
            </div>
            <div class="col-7 ps-3">
              <div>
                <span class="badge shadow text-muted border border-warning mb-2">{this.state.selectedDate.toString()}</span>
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
                                                          { (index == 0 && this.getDayObjectList(this.state.monthSearchList)) && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">{this.getDayObjectList(this.state.monthSearchList).length}</span>}
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
                  { this.state.tabActiveKey == this.state.tabTitles[0] && 
                          <SearchListView objects={this.getDayObjectList(this.state.monthSearchList)} seeMore={() => {}} loading={false} searchLeft={false}/>}

                  { this.state.tabActiveKey == this.state.tabTitles[1] && <ReminderListView objects={this.getDayObjectList(this.state.monthReminderList)}/>}

                  { this.state.tabActiveKey == this.state.tabTitles[2] && <ProfileActivityListView objects={this.getDayObjectList(this.state.monthSearchList)}/>}

                  { this.state.tabActiveKey == this.state.tabTitles[3] && <DailySearchTimeChart objects={this.getDayObjectList(this.state.monthSearchList)}/>}

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
