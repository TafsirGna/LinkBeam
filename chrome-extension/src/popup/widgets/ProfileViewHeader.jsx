/*import './ProfileViewHeader.css'*/
import React from 'react';
import default_user_icon from '../../assets/user_icons/default.png';
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ProfileGeoMapChart from "./charts/ProfileGeoMapChart";
import eventBus from "../EventBus";
import { appParams } from "../Local_library";
import { 
  AlertCircleIcon, 
  LocationIcon, 
  PictureIcon, 
  BookmarkIcon, 
  DuplicateIcon,
  ReminderIcon,
} from "./SVGs";

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

    eventBus.dispatch(eventBus.PROFILE_SHOW_REMINDER_OBJECT, null);

  }

  render(){
    return (
      <>
        <p class="small badge text-muted fst-italic mb-1">
          <OverlayTrigger
              placement="top"
              overlay={<ReactTooltip id="tooltip1">Warning!</ReactTooltip>}
            >
              <span class="me-1 text-warning">
                <AlertCircleIcon size="14"/>
              </span>
            </OverlayTrigger>
          <span>The data below are only the ones made publicly available by this user on its profile page</span>
        </p>
        <div class="card mb-3 shadow mt-1">
          <div class="card-body text-center">
            <img src={this.props.profile.avatar ? this.props.profile.avatar : default_user_icon} onClick={() => {this.handleImageModalShow(AVATAR_IMAGE_MODAL_TITLE)}} alt="twbs" width="60" height="60" class="shadow rounded-circle flex-shrink-0 mb-4 handy-cursor"/>
            <h5 class="card-title">{ this.props.profile.fullName }</h5>
            {/*<p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>*/}
            <p class="card-text mb-1"><small class="text-body-secondary">{ this.props.profile.title }</small></p>
            <p class="shadow-sm card-text fst-italic opacity-50 badge bg-light-sbtle text-light-emphasis rounded-pill border border-warning"><small class="text-body-secondary">{this.props.profile.nFollowers} · {this.props.profile.nConnections} </small></p>
            <p class="card-text mb-1 text-center text-muted">
              { this.props.profile.location && <OverlayTrigger
                              placement="bottom"
                              overlay={<ReactTooltip id="tooltip1">{this.props.profile.location}</ReactTooltip>}
                            >
                              <span onClick={() => {this.handleGeoMapModalShow()}}>
                                <LocationIcon size="20" className="mx-2 handy-cursor"/>
                              </span>
                            </OverlayTrigger>}
              { this.props.profile.coverImage && <span>
                              ·
                              <OverlayTrigger
                                placement="bottom"
                                overlay={<ReactTooltip id="tooltip1">View Cover Image</ReactTooltip>}
                              >
                                <span onClick={() => {this.handleImageModalShow(COVER_IMAGE_MODAL_TITLE)}}>
                                  <PictureIcon size="20" className="mx-2 handy-cursor"/>
                                </span>                                
                              </OverlayTrigger>
                            </span>}
              { Object.hasOwn(this.props.profile, "bookmark") && <span>
                  ·
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<ReactTooltip id="tooltip1">Bookmarked</ReactTooltip>}
                  >
                    <span>
                      <BookmarkIcon size="24" className="mx-2"/>
                    </span>
                  </OverlayTrigger>
                </span>}
              { this.props.profile.reminder && <span>
                  ·
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<ReactTooltip id="tooltip1">Show reminder</ReactTooltip>}
                  >
                    <span onClick={() => {this.showReminder()}}>
                      <ReminderIcon size="24" className="mx-2 handy-cursor"/>
                    </span>
                  </OverlayTrigger>
                </span>}
              <span>
                ·
                <OverlayTrigger
                  placement="bottom"
                  overlay={<ReactTooltip id="tooltip1">Visit on Linkedin</ReactTooltip>}
                >
                  <a href={this.props.profile.url} target="_blank">
                    <DuplicateIcon size="24" className="mx-2" />
                  </a>
                </OverlayTrigger>
              </span>
            </p>
          </div>
        </div>

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

        <Modal show={this.state.geoMapModalShow} onHide={this.handleGeoMapModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Locations</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            <ProfileGeoMapChart 
              viewChoice={0} 
              context={appParams.COMPONENT_CONTEXT_NAMES.PROFILE}
              objects={[this.props.profile]} />

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleGeoMapModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
