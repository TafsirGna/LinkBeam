/*import './HomeMenu.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import LanguageListModal from "./modals/LanguageListModal";
import SunBurstOverviewChart from "./charts/SunBurstOverviewChart";
import RadarOverviewChart from "./charts/RadarOverviewChart";
import ItemPercentageDoughnutChart from "./charts/ItemPercentageDoughnutChart";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import moment from 'moment';
import { BarChartIcon, AlertCircleIcon } from "./SVGs";
import { 
  dbDataSanitizer, 
  sendDatabaseActionMessage, 
  computePeriodTimeSpan, 
  appParams, 
  messageParams, 
  dbData,
  performCertComparison,
} from "../Local_library";

export default class ProfileOverviewSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      languageListModalShow: false,
      donutChartModalShow: false,
      donutChartModalTitle: null,
      donutChartModalItemData: null,
      certificationsModalShow: false,
      projectsModalShow: false,
      certificationsList: null,
    };

    this.getPeriodTimeSpan = this.getPeriodTimeSpan.bind(this);
    this.showCertComparisonData = this.showCertComparisonData.bind(this);
  }

  handleLanguageListModalClose = () => this.setState({languageListModalShow: false});
  handleLanguageListModalShow = () => {

    if (!this.props.profile.languages){ 
      return;
    }

    this.setState({languageListModalShow: true})
  };

  handleProjectsModalClose = () => this.setState({projectsModalShow: false});
  handleProjectsModalShow = () => {

    if (!this.props.profile.projects){ 
      return;
    }

    this.setState({projectsModalShow: true})
  };

  handleCertificationsModalClose = () => this.setState({certificationsModalShow: false});
  handleCertificationsModalShow = () => {

    if (!this.props.profile.certifications){ 
      return;
    }

    var certificationsList = [];
    for (var certification of this.props.profile.certifications){
      certification["linkedProfiles"] = null;
      certificationsList.push(certification); 
    }

    this.setState({
      certificationsList: certificationsList, 
      certificationsModalShow: true
    });

  };

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.globalData != this.props.globalData){
      if (prevProps.globalData.profiles != this.props.globalData.profiles){
        if (this.state.donutChartModalShow){
          this.setDonutChartModalItemData();
        }
        // if (this.state.certificationsModalShow){
        //   this.showCertComparisonData()
        // }
      }
    }

  }

  showCertComparisonData(certName, index){

    if (!certName){
      alert("Not enough data to perform a comparison task! ");
      return;
    }

    if (!this.props.globalData.profiles){
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.PROFILES, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE });
      return;
    }

    // To prevent repeat this action multiple times
    if (this.state.certificationsList[index].linkedProfiles){
      return;
    }

    var profiles = performCertComparison(this.props.profile, certName, this.props.globalData.profiles);
    var certificationsList = this.state.certificationsList;
    certificationsList[index].linkedProfiles = profiles;

    this.setState({certificationsList: certificationsList});

  }

  handleRadarChartModalClose = () => this.setState({radarChartModalShow: false});
  handleRadarChartModalShow = () => this.setState({radarChartModalShow: true});

  handleDonutChartModalClose = () => this.setState({donutChartModalShow: false, donutChartModalTitle: null, donutChartModalItemData: null});
  handleDonutChartModalShow = (title) => this.setState({donutChartModalShow: true, donutChartModalTitle: title}, () => {this.setDonutChartModalItemData();});

  setDonutChartModalItemData(){

    if (!this.props.globalData.profiles){
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.PROFILES, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE });
      return ;
    }

    var percentage = 0;
    for (var profile of this.props.globalData.profiles){
      if (this.state.donutChartModalTitle == "experience"){
        var timeLength = computePeriodTimeSpan(profile.experience, "experience", {moment: moment});
        if (profile.url != this.props.profile.url && timeLength <= this.props.computedData.experienceTime){
          percentage += 1;
        }
      }

      if (this.state.donutChartModalTitle == "education"){
        var timeLength = computePeriodTimeSpan(profile.education, "education", {moment: moment});
        if (profile.url != this.props.profile.url &&  timeLength <= this.props.computedData.educationTime){
          percentage += 1;
        }
      }
    }

    percentage /= this.props.globalData.profiles.length;
    percentage *= 100;

    this.setState({donutChartModalItemData : {
                label: this.state.donutChartModalTitle,
                value: percentage,
              }});
  }

  getPeriodTimeSpan(periodLabel){

    var periodtime = (periodLabel == "experience" ? this.props.computedData.experienceTime : this.props.computedData.educationTime);
    periodtime = Math.ceil(periodtime / (1000 * 60 * 60 * 24)) // diff days

    var y = Math.floor(periodtime / 365);
    var m = Math.floor(periodtime % 365 / 30);
    var d = Math.floor(periodtime % 365 % 30);

    var yDisplay = y > 0 ? y + (y == 1 ? " year " : " years ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? ", month, " : ", months ") : "";
    var dDisplay = d > 0 ? d + (d == 1 ? ", day" : ", days") : "";

    return (yDisplay + mDisplay/* + dDisplay*/);

  }

  render(){
    return (
      <>

        <div class="my-3 mx-2">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="tooltip1">Click to draw on radar chart</Tooltip>}
          >
            <span class="border shadow-sm rounded p-1 text-muted ms-2">
              <span  onClick={this.handleRadarChartModalShow} class="handy-cursor mx-1 text-primary">
                <BarChartIcon size="16"/>
              </span>
            </span>
          </OverlayTrigger> 
        </div>

        <div class="row mx-2 mt-1">
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {this.handleDonutChartModalShow("experience");}}>
            <div class="card-body">
              <h6 class="card-title text-primary-emphasis">~{(this.props.computedData && this.props.computedData.experienceTime) ? this.getPeriodTimeSpan("experience") : 0}</h6>
              <p class="card-text">Experience length</p>
            </div>
          </div>
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {this.handleDonutChartModalShow("education");}}>
            <div class="card-body">
              <h6 class="card-title text-warning-emphasis">~{(this.props.computedData && this.props.computedData.educationTime) ? this.getPeriodTimeSpan("education") : 0}</h6>
              <p class="card-text">Education length</p>
            </div>
          </div>
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={this.handleLanguageListModalShow}>
            <div class="card-body">
              <h6 class="card-title text-info-emphasis">{this.props.profile.languages ? this.props.profile.languages.length : 0}</h6>
              <p class="card-text">Languages</p>
            </div>
          </div>
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={this.handleProjectsModalShow}>
            <div class="card-body">
              <h6 class="card-title text-danger-emphasis">{this.props.profile.projects ? this.props.profile.projects.length : 0}</h6>
              <p class="card-text">Projects</p>
            </div>
          </div>
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={this.handleCertificationsModalShow}>
            <div class="card-body">
              <h6 class="card-title text-success-emphasis">{this.props.profile.certifications ? this.props.profile.certifications.length : 0}</h6>
              <p class="card-text">Certifications</p>
            </div>
          </div>
        </div>

        { this.props.profile.experience && <div class="mt-4">
                  <SunBurstOverviewChart profile={this.props.profile} />
                </div>}

        <LanguageListModal profile={this.props.profile} show={this.state.languageListModalShow} onHide={this.handleLanguageListModalClose} globalData={this.props.globalData}/>

        {/*Radar chart*/}
        <Modal 
          show={this.state.radarChartModalShow} 
          onHide={this.handleRadarChartModalClose}
          // size="lg"
          >
          <Modal.Header closeButton>
            <Modal.Title>Radar Chart</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            <div class="text-center">
              <RadarOverviewChart profile={this.props.profile} computedData={this.props.computedData}/>
            </div>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleRadarChartModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Donut chart modal */}
        <Modal 
          show={this.state.donutChartModalShow} 
          onHide={this.handleDonutChartModalClose}
          // size="lg"
          >
          <Modal.Header closeButton>
            <Modal.Title>Infos {this.state.donutChartModalTitle ? "("+this.state.donutChartModalTitle+")" : ""}</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { !this.state.donutChartModalItemData && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                  </div>
                </div>}
            
            { this.state.donutChartModalItemData && <div>
                                                      <div class="text-center col-6 offset-3">
                                                        <ItemPercentageDoughnutChart data={this.state.donutChartModalItemData}/>
                                                      </div>
                                                    <p class="shadow-sm border mt-4 rounded p-2 text-muted fst-italic small">
                                                      {dbDataSanitizer.fullName(this.props.profile.fullName)+"'s "+this.state.donutChartModalTitle+" is longer than "}
                                                      <span class="badge text-bg-primary">{(this.state.donutChartModalItemData.value).toFixed(1)}</span>
                                                      {"% of all the profiles you've visited so far." }
                                                    </p>
                                                    </div>}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleDonutChartModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

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
              { this.state.certificationsList.map((certification, index) => (<a href="#" class="border-0 list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true" onClick={() => {this.showCertComparisonData(certification.title ? dbDataSanitizer.preSanitize(certification.title) : null, index)}} title="Click to show more data">
                                            <div class="d-flex gap-2 w-100 justify-content-between">
                                              <div>
                                                <p class="mb-1">
                                                  <span class="shadow badge align-items-center p-1 px-3 text-primary-emphasis bg-primary-subtle border border-primary-subtle rounded-pill mb-2">
                                                    {/*<img class="rounded-circle me-1" width="24" height="24" src={profileActivityObject.profile.avatar ? profileActivityObject.profile.avatar : default_user_icon} alt=""/>*/}
                                                    {certification.issuer ? dbDataSanitizer.preSanitize(certification.issuer) : "Missing data"}
                                                  </span>
                                                </p>
                                                <p class="text-muted mb-2">{certification.title ? dbDataSanitizer.preSanitize(certification.title) : "Missing data"}</p>
                                                { certification.linkedProfiles != null && <p class="bg-light fw-light mb-0 opacity-75 border border-warning small p-2 rounded shadow-sm fw-bold">
                                                                                                  {/*<AlertCircleIcon size="14"/>*/}
                                                                                                  It seems like 
                                                                                                  <OverlayTrigger
                                                                                                    placement="top"
                                                                                                    overlay={<Tooltip id="tooltip1">{(certification.linkedProfiles.length * 100) / this.props.globalData.profiles.length} %</Tooltip>}
                                                                                                  >
                                                                                                    <span class="badge text-bg-primary shadow-sm px-1 mx-1"> {(certification.linkedProfiles.length * 100) / this.props.globalData.profiles.length} </span> 
                                                                                                  </OverlayTrigger>
                                                                                                  % of all the profiles you've visited so far, got this certification { certification.linkedProfiles.length > 0 ? <span class="badge text-bg-primary" onClick={() => {alert("ok");}} >SHOW</span> : ""}
                                                                                                </p>}
                                              </div>
                                              { certification.date && <small class="opacity-50 text-nowrap">{moment(dbDataSanitizer.preSanitize(certification.date).replace("Issued ", ""), "MMM YYYY").fromNow()}</small>}
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



        {/*Projects Modal*/}
        <Modal 
          show={this.state.projectsModalShow} 
          onHide={this.handleProjectsModalClose}
          size="lg"
          >
          <Modal.Header closeButton>
            <Modal.Title>Projects</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            { this.props.profile.projects && <div class="list-group small mt-1 shadow-sm border-0">
              { this.props.profile.projects.map((project, index) => (<a href="#" class="border-0 list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true" >
                                            <div class="d-flex gap-2 w-100 justify-content-between">
                                              <div>
                                                <p class="mb-1">
                                                  <span class="shadow badge align-items-center p-1 px-3 text-primary-emphasis bg-secondary-subtle border border-secondary rounded-pill mb-2">
                                                    {/*<img class="rounded-circle me-1" width="24" height="24" src={profileActivityObject.profile.avatar ? profileActivityObject.profile.avatar : default_user_icon} alt=""/>*/}
                                                    {project.name ? dbDataSanitizer.preSanitize(project.name) : "Missing data"}
                                                  </span>
                                                </p>
                                                <p class="text-muted mb-2 small ms-2 fst-italic">{project.period ? dbDataSanitizer.preSanitize(project.period) : "Missing period data"}</p>
                                              </div>
                                              {/*<small class="opacity-50 text-nowrap">{moment(new Date()).fromNow()}</small>*/}
                                            </div>
                                          </a>))}
              </div>}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleProjectsModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </>
    );
  }
}
