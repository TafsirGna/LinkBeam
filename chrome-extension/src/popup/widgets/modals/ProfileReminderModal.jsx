/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

/*import './ProfileViewReminderModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { 
  appParams,
} from "../../Local_library";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../../../db";
import eventBus from "../../EventBus";

function freshReminder(url = null){

  return {
        createdOn: (new Date()).toISOString(),
        date: (new Date()).toISOString().split('T')[0],
        text: "",
        url: url,
        active: true,
      };

}

export default class ProfileViewReminderModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      formTagId: uuidv4(),
      reminder: freshReminder(),
      validated: false,
    };

    this.saveReminder = this.saveReminder.bind(this);
    this.handleReminderTextAreaChange = this.handleReminderTextAreaChange.bind(this);
    this.handleReminderDateInputChange = this.handleReminderDateInputChange.bind(this);
  }

  saveReminder(){

    // this.refs.form;
    var callback = null;
    if (document.getElementById(this.state.formTagId).checkValidity()) {

      callback = async () => {

                    var reminder = null;
                    try{
                      await db.reminders.add(this.state.reminder);
                      reminder = await db.reminders.where("url").equals(this.props.profile.url);
                    }
                    catch(error){
                      console.error("Error : ", error);
                    }

                    if (reminder){
                      eventBus.dispatch(eventBus.SET_PROFILE_DATA, {property: "reminder", value: reminder});
                    }

                  };

    }
    this.setState({validated: true}, callback);

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.show != this.props.show){
      if (this.props.show){
        var reminder = this.props.profile.reminder ? this.props.profile.reminder : freshReminder(this.props.profile.url);
        this.setState({reminder: reminder, validated: false});
      }
    }

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
            <Form noValidate validated={this.state.validated} id={this.state.formTagId}>
              <Form.Group className="mb-3" controlId="reminderForm.scheduledForControlInput">
                <Form.Label>Remind at</Form.Label>
                <Form.Control
                  type="date"
                  autoFocus
                  // max={new Date().toISOString().slice(0, 10)}
                  value={this.state.reminder.date}
                  onChange={this.handleReminderDateInputChange}
                  className="shadow"
                  // readOnly={this.state.display ? true : false}
                  disabled={this.props.profile.reminder ? true : false}
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
                <Form.Control required disabled={this.props.profile.reminder ? true : false} as="textarea" rows={3} value={this.state.reminder.text} onChange={this.handleReminderTextAreaChange} className="shadow-sm" />
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
            { !this.props.profile.reminder && <Button variant="primary" size="sm" onClick={this.saveReminder} /*onClick={() => {this.refs.form.submit()}}*/ className="shadow">
                          Save 
                        </Button>}
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
