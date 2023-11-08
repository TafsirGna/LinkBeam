/*import './Calendar.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { sendDatabaseActionMessage, ack, startMessageListener, messageParams, dbData } from "./Local_library";
import { Calendar as Cal } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import SearchListView from "./widgets/SearchListView";
import moment from 'moment';

export default class Calendar extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      monthSearchList: null,
      selectedDate: (new Date()).toISOString().split("T")[0],
    };

    this.onClickDay = this.onClickDay.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSearchesDataReceived = this.onSearchesDataReceived.bind(this);
    this.tileDisabled = this.tileDisabled.bind(this);
    this.onActiveStartDateChange = this.onActiveStartDateChange.bind(this);
    this.tileClassName = this.tileClassName.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();

    // Requesting this month's search list
    this.getMonthSearchList(this.state.selectedDate);

  }

  componentDidUpdate(prevProps, prevState){

  }

  getDaySearchList(){

    var list = null;

    if (this.state.monthSearchList){
      if (this.state.selectedDate in this.state.monthSearchList){
        list = this.state.monthSearchList[this.state.selectedDate]
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

  getMonthSearchList(dateString){

    // Reformatting the date string before sending the request
    var separator = "-";
    dateString = dateString.split(separator);
    dateString[dateString.length - 1] = "?";
    dateString = dateString.join(separator);

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.SEARCHES, {date: dateString, context: "Calendar"});

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
      this.getMonthSearchList(activeStartDate.getFullYear()+"-"+month+"-01");
    }

  }

  tileClassName({ activeStartDate, date, view }){

    if (view != "month" || !this.state.monthSearchList){
      return null;
    }

    date = date.toISOString().split("T")[0];
    if (date in this.state.monthSearchList){
      return "bg-secondary text-white shadow";
    }

    return null;

  }

  onClickDay(value, event){
    
    this.setState({selectedDate: value.toISOString().split("T")[0]});

  }

  onSearchesDataReceived(message, sendResponse){

    var context = message.data.objectData.context; 
    if (context != "Calendar"){
      return;
    }

    // acknowledge receipt
    ack(sendResponse);

    var monthSearchList = message.data.objectData.list, 
        results = {};

    // Preprocessing the month's search list
    for (var search of monthSearchList){
      var searchDate = search.date.split("T")[0];
      if (searchDate in results){
        (results[searchDate]).push(search);
      }
      else{
        results[searchDate] = [search];
      }
    }

    this.setState({monthSearchList: results});

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.SEARCHES].join(messageParams.separator), 
        callback: this.onSearchesDataReceived
      },
    ]);

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
                <Nav variant="tabs" defaultActiveKey="#first">
                  <Nav.Item>
                    <Nav.Link href="#searches" active>Searches</Nav.Link>
                  </Nav.Item>
                  {/*<Nav.Item>
                    <Nav.Link href="#link">Link</Nav.Link>
                  </Nav.Item>*/}
                </Nav>
              </Card.Header>
              <Card.Body>
                {/*<Card.Title>Special title treatment</Card.Title>
                <Card.Text>
                  With supporting text below as a natural lead-in to additional content.
                </Card.Text>*/}
                <SearchListView objects={this.getDaySearchList()} seeMore={() => {}} loading={false} searchLeft={false}/>
              </Card.Body>
            </Card>
          </div>
        </div>
	    </>
    );
  }
}
