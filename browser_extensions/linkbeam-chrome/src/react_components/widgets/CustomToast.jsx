/*import './CustomToast.css'*/
import React from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { appParams } from "../Local_library";
/*import 'bootstrap/dist/css/bootstrap.min.css';*/

export default class CustomToast extends React.Component{

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
        {/*Bookmark Toast*/}
        <ToastContainer
          className="p-3"
          position={this.props.position}
          style={{ zIndex: 1 }}
        >
          <Toast show={this.props.show} onClose={this.props.onClose} delay={ this.props.delay ? 3600000 : appParams.TIMER_VALUE} autohide>
            <Toast.Header>
              <img
                src="holder.js/20x20?text=%20"
                className="rounded me-2"
                alt=""
              />
              <strong className="me-auto">{appParams.appName}</strong>
              <small>{/*11 mins ago*/}</small>
            </Toast.Header>
            <Toast.Body>{this.props.message}</Toast.Body>
          </Toast>
        </ToastContainer>
      </>
    );
  }
}
