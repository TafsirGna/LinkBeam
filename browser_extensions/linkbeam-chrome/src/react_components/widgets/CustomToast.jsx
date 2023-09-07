/*import './CustomToast.css'*/
import React from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { appParams } from "../Local_library";

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
          position="bottom-end"
          style={{ zIndex: 1 }}
        >
          <Toast show={this.props.show} onClose={this.props.onClose} delay={3000} autohide>
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
