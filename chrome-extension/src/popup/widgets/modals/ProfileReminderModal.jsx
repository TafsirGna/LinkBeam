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
      }
    };

    this.saveReminder = this.saveReminder.bind(this);
    this.handleReminderTextAreaChange = this.handleReminderTextAreaChange.bind(this);
    this.handleReminderDateInputChange = this.handleReminderDateInputChange.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
  }

  saveReminder(){

    var reminder = {url: this.props.profile.url, text: this.state.reminder.text, date: this.state.reminder.date};
    sendDatabaseActionMessage(messageParams.requestHeaders.ADD_OBJECT, dbData.objectStoreNames.REMINDERS, reminder);

  }

  componentDidMount() {

    this.listenToMessages();

    this.getProfileReminderObject();
  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.REMINDERS].join(messageParams.separator), 
        callback: this.onRemindersDataReceived
      },
    ]);
    
  }

  onRemindersDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var reminder = message.data.objectData;
    reminder.date = new Date(reminder.date);
    this.setState({reminder: reminder});

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
            <Form>
              <Form.Group className="mb-3" controlId="reminderForm.scheduledForControlInput">
                <Form.Label>Remind at</Form.Label>
                <Form.Control
                  type="date"
                  autoFocus
                  value={this.state.reminder.date}
                  onChange={this.handleReminderDateInputChange}
                  className="shadow"
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="reminderForm.contentControlTextarea"
              >
                <Form.Label>Content</Form.Label>
                <Form.Control as="textarea" rows={3} value={this.state.reminder.text} onChange={this.handleReminderTextAreaChange} className="shadow-sm" />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide} className="shadow">
              Close
            </Button>
            { <Button variant="primary" size="sm" onClick={this.saveReminder} className="shadow">
                          Save 
                        </Button>}
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
