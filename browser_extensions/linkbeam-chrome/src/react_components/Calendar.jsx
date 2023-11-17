/*import './Calendar.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { sendDatabaseActionMessage, ack, startMessageListener, messageParams, dbData, appParams } from "./Local_library";
import { Calendar as Cal } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import SearchListView from "./widgets/SearchListView";
import moment from 'moment';
import ReminderListView from "./widgets/ReminderListView";
import CustomToast from "./widgets/CustomToast";

export default class Calendar extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      monthSearchList: null,
      monthReminderList: null,
      selectedDate: (new Date()).toISOString().split("T")[0],
      tabTitles: ["Searches", "Reminders"],
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
  }

  componentDidMount() {

    // Setting the nav default active key
    this.setState({tabActiveKey: this.state.tabTitles[0]});

    this.listenToMessages();

    // Requesting this month's search list
    this.getMonthObjectList(this.state.selectedDate, dbData.objectStoreNames.SEARCHES);

    this.getMonthObjectList(this.state.selectedDate, dbData.objectStoreNames.REMINDERS);

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.globalData.todayReminderList != this.props.globalData.todayReminderList){

      // Setting the toast
      if (this.props.globalData.todayReminderList){
        var message = this.props.globalData.todayReminderList.length + " Reminders set for today !";
        this.toggleToastShow(message);
      }

    }

  }

  toggleToastShow = (message = "") => this.setState((prevState) => ({toastMessage: message, toastShow: !prevState.toastShow}));

  getDayObjectList(monthObjectList){

    var list = null;

    if (monthObjectList){
      if (this.state.selectedDate in monthObjectList){
        list = monthObjectList[this.state.selectedDate]
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

  getMonthObjectList(dateString, objectStoreName){

    // Reformatting the date string before sending the request
    var separator = "-";
    dateString = dateString.split(separator);
    dateString[dateString.length - 1] = "?";
    dateString = dateString.join(separator);

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, objectStoreName, {date: dateString, context: appParams.COMPONENT_CONTEXT_NAMES.CALENDAR});

  }

  tileDisabled({ activeStartDate, date, view }){

    if (view != "month" || !this.state.monthSearchList){
      return false;
    }

    date = date.toISOString().split("T")[0];
    return !(date in this.state.monthSearchList);
  }

  onActiveStartDateChange({ action, activeStartDate, value, view }){

    console.log('Changed view to: ', activeStartDate, view, activeStartDate.getMonth());
    
    if (view === "month"){

      var month = activeStartDate.getMonth() + 1;
      month = (month >= 10 ? "" : "0") + month;

      var activeDate = activeStartDate.getFullYear()+"-"+month+"-01";

      this.getMonthObjectList(activeDate, dbData.objectStoreNames.SEARCHES);

      this.getMonthObjectList(activeDate, dbData.objectStoreNames.REMINDERS);

    }

  }

  tileClassName({ activeStartDate, date, view }){

    if (view != "month"){
      return null;
    }

    if (!this.state.monthReminderList && !this.state.monthSearchList){
      return null
    }

    date = date.toISOString().split("T")[0];

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
    
    this.setState({selectedDate: value.toISOString().split("T")[0]});

  }

  onSearchesDataReceived(message, sendResponse){

    var context = message.data.objectData.context; 
    if (context != appParams.COMPONENT_CONTEXT_NAMES.CALENDAR){
      return;
    }

    // acknowledge receipt
    ack(sendResponse);

    var monthSearchList = message.data.objectData.list;

    // Grouping the searches by date
    var results = this.groupObjectsByDate(monthSearchList);

    this.setState({monthSearchList: results});

  }

  groupObjectsByDate(objectList){

    var results = {};

    // Grouping the searches by date
    for (var object of objectList){
      var objectDate = object.date.split("T")[0];
      if (objectDate in results){
        (results[objectDate]).push(object);
      }
      else{
        results[objectDate] = [object];
      }
    }

    return results;

  }

  onRemindersDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var monthReminderList = message.data.objectData.list;

    // Grouping the reminders by date
    var results = this.groupObjectsByDate(monthReminderList);

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
        <div class="text-center mt-5">
          <span class="badge text-bg-primary shadow">Calendar View</span>
        </div>
				<div class="offset-1 col-10 mt-4 row">
          <div class="col-4">
            <Cal onClickDay={this.onClickDay} 
              // tileDisabled={this.tileDisabled} 
              onActiveStartDateChange={this.onActiveStartDateChange} 
              value={new Date()} 
              tileClassName={this.tileClassName}
              className="rounded shadow"/>
          </div>
          <div class="col-7 ps-3">
            <Card className="shadow">
              <Card.Header>
                <Nav 
                  variant="tabs" 
                  activeKey={this.state.tabActiveKey}
                  onSelect={this.onNavSelectKey}>

                  {this.state.tabTitles.map((tabTitle, index) => (
                                                    <Nav.Item>
                                                      <Nav.Link href={"#"+tabTitle} eventKey={tabTitle}>{tabTitle}</Nav.Link>
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
              </Card.Body>
            </Card>
          </div>
        </div>

        <CustomToast message={this.state.toastMessage} show={this.state.toastShow} onClose={this.toggleToastShow} position="top-end" delay="true"/>
	    </>
    );
  }
}
