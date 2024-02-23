/*import './ProfileViewReminderModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import VisitsTimelineChart from "../charts/VisitsTimelineChart";
import { 
  sendDatabaseActionMessage, 
  startMessageListener, 
  messageParams, 
  ack, 
  dbData ,
  getPeriodVisits,
  appParams
} from "../../Local_library";
import moment from 'moment';

export default class ProfileVisitsChartModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      // currentTabIndex: 0,
      view: 0,
      periodVisits: null,
    };

    this.onViewChange = this.onViewChange.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onVisitsDataReceived = this.onVisitsDataReceived.bind(this);

  }

  componentDidMount() {

    this.listenToMessages();

    getPeriodVisits(appParams.COMPONENT_CONTEXT_NAMES.PROFILE, this.state.view, {moment: moment}, this.props.profile);
  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.VISITS].join(messageParams.separator), 
        callback: this.onVisitsDataReceived
      },
    ]);
  }

  onVisitsDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var context = message.data.objectData.context; 
    if (context != appParams.COMPONENT_CONTEXT_NAMES.PROFILE){
      return;
    }

    var visits = message.data.objectData.list
    this.setState({ periodVisits: visits });

  }

  onViewChange(index){

    this.setState({view: index}, () => {
      getPeriodVisits(appParams.COMPONENT_CONTEXT_NAMES.PROFILE, index, {moment: moment}, this.props.profile);
    });

  }

  render(){
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Visits Chart</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            {/*<div class="text-center">
              <div class="btn-group btn-group-sm mb-2 shadow" role="group" aria-label="Small button group">
                <button type="button" class={"btn btn-primary badge" + (this.state.currentTabIndex == 0 ? " active " : "") } title="Visit count" onClick={() => {this.switchCurrentTab(0)}} >
                  Count 
                </button>
                <button type="button" class={"btn btn-secondary badge" + (this.state.currentTabIndex == 1 ? " active " : "")} title="Visit time" onClick={() => {this.switchCurrentTab(1)}}>
                  Time
                </button>
              </div>
            </div>*/}

            {/*View dropdown*/}
            <div class="clearfix">
              <div class="btn-group float-end">
                <button class="btn btn-primary btn-sm dropdown-toggle fst-italic badge" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  View
                </button>
                <ul class="dropdown-menu shadow">

                  { ["days", "month", "year"].map((item, index) => (<li>
                                                                      <a class={"dropdown-item small " + (this.state.view == index ? "active" : "")} href="#" onClick={() => {this.onViewChange(index)}}>
                                                                        Last {item}
                                                                        { this.state.view == index && <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 float-end"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                                      </a>
                                                                    </li>)) }

                </ul>
              </div>
            </div>

            { <VisitsTimelineChart view={this.state.view} objects={this.state.periodVisits} /> }

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