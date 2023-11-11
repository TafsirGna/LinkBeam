/*import './ProfileViewReminderModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { sendDatabaseActionMessage, startMessageListener, messageParams, ack, dbData } from "../Local_library";
/*import 'bootstrap/dist/css/bootstrap.min.css';*/

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
    this.listenToMessages = this.listenToMessages.bind(this);
  }

  saveReminder(){

    var reminder = {url: this.props.profile.url, text: this.state.reminderText, date: this.state.reminderDate};
    sendDatabaseActionMessage(messageParams.requestHeaders.ADD_OBJECT, dbData.objectStoreNames.REMINDERS, reminder);

  }

  componentDidMount() {

    this.listenToMessages();
  }

  listenToMessages(){

    
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
                  className="shadow"
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="reminderForm.contentControlTextarea"
              >
                <Form.Label>Content</Form.Label>
                <Form.Control as="textarea" rows={3} value={this.state.reminderText} onChange={this.handleReminderTextAreaChange} className="shadow-sm" />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide} className="shadow">
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={this.saveReminder} className="shadow">
              Save 
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
