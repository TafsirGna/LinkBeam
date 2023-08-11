/*import './ProfileViewReminderModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default class ProfileViewReminderModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

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
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="reminderForm.contentControlTextarea"
              >
                <Form.Label>Content</Form.Label>
                <Form.Control as="textarea" rows={3} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={this.props.onHide}>
              Save 
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
