/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

/*import './ProfileOverviewSectionCertificationWidget.css'*/
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { DateTime as LuxonDateTime } from "luxon";
import { 
  dbDataSanitizer,  
  appParams, 
  performProfileSubPartComparison,
} from "../Local_library";

export default class ProfileOverviewSectionCertificationWidget extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      certificationsModalShow: false,
      certificationsList: null,
    };

    this.showCertComparisonData = this.showCertComparisonData.bind(this);

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

  }

  handleCertificationsModalClose = () => this.setState({certificationsModalShow: false});
  handleCertificationsModalShow = () => {

    if (!this.props.profile.certifications){ 
      return;
    }

    this.setState({certificationsModalShow: true}, () => {

      if (this.state.certificationsList){
        return;
      }

      var certificationsList = [];
      for (var certification of this.props.profile.certifications){
        certification["linkedProfiles"] = null;
        certificationsList.push(certification); 
      }

      this.setState({
        certificationsList: certificationsList, 
      });

    });

  };

  showCertComparisonData(certName, index){

    if (!certName){
      alert("Not enough data to perform a comparison task! ");
      return;
    }

    if (!this.props.localDataObject.profiles){
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.PROFILES, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE });
      return;
    }

    // To prevent repeat this action multiple times
    if (this.state.certificationsList[index].linkedProfiles){
      return;
    }

    var profiles = performProfileSubPartComparison(this.props.profile, certName, this.props.localDataObject.profiles, "certifications");
    var certificationsList = this.state.certificationsList;
    certificationsList[index].linkedProfiles = profiles;

    this.setState({certificationsList: certificationsList});

  }

  render(){
    return (
      <>
        <div 
          class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" 
          onClick={this.handleCertificationsModalShow}>
          <div class="card-body">
            <h6 class="card-title text-success-emphasis">
              {this.props.profile.certifications 
                ? this.props.profile.certifications.length 
                : 0}
            </h6>
            <p class="card-text">Certifications</p>
          </div>
        </div>


        {/*Certfication Modal*/}
        <Modal 
          show={this.state.certificationsModalShow} 
          onHide={this.handleCertificationsModalClose}
          size="lg"
          >
          <Modal.Header closeButton>
            <Modal.Title>Certifications</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            { this.state.certificationsList && <div class="list-group small mt-1 shadow-sm border-0">
              { this.state.certificationsList.map((certification, index) => (<a 
                                                                                href="#" 
                                                                                class="border-0 list-group-item list-group-item-action d-flex gap-3 py-3" 
                                                                                aria-current="true" 
                                                                                onClick={() => {/*this.showCertComparisonData(certification.title ? dbDataSanitizer.preSanitize(certification.title) : null, index)*/}} 
                                                                                title="Click to show more data">
                                            <div class="d-flex gap-2 w-100 justify-content-between">
                                              <div>
                                                <p class="mb-1">
                                                  <span class="shadow badge align-items-center p-1 px-3 text-primary-emphasis bg-primary-subtle border border-primary-subtle rounded-pill mb-2">
                                                    {/*<img class="rounded-circle me-1" width="24" height="24" src={profileActivityObject.profile.avatar ? profileActivityObject.profile.avatar : default_user_icon} alt=""/>*/}
                                                    {certification.entity.name 
                                                      ? dbDataSanitizer.preSanitize(certification.entity.name) 
                                                      : "Missing data"}
                                                  </span>
                                                </p>
                                                <p class="text-muted mb-2">{certification.title ? dbDataSanitizer.preSanitize(certification.title) : "Missing data"}</p>
                                                { certification.linkedProfiles != null && <p class="bg-light fw-light mb-0 opacity-75 border border-warning small p-2 rounded shadow-sm fw-bold">
                                                                                                  {/*<AlertCircleIcon size="14"/>*/}
                                                                                                  It seems like 
                                                                                                  <OverlayTrigger
                                                                                                    placement="top"
                                                                                                    overlay={<Tooltip id="tooltip1">{(certification.linkedProfiles.length * 100) / this.props.localDataObject.profiles.length} %</Tooltip>}
                                                                                                  >
                                                                                                    <span class="badge text-bg-primary shadow-sm px-1 mx-1"> {(certification.linkedProfiles.length * 100) / this.props.localDataObject.profiles.length} </span> 
                                                                                                  </OverlayTrigger>
                                                                                                  % of all the profiles you've visited so far, got this certification { certification.linkedProfiles.length > 0 ? <span class="badge text-bg-primary" onClick={() => {alert("ok");}} >SHOW</span> : ""}
                                                                                                </p>}
                                              </div>
                                              { certification.period && <small class="opacity-50 text-nowrap">{LuxonDateTime.fromFormat(dbDataSanitizer.preSanitize(certification.period).replace("Issued ", ""), "MMM yyyy").toRelative()}</small>}
                                            </div>
                                          </a>))}
              </div>}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleCertificationsModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
