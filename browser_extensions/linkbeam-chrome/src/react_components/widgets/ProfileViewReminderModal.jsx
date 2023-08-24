/*import './ProfileViewReminderModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { sendDatabaseActionMessage } from "../Local_library";

export default class ProfileViewReminderModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      reminderDate: (new Date()).toISOString().split("T")[0],
      reminderText: "",
    };

    this.saveReminder = this.saveReminder.bind(this);
    this.handleReminderTextAreaChange = this.handleReminderTextAreaChange.bind(this);
    this.handleReminderDateInputChange = this.handleReminderDateInputChange.bind(this);
    this.startMessageListener = this.startMessageListener.bind(this);
  }

  saveReminder(){

    var reminder = {url: this.props.profile.url, text: this.state.reminderText, date: this.state.reminderDate};
    sendDatabaseActionMessage("add-object", "reminders", reminder);

  }

  componentDidMount() {

    this.startMessageListener();
  }

  startMessageListener(){

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch(message.header){

        case "object-data":{
          
          switch(message.data.objectStoreName){
            case "reminders":{

              break;
            }
          }

          break;
        }
      }

      // vanishing the spinner
      this.setState({processingState: {status: "NO", info: ""}});

    });

    
  }

  handleReminderTextAreaChange(event) {
    this.setState({reminderText: event.target.value});
  }

  handleReminderDateInputChange(event) {
    this.setState({reminderDate: event.target.value});
  }

  render(){
    return (
      <>
        {/*Reminder Modal*/}
        <Modal show={this.props.show} onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Reminder</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="reminderForm.scheduledForControlInput">
                <Form.Label>Remind at</Form.Label>
                <Form.Control
                  type="date"
                  autoFocus
                  value={this.state.reminderDate}
                  onChange={this.handleReminderDateInputChange}
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="reminderForm.contentControlTextarea"
              >
                <Form.Label>Content</Form.Label>
                <Form.Control as="textarea" rows={3} value={this.state.reminderText} onChange={this.handleReminderTextAreaChange} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={this.saveReminder}>
              Save 
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}