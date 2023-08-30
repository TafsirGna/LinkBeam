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
      viewTabIndex: 0,
    };
  }

  componentDidMount() {

  }

  handleOffcanvasClose = () => {this.setState({offcanvasShow: false});}
  handleOffcanvasShow = () => {this.setState({offcanvasShow: true});}

  handleToastClose = () => {this.setState({toastShow: false});}
  handleToastShow = () => {this.setState({toastShow: true});}

  switchViewTabIndex(){

  }

  render(){

    return(
      <>
        <ToastContainer
          className="p-3"
          position="top-end"
          style={{ zIndex: 1 }}
        >
          <Toast show={this.state.toastShow}>
            <Toast.Header closeButton={false}>
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
                <button type="button" class="btn btn-secondary badge" onClick={() => {this.handleToastClose()}} >
                  Cancel
                </button>
              </span>
            </Toast.Body>
          </Toast>
        </ToastContainer>

        <Offcanvas show={this.state.offcanvasShow} onHide={() => {this.handleOffcanvasClose()}}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>{appParams.appName}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>

            <div class="clearfix">
              <div class="dropdown float-start bd-gray mb-3 ms-2">
                <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="gray" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                </div>
                <ul class="dropdown-menu shadow-lg">
                  { ["Section 1", "Section 2", "Section 3"].map((item, index) => (<li>
                                                                    <a class={"dropdown-item small " + (this.state.viewTabIndex == index ? "active" : "")} href="#" onClick={() => {this.switchViewTabIndex(index)}}>
                                                                      {item}
                                                                      { this.state.viewTabIndex == index && <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 float-end"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                                    </a>
                                                                  </li>)) }
                </ul>
              </div>
            </div> 

            <div class="list-group small shadow">
              <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                <div class="d-flex gap-2 w-100 justify-content-between">
                  <div>
                    <h6 class="mb-0">List group item heading</h6>
                    <p class="mb-0 opacity-75">Some placeholder content in a paragraph.</p>
                    <div class="mt-2">
                      <span class="badge bg-secondary-subtle border border-secondary-subtle text-secondary-emphasis rounded-pill me-1">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        12
                      </span>
                      <span class="badge bg-secondary-subtle border border-secondary-subtle text-secondary-emphasis rounded-pill mx-1">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        12
                      </span>
                      <span class="badge bg-secondary-subtle border border-secondary-subtle text-secondary-emphasis rounded-pill mx-1">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 me-2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                        12
                      </span>
                    </div>
                  </div>
                  <small class="opacity-50 text-nowrap">now</small>
                </div>
              </a>
              <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                <div class="d-flex gap-2 w-100 justify-content-between">
                  <div>
                    <h6 class="mb-0">Another title here</h6>
                    <p class="mb-0 opacity-75">Some placeholder content in a paragraph that goes a little longer so it wraps to a new line.</p>
                  </div>
                  <small class="opacity-50 text-nowrap">3d</small>
                </div>
              </a>
              <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                <div class="d-flex gap-2 w-100 justify-content-between">
                  <div>
                    <h6 class="mb-0">Third heading</h6>
                    <p class="mb-0 opacity-75">Some placeholder content in a paragraph.</p>
                  </div>
                  <small class="opacity-50 text-nowrap">1w</small>
                </div>
              </a>
            </div>
          
          </Offcanvas.Body>
      </Offcanvas>
      </>
    );
  }

}
