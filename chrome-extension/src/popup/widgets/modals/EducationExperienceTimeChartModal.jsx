/*import './ProfileGeoMapModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { 
  sendDatabaseActionMessage, 
  startMessageListener, 
  messageParams, 
  ack, 
  dbData 
} from "../../Local_library";

export default class EducationExperienceTimeChartModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
  }

  listenToMessages(){

    
  }

  render(){
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.onHide} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Education & Experience</Modal.Title>
          </Modal.Header>
          <Modal.Body>

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
