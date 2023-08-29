import React from 'react'
import './App.css'
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { 
  appParams
} from "./react_components/Local_library";

export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      offcanvasShow: false,
      toastShow: true,
    };
  }

  componentDidMount() {

  }

  handleOffcanvasClose = () => {this.setState({offcanvasShow: false});}
  handleOffcanvasShow = () => {this.setState({offcanvasShow: true});}

  handleToastClose = () => {this.setState({toastShow: false});}
  handleToastShow = () => {this.setState({toastShow: true});}

  render(){

    return(
      <>
        <ToastContainer
          className="p-3"
          position="top-end"
          style={{ zIndex: 1 }}
        >
          <Toast show={this.state.toastShow}>
            <Toast.Header closeButton={true}>
              <img
                src="holder.js/20x20?text=%20"
                className="rounded me-2"
                alt=""
              />
              <strong className="me-auto">{appParams.appName}</strong>
              {/*<small>11 mins ago</small>*/}
            </Toast.Header>
            <Toast.Body>
              Activate LinkBeam Extension ? 
              <span class="btn-group btn-group-sm shadow-sm ms-2" role="group" aria-label="Small button group">
                <button type="button" class="btn btn-primary badge" onClick={() => {this.handleToastClose(); this.handleOffcanvasShow();}}>
                  Yes
                </button>
                <button type="button" class="btn btn-secondary badge" /*onClick={() => {}}*/ >
                  Cancel
                </button>
              </span>
            </Toast.Body>
          </Toast>
        </ToastContainer>

        <Offcanvas show={this.state.offcanvasShow} onHide={this.handleOffcanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Offcanvas</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            Some text as placeholder. In real life you can have the elements you
            have chosen. Like, text, images, lists, etc.
          </Offcanvas.Body>
      </Offcanvas>
      </>
    );
  }

}
