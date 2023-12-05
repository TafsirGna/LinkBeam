/*import './ProfileGeoMapModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ItemPercentageDoughnutChart from "../charts/ItemPercentageDoughnutChart";
import { 
  sendDatabaseActionMessage, 
  startMessageListener, 
  messageParams, 
  ack, 
  dbData 
} from "../../Local_library";

export default class PercentageDoughnutModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {

    };

    // this.saveReminder = this.saveReminder.bind(this);
  }

  componentDidMount() {

    // this.listenToMessages();
  }

  listenToMessages(){

    
  }

  render(){
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Percentage</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            <ItemPercentageDoughnutChart/>

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
