/*import './Calendar.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { sendDatabaseActionMessage, ack, startMessageListener, messageParams, dbData } from "./Local_library";
import { Calendar as Cal } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import SearchListView from "./widgets/SearchListView";
/*import 'bootstrap/dist/css/bootstrap.min.css';*/

export default class Calendar extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      monthSearchList: null,
      daySearchList: null,
      selectedDate: (new Date()).toISOString().split("T")[0],
    };

    this.onClickDay = this.onClickDay.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSearchesDataReceived = this.onSearchesDataReceived.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();

    // Requesting this month's search list
    this.getMonthSearchList(this.state.selectedDate);

  }

  componentDidUpdate(prevProps, prevState){

    if (this.state.selectedDate != prevState.selectedDate){
      this.setState({daySearchList: null});
      this.setDaySearchList();
    }

  }

  setDaySearchList(){

    this.setState({daySearchList: []}, () => {

      var daySearchList = [];
      for (var search of monthSearchList){
        if (search.date.split("T")[0] == this.state.selectedDate){
          daySearchList.push(search);
        }
      }

      this.setState({daySearchList: daySearchList});

    });

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
    return date.getDay() === 0;
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

    var monthSearchList = message.data.objectData.list;
    this.setState({monthSearchList: monthSearchList}, () => {
      this.setDaySearchList();
    });

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
          <Cal onClickDay={this.onClickDay} tileDisabled={this.tileDisabled} value={new Date()} className="rounded shadow col-4"/>
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
                <SearchListView objects={this.state.monthSearchList} seeMore={() => {}} loading={false} searchLeft={false}/>
              </Card.Body>
            </Card>
          </div>
        </div>
	    </>
    );
  }
}
