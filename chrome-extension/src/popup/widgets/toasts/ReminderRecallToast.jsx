/*import './CustomToast.css'*/
import React from 'react';
import Toast from 'react-bootstrap/Toast';
import { appParams } from "../../Local_library";
import bell_icon from '../../../assets/bell_icon.png';
import ReminderListView from "../ReminderListView";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default class ReminderRecallToast extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      toastShow: true,
      listModalShow: false,
    };

    this.onListModalHide = this.onListModalHide.bind(this);
  }

  componentDidMount(){

  }

  componentDidUpdate(prevProps, prevState){

  }

  closeToast = () => {
    this.setState({toastShow: false});
  }

  onListModalHide(){

    this.setState({listModalShow: false});

  }

  showListModal(){

    this.setState({toastShow: false, listModalShow: true});

  }

  render(){
    return (
      <>

        <Toast show={this.state.toastShow} onClose={this.closeToast}>
          <Toast.Header>
            <img
              src={bell_icon}
              className="rounded me-2"
              alt=""
              width="16"
            />
            <strong className="me-auto">{appParams.appName}</strong>
            <small>{/*11 mins ago*/}</small>
          </Toast.Header>
          <Toast.Body>
            <div class="d-flex gap-3">
              <div>
                {this.props.globalData.todayReminderList.length + " Reminder(s) set for today !"}
              </div>
              <div>
                <button type="button" class="btn btn-primary btn-sm badge" onClick={() => {this.showListModal()}} >View</button>
              </div>
            </div>
          </Toast.Body>
        </Toast>

        {/*Reminder list modal*/}
        <Modal show={this.state.listModalShow} onHide={this.onListModalHide}>
          <Modal.Header closeButton>
            <Modal.Title>Reminders</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            { this.props.globalData.todayReminderList && <ReminderListView objects={this.props.globalData.todayReminderList} />}

          </Modal.Body>
          {/*<Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide} className="shadow">
              Close
            </Button>
          </Modal.Footer>*/}
        </Modal>

      </>
    );
  }
}
