/*import './CustomToast.css'*/
import React from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { appParams } from "../../Local_library";
import bell_icon from '../../../assets/bell_icon.png';
import ReminderRecallToast from "./ReminderRecallToast";

export default class CustomToast extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      position: "top-end",
    };
  }

  componentDidMount(){

  }

  componentDidUpdate(prevProps, prevState){

  }

  render(){
    return (
      <>

        <ToastContainer
          className="p-3"
          position={this.state.position}
          style={{ zIndex: 1 }}
        >

          { this.props.show 
              && <Toast show={true} onClose={this.props.onClose} delay={appParams.TIMER_VALUE_1} autohide>
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
                      <div>
                        {this.props.message}
                      </div>
                    </Toast.Body>
                  </Toast>}

          { (this.props.globalData.todayReminderList 
              && this.props.globalData.todayReminderList.length > 0) 
              && <ReminderRecallToast 
                    globalData={this.props.globalData} 
                    onClose={this.closeReminderToast} />}

        </ToastContainer>

      </>
    );
  }
}
