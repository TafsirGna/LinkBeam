/*import './ProfileViewReminderModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ViewsTimelineChart from "../charts/ViewsTimelineChart";
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
    };

    // this.saveReminder = this.saveReminder.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();
  }

  listenToMessages(){

    
  }

  render(){
    return (
      <>
        {/*Reminder Modal*/}
        <Modal show={this.props.show} onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Searches Chart</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            <ViewsTimelineChart viewChoice={0} specificProfile={this.props.profile} />

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
