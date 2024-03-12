/*import './ProfileViewHeader.css'*/
import React from 'react';
import default_user_icon from '../../assets/user_icons/default.png';
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ProfilesGeoMapChart from "./charts/ProfilesGeoMapChart";
import eventBus from "../EventBus";
import { 
  appParams, 
  dbDataSanitizer,
} from "../Local_library";
import ProfileSingleItemDonutChart from "./charts/ProfileSingleItemDonutChart";
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
      connectionModalShow: false,
      followersCompData: null,
      connectionsCompData: null, 
    };

    this.setConnectionModalData = this.setConnectionModalData.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.localData != this.props.localData){
      if (prevProps.localData.profiles != this.props.localData.profiles){
        if (this.state.connectionModalShow){
          this.setConnectionModalData();
        }
      }
    }

  }

  handleImageModalClose = () => this.setState({imageModalShow: false, imageModalTitle: "", imageLoaded: false});
  handleImageModalShow = (modalTitle) => this.setState({imageModalShow: true, imageModalTitle: modalTitle});

  handleGeoMapModalClose = () => this.setState({geoMapModalShow: false});
  handleGeoMapModalShow = () => this.setState({geoMapModalShow: true});

  setConnectionModalData(){

    var followersCompData = null, connectionsCompData = null;
        
    if (this.props.profile.nFollowers && !this.state.followersCompData){

      followersCompData = {
        label: "Followers",
        value: 0,
      };

      var nFollowers = dbDataSanitizer.profileRelationMetrics(this.props.profile.nFollowers);

      for (var profile of this.props.localData.profiles){
        if (profile.url == this.props.profile.url){
          continue;
        }
        if (dbDataSanitizer.profileRelationMetrics(profile.nFollowers) <= nFollowers){
          followersCompData.value += 1;
        }
      }

      followersCompData.value /= this.props.localData.profiles.length;
      followersCompData.value *= 100;

    }

    if (this.props.profile.nConnections && !this.state.connectionsCompData){
      connectionsCompData = {
        label: "Connections",
        value: 0,
      };

      var nConnections = dbDataSanitizer.profileRelationMetrics(this.props.profile.nConnections);

      for (var profile of this.props.localData.profiles){
        if (profile.url == this.props.profile.url){
          continue;
        }
        if (dbDataSanitizer.profileRelationMetrics(profile.nConnections) <= nConnections){
          connectionsCompData.value += 1;
        }
      }

      connectionsCompData.value /= this.props.localData.profiles.length;
      connectionsCompData.value *= 100;

    }

    if (followersCompData){
      this.setState({followersCompData: followersCompData});
    }

    if (connectionsCompData){
      this.setState({connectionsCompData: connectionsCompData});
    }

  }

  handleConnectionModalClose = () => {
    this.setState({ connectionModalShow: false });
  };
  handleConnectionModalShow = () => {

    this.setState({connectionModalShow: true}, () => {

      if (!this.props.localData.profiles){
        sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.PROFILES, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE });
        return;
      }

      this.setConnectionModalData();

    });

  };

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
                <AlertCircleIcon size="14" className="text-warning"/>
              </span>
            </OverlayTrigger>
          <span>The data below are only the ones made publicly available by this user on its linkedin profile page</span>
        </p>
        <div class="card mb-3 shadow mt-1">
          <div class="card-body text-center">
            <img src={this.props.profile.avatar ? this.props.profile.avatar : default_user_icon} onClick={() => {this.handleImageModalShow(AVATAR_IMAGE_MODAL_TITLE)}} alt="twbs" width="60" height="60" class="shadow rounded-circle flex-shrink-0 mb-4 handy-cursor"/>
            <h5 class="card-title">{ this.props.profile.fullName }</h5>
            {/*<p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>*/}
            <p class="card-text mb-1"><small class="text-body-secondary">{ this.props.profile.title }</small></p>
            <p class="shadow-sm card-text fst-italic opacity-50 badge bg-light-sbtle text-light-emphasis rounded-pill border border-warning" onClick={this.handleConnectionModalShow} title="Click to see more infos">
              <small class="text-body-secondary handy-cursor" >
                {(this.props.profile.nFollowers ? dbDataSanitizer.profileRelationDataPreproc(this.props.profile.nFollowers) : "") + (this.props.profile.nConnections ? " · " : "")} 
                {this.props.profile.nConnections ? dbDataSanitizer.profileRelationDataPreproc(this.props.profile.nConnections) : ""}
                { !this.props.profile.nFollowers && !this.props.profile.nConnections && <OverlayTrigger
                                                  placement="top"
                                                  overlay={<ReactTooltip id="tooltip1">Missing followers and connections count!</ReactTooltip>}
                                                >
                                                  <AlertCircleIcon size="14" className="text-warning"/>
                                                </OverlayTrigger>} 
              </small>
            </p>
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
              { this.props.profile.bookmark && <span>
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

        {/* Geo Map Modal */}
        <Modal show={this.state.geoMapModalShow} onHide={this.handleGeoMapModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Locations</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            <ProfilesGeoMapChart 
              context={appParams.COMPONENT_CONTEXT_NAMES.PROFILE}
              objects={[this.props.profile]} />

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleGeoMapModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Followers and connections modal */}
        <Modal 
          show={this.state.connectionModalShow} 
          onHide={this.handleConnectionModalClose}
          size={ this.props.profile.nFollowers && this.props.profile.nConnections ? "lg" : "sm"}>
          <Modal.Header closeButton>
            <Modal.Title>Connections</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            <div class={this.state.connectionsCompData && this.state.followersCompData ? "row" : ""}>
              {this.state.connectionsCompData && <div class="col">
                              <div class="text-center col-6 offset-3">
                                <ProfileSingleItemDonutChart data={this.state.connectionsCompData}/>
                              </div>
                            <p class="shadow-sm border mt-4 rounded p-2 text-muted fst-italic small">
                              {dbDataSanitizer.preSanitize(this.props.profile.fullName)+"'s connections pool is larger than "}
                              <span class="badge text-bg-primary">{this.state.connectionsCompData.value.toFixed(1)}</span>
                              {"% of all the profiles you've visited so far." }
                            </p>
                            </div>}

              {this.state.followersCompData && <div class="col">
                              <div class="text-center col-6 offset-3">
                                <ProfileSingleItemDonutChart data={this.state.followersCompData}/>
                              </div>
                            <p class="shadow-sm border mt-4 rounded p-2 text-muted fst-italic small">
                              {dbDataSanitizer.preSanitize(this.props.profile.fullName)+"'s followers pool is larger than "}
                              <span class="badge text-bg-primary">{this.state.followersCompData.value.toFixed(1)}</span>
                              {"% of all the profiles you've visited so far." }
                            </p>
                            </div>}

              { !this.state.followersCompData && !this.state.connectionsCompData && <div class="text-center m-5 mt-4">
                      <AlertCircleIcon size="100" className="text-muted"/>
                      <p><span class="badge text-bg-primary fst-italic shadow">No data to show.</span></p>
                    </div>}
            </div>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleConnectionModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </>
    );
  }
}
