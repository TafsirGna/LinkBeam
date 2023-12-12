/*import './ProfileViewReminderModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { 
  sendDatabaseActionMessage, 
  startMessageListener, 
  messageParams, 
  ack, 
  dbData 
} from "../../Local_library";

export default class ProfileViewReminderModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      reminder: {
        date: (new Date()).toISOString().split("T")[0],
        text: "",
      },
      display: false,
      validated: false,
    };

    this.saveReminder = this.saveReminder.bind(this);
    this.handleReminderTextAreaChange = this.handleReminderTextAreaChange.bind(this);
    this.handleReminderDateInputChange = this.handleReminderDateInputChange.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onRemindersDataReceived = this.onRemindersDataReceived.bind(this);
    this.onReminderDeletionDataReceived = this.onReminderDeletionDataReceived.bind(this);
  }

  saveReminder(){

    const form = document.getElementById("profile_reminder_form") //this.refs.form;
    if (form.checkValidity() === false) {
      this.setState({validated: true});
      return;
    }
    this.setState({validated: true}, () => {

      var reminder = {url: this.props.profile.url, text: this.state.reminder.text, date: this.state.reminder.date};
      sendDatabaseActionMessage(messageParams.requestHeaders.ADD_OBJECT, dbData.objectStoreNames.REMINDERS, reminder);

    });

  }

  componentDidMount() {

    this.listenToMessages();

    this.getProfileReminderObject();
  }

  componentDidUpdate(prevProps, prevState){

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.REMINDERS].join(messageParams.separator), 
        callback: this.onRemindersDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_DELETED, dbData.objectStoreNames.REMINDERS].join(messageParams.separator), 
        callback: this.onReminderDeletionDataReceived
      },
    ]);
    
  }

  onReminderDeletionDataReceived(message, sendResponse){

    // acknowledge receipt
    // ack(sendResponse);

    this.setState({
      reminder: {
        date: (new Date()).toISOString().split("T")[0],
        text: "",
      },
      display: true,
    });

  }

  onRemindersDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var reminder = message.data.objectData;
    if (!reminder || reminder == undefined){
      return;
    }

    this.setState({reminder: reminder, display: true});

  }

  getProfileReminderObject(){

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.REMINDERS, {url: this.props.profile.url});

  }

  handleReminderTextAreaChange(event) {

    this.setState(prevState => {
      let reminder = Object.assign({}, prevState.reminder);
      reminder.text = event.target.value;
      return { reminder };
    }); 

  }

  handleReminderDateInputChange(event) {

    this.setState(prevState => {
      let reminder = Object.assign({}, prevState.reminder);
      reminder.date = event.target.value;
      return { reminder };
    }); 

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
            <Form noValidate validated={this.state.validated} id="profile_reminder_form">
              <Form.Group className="mb-3" controlId="reminderForm.scheduledForControlInput">
                <Form.Label>Remind at</Form.Label>
                <Form.Control
                  type="date"
                  autoFocus
                  max={new Date().toISOString().slice(0, 10)}
                  value={this.state.reminder.date}
                  onChange={this.handleReminderDateInputChange}
                  className="shadow"
                  // readOnly={this.state.display ? true : false}
                  disabled={this.state.display ? true : false}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please choose a valid date.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="reminderForm.contentControlTextarea"
              >
                <Form.Label>Content</Form.Label>
                <Form.Control required disabled={this.state.display ? true : false} as="textarea" rows={3} value={this.state.reminder.text} onChange={this.handleReminderTextAreaChange} className="shadow-sm" />
                <Form.Control.Feedback type="invalid">
                  Please enter a content.
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide} className="shadow">
              Close
            </Button>
            { !this.state.display && <Button variant="primary" size="sm" onClick={this.saveReminder} /*onClick={() => {this.refs.form.submit()}}*/ className="shadow">
                          Save 
                        </Button>}
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
