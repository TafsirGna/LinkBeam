/*import './ProfileViewReminderModal.css'*/
import React from 'react';
import default_user_icon from '../../assets/user_icons/default.png';
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
import ProfileGeoMapModal from "./modals/ProfileGeoMapModal";
import eventBus from "../EventBus";

const COVER_IMAGE_MODAL_TITLE = "Cover Image",
      AVATAR_IMAGE_MODAL_TITLE = "Avatar";


export default class ProfileViewHeader extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      imageLoaded: false,
      imageModalTitle: "",
      imageModalShow: false,
      geoMapModalShow: false,
    };
  }

  componentDidMount() {

  }

  handleImageModalClose = () => this.setState({imageModalShow: false, imageModalTitle: "", imageLoaded: false});
  handleImageModalShow = (modalTitle) => this.setState({imageModalShow: true, imageModalTitle: modalTitle});

  handleGeoMapModalClose = () => this.setState({geoMapModalShow: false});
  handleGeoMapModalShow = () => this.setState({geoMapModalShow: true});

  showReminder(){

    eventBus.dispatch("showReminder", null);

  }

  render(){
    return (
      <>
        <p class="small badge text-muted fst-italic mb-1">
          <OverlayTrigger
              placement="top"
              overlay={<ReactTooltip id="tooltip1">Warning!</ReactTooltip>}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 me-1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </OverlayTrigger>
          <span>The data below are only the ones made publicly available by this user</span>
        </p>
        <div class="card mb-3 shadow mt-1">
          <div class="card-body text-center">
            <img src={this.props.profile.avatar ? this.props.profile.avatar : default_user_icon} onClick={() => {this.handleImageModalShow(AVATAR_IMAGE_MODAL_TITLE)}} alt="twbs" width="60" height="60" class="shadow rounded-circle flex-shrink-0 mb-4 handy-cursor"/>
            <h5 class="card-title">{ this.props.profile.fullName }</h5>
            {/*<p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>*/}
            <p class="card-text mb-1"><small class="text-body-secondary">{ this.props.profile.title }</small></p>
            <p class="shadow card-text fst-italic opacity-50 badge bg-light-sbtle text-light-emphasis rounded-pill border border-info-subtle"><small class="text-body-secondary">{this.props.profile.nFollowers} · {this.props.profile.nConnections} </small></p>
            <p class="card-text mb-1 text-center text-muted">
              { this.props.profile.location && <OverlayTrigger
                              placement="bottom"
                              overlay={<ReactTooltip id="tooltip1">{this.props.profile.location}</ReactTooltip>}
                            >
                              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-2 handy-cursor" onClick={() => {this.handleGeoMapModalShow()}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            </OverlayTrigger>}
              { this.props.profile.coverImage && <span>
                              ·
                              <OverlayTrigger
                                placement="bottom"
                                overlay={<ReactTooltip id="tooltip1">View Cover Image</ReactTooltip>}
                              >
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-2 handy-cursor" onClick={() => {this.handleImageModalShow(COVER_IMAGE_MODAL_TITLE)}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                              </OverlayTrigger>
                            </span>}
              { this.props.profile.bookmark && <span>
                  ·
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<ReactTooltip id="tooltip1">Bookmarked</ReactTooltip>}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                  </OverlayTrigger>
                </span>}
              { this.props.profile.reminder && <span>
                  ·
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<ReactTooltip id="tooltip1">Show reminder</ReactTooltip>}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-2 handy-cursor" onClick={() => {this.showReminder()}}><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                  </OverlayTrigger>
                </span>}
              <span>
                ·
                <OverlayTrigger
                  placement="bottom"
                  overlay={<ReactTooltip id="tooltip1">Visit on Linkedin</ReactTooltip>}
                >
                  <a href={this.props.profile.url} target="_blank">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </a>
                </OverlayTrigger>
              </span>
            </p>
          </div>
        </div>

        <ProfileGeoMapModal profile={this.props.profile} show={this.state.geoMapModalShow} onHide={this.handleGeoMapModalClose} />

        {/* Cover Image Modal */}
        <Modal size={(this.state.imageModalTitle == AVATAR_IMAGE_MODAL_TITLE) ? "sm" : "lg"} show={this.state.imageModalShow} onHide={this.handleImageModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>{this.state.imageModalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            {!this.state.imageLoaded && <div class="text-center">
                                              <div class={"spinner-border text-secondary "} role="status">
                                                <span class="visually-hidden">Loading...</span>
                                              </div>
                                            </div>}
            
            <img src={(this.state.imageModalTitle == AVATAR_IMAGE_MODAL_TITLE) ? this.props.profile.avatar : ((this.state.imageModalTitle == COVER_IMAGE_MODAL_TITLE) ? this.props.profile.coverImage : "")} class="rounded shadow w-100" onLoad={() => {this.setState({imageLoaded: true});}} onerror={() => {console.log("Error loading cover image!")}}/>

          </Modal.Body>
        </Modal>
      </>
    );
  }
}
