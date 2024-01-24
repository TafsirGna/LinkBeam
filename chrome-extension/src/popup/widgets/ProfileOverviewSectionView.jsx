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
import { BarChartIcon } from "./SVGs";
import { dbDataSanitizer, sendDatabaseActionMessage, computePeriodTimeSpan, appParams, messageParams, dbData } from "../Local_library";

export default class ProfileOverviewSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      languageListModalShow: false,
      donutChartModalShow: false,
      donutChartModalTitle: null,
      donutChartModalItemData: null,
    };

    this.getPeriodTimeSpan = this.getPeriodTimeSpan.bind(this);
  }

  handleLanguageListModalClose = () => this.setState({languageListModalShow: false});
  handleLanguageListModalShow = () => this.setState({languageListModalShow: true});

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.globalData != this.props.globalData){
      if (prevProps.globalData.profiles != this.props.globalData.profiles){
        this.setDonutChartModalItemData();
      }
    }

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
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {if (this.props.profile.languages){ this.handleLanguageListModalShow(); }}}>
            <div class="card-body">
              <h6 class="card-title text-info-emphasis">{this.props.profile.languages ? this.props.profile.languages.length : 0}</h6>
              <p class="card-text">Languages</p>
            </div>
          </div>
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {}}>
            <div class="card-body">
              <h6 class="card-title text-danger-emphasis">{this.props.profile.projects ? this.props.profile.projects.length : 0}</h6>
              <p class="card-text">Projects</p>
            </div>
          </div>
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {}}>
            <div class="card-body">
              <h6 class="card-title text-success-emphasis">{this.props.profile.certifications ? this.props.profile.certifications.length : 0}</h6>
              <p class="card-text">Certifications</p>
            </div>
          </div>
        </div>

        { this.props.profile.experience && <div class="mt-4">
                  <SunBurstOverviewChart profile={this.props.profile} />
                </div>}

        <LanguageListModal profile={this.props.profile} show={this.state.languageListModalShow} onHide={this.handleLanguageListModalClose}/>

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
                                                      <span class="badge text-bg-primary">{this.state.donutChartModalItemData.value}</span>
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

      </>
    );
  }
}
