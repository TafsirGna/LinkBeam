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


/*import './ProfileOverviewSectionView.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ProfileOverviewSunBurstChart from "./charts/ProfileOverviewSunBurstChart";
import ProfileOverviewRadarChart from "./charts/ProfileOverviewRadarChart";
import ProfileSingleItemDonutChart from "./charts/ProfileSingleItemDonutChart";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ProfileOverviewSectionCertificationWidget from "./ProfileOverviewSectionCertificationWidget";
import ProfileOverviewSectionProjectWidget from "./ProfileOverviewSectionProjectWidget";
import ProfileOverviewSectionLanguageWidget from "./ProfileOverviewSectionLanguageWidget";
import moment from 'moment';
import { BarChartIcon } from "./SVGs";
import eventBus from "../EventBus";
import { db } from "../../db";
import { 
  dbDataSanitizer,  
  computePeriodTimeSpan, 
  appParams, 
  performProfileSubPartComparison,
  setLocalProfiles,
} from "../Local_library";

export default class ProfileOverviewSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      donutChartModalShow: false,
      donutChartModalTitle: null,
      donutChartModalItemData: null,
      allProfilesReadiness: false,
    };

    this.getPeriodTimeSpan = this.getPeriodTimeSpan.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.localDataObject != this.props.localDataObject){
      if (prevProps.localDataObject.profiles != this.props.localDataObject.profiles){
        if (this.state.donutChartModalShow){
          this.setDonutChartModalItemData();
        }
      }
    }

  }

  handleRadarChartModalClose = () => this.setState({radarChartModalShow: false});
  handleRadarChartModalShow = () => this.setState({radarChartModalShow: true});

  handleDonutChartModalClose = () => this.setState({donutChartModalShow: false, donutChartModalTitle: null});
  handleDonutChartModalShow = (title) => this.setState({donutChartModalShow: true, donutChartModalTitle: title}, async () => {
      
    setLocalProfiles(this, db, eventBus, ["experience", "education"], "setDonutChartModalItemData");

  });

  setDonutChartModalItemData(){

    var percentage = 0;
    for (var profile of this.props.localDataObject.profiles){
      if (this.state.donutChartModalTitle == "experience"){
        var timeLength = computePeriodTimeSpan(profile.experience, "experience", {moment: moment});
        if (profile.url != this.props.profile.url && timeLength <= this.props.localDataObject.profileComputedData.experienceTime){
          percentage += 1;
        }
      }

      if (this.state.donutChartModalTitle == "education"){
        var timeLength = computePeriodTimeSpan(profile.education, "education", {moment: moment});
        if (profile.url != this.props.profile.url &&  timeLength <= this.props.localDataObject.profileComputedData.educationTime){
          percentage += 1;
        }
      }
    }

    percentage /= this.props.localDataObject.profiles.length;
    percentage *= 100;

    this.setState({donutChartModalItemData : {
                label: this.state.donutChartModalTitle,
                value: percentage,
              }});
  }

  getPeriodTimeSpan(periodLabel){

    var periodtime = (periodLabel == "experience" ? this.props.localDataObject.profileComputedData.experienceTime : this.props.localDataObject.profileComputedData.educationTime);
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
          <div 
            class=/*handy-cursor*/" card mb-3 shadow small text-muted col mx-2 border border-1" 
            /*onClick={() => {this.handleDonutChartModalShow("experience");}}*/>
            <div class="card-body">
              <h6 class="card-title text-primary-emphasis">
                ~{(this.props.localDataObject.profileComputedData 
                    && this.props.localDataObject.profileComputedData.experienceTime) 
                  ? this.getPeriodTimeSpan("experience") : 0}
              </h6>
              <p class="card-text">Experience length</p>
            </div>
          </div>
          <div 
            class=/*handy-cursor*/" card mb-3 shadow small text-muted col mx-2 border border-1" 
            /*onClick={() => {this.handleDonutChartModalShow("education");}}*/>
            <div class="card-body">
              <h6 class="card-title text-warning-emphasis">
                ~{(this.props.localDataObject.profileComputedData 
                    && this.props.localDataObject.profileComputedData.educationTime) 
                  ? this.getPeriodTimeSpan("education") : 0}
              </h6>
              <p class="card-text">Education length</p>
            </div>
          </div>

          <ProfileOverviewSectionLanguageWidget 
            profile={this.props.profile}/>
          
          <ProfileOverviewSectionProjectWidget
            profile={this.props.profile}/>

          <ProfileOverviewSectionCertificationWidget
            profile={this.props.profile}/>
        </div>

        <div class="mt-4">
          <ProfileOverviewSunBurstChart 
            profile={this.props.profile} />
        </div>

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
              <ProfileOverviewRadarChart 
                profile={this.props.profile} 
                localDataObject={this.props.localDataObject}/>
            </div>

          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={this.handleRadarChartModalClose} 
              className="shadow">
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
            <Modal.Title>
              Infos {this.state.donutChartModalTitle ? "("+this.state.donutChartModalTitle+")" : ""}
            </Modal.Title>
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
                                                        <ProfileSingleItemDonutChart 
                                                          data={this.state.donutChartModalItemData}/>
                                                      </div>
                                                    <p class="shadow-sm border mt-4 rounded p-2 text-muted fst-italic small">
                                                      {dbDataSanitizer.preSanitize(this.props.profile.fullName)+"'s "+this.state.donutChartModalTitle+" is longer than "}
                                                      <span class="badge text-bg-primary">{(this.state.donutChartModalItemData.value).toFixed(1)}</span>
                                                      {"% of all the profiles you've visited so far." }
                                                    </p>
                                                    </div>}

          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={this.handleDonutChartModalClose} 
              className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </>
    );
  }
}
