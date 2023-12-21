/*import './ProfileViewReminderModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import SearchesTimelineChart from "../charts/SearchesTimelineChart";
import { 
  sendDatabaseActionMessage, 
  startMessageListener, 
  messageParams, 
  ack, 
  dbData 
} from "../../Local_library";

export default class ProfileSearchesChartModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      currentTabIndex: 0,
      viewChoice: 0,
    };

    this.onViewParamChoice = this.onViewParamChoice.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();
  }

  listenToMessages(){

    
  }

  switchCurrentTab(currentTabIndex){

    this.setState({currentTabIndex: currentTabIndex});

  }

  onViewParamChoice(index){
    this.setState({viewChoice: index});
  }

  render(){
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Searches Chart</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <div class="text-center">
              <div class="btn-group btn-group-sm mb-2 shadow" role="group" aria-label="Small button group">
                <button type="button" class={"btn btn-primary badge" + (this.state.currentTabIndex == 0 ? " active " : "") } title="Search count" onClick={() => {this.switchCurrentTab(0)}} >
                  Count 
                </button>
                <button type="button" class={"btn btn-secondary badge" + (this.state.currentTabIndex == 1 ? " active " : "")} title="Search time" onClick={() => {this.switchCurrentTab(1)}}>
                  Time
                </button>
              </div>
            </div>

            {/*View dropdown*/}
            <div class="clearfix">
              <div class="btn-group float-end">
                <button class="btn btn-primary btn-sm dropdown-toggle fst-italic badge" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  View
                </button>
                <ul class="dropdown-menu shadow">

                  { ["days", "month", "year"].map((item, index) => (<li>
                                                                      <a class={"dropdown-item small " + (this.state.viewChoice == index ? "active" : "")} href="#" onClick={() => {this.onViewParamChoice(index)}}>
                                                                        Last {item}
                                                                        { this.state.viewChoice == index && <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 float-end"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                                      </a>
                                                                    </li>)) }

                </ul>
              </div>
            </div>

            { this.state.currentTabIndex == 0 && <SearchesTimelineChart viewChoice={this.state.viewChoice} specificProfile={this.props.profile} /> }

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
