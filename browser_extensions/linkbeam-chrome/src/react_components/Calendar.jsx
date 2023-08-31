/*import './Calendar.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { sendDatabaseActionMessage, ack, startMessageListener, messageParams, dbData } from "./Local_library";
import { Calendar as Cal } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import SearchListView from "./widgets/SearchListView";

export default class Calendar extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      searchList: null,
      selectedDate: (new Date()).toISOString().split("T")[0],
    };

    this.onClickDay = this.onClickDay.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSearchesDataReceived = this.onSearchesDataReceived.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();

    this.getSearchList(this.state.selectedDate);

  }

  componentDidUpdate(prevProps, prevState){

    if (this.state.selectedDate != prevState.selectedDate){
      this.setState({searchList: null});
      this.getSearchList(this.state.selectedDate);
    }

  }

  getSearchList(dateString){

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.SEARCHES, {date: dateString, context: "Calendar"});

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

    var searchList = message.data.objectData.list;
    this.setState({searchList: searchList});

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
          <Cal onClickDay={this.onClickDay} value={new Date()} className="rounded shadow col-4"/>
          <div class="col-8 ps-3">
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
                <SearchListView objects={this.state.searchList} seeMore={() => {}} loading={false} searchLeft={false}/>
              </Card.Body>
            </Card>
          </div>
        </div>
	    </>
    );
  }
}
