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

/*import './ProfileViewBody.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ProfileGanttChartWidget from "./ProfileGanttChartWidget";
import ProfileAboutSectionView from "./ProfileAboutSectionView";
import ProfileExperienceSectionView from "./ProfileExperienceSectionView";
import ProfileEducationSectionView from "./ProfileEducationSectionView";
import ProfileActivitySectionView from "./ProfileActivitySectionView";
import ProfileOverviewSectionView from "./ProfileOverviewSectionView";
import ProfileNetworkSectionView from "./ProfileNetworkSectionView";
import eventBus from "../EventBus";
import { DateTime as LuxonDateTime } from "luxon";
import { appParams, computePeriodTimeSpan } from "../Local_library";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { AlertCircleIcon } from "./SVGs";
import IncompleteSectionMessageView from "./IncompleteSectionMessageView";


export default class ProfileViewBody extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      currentTabIndex: 0,
      navTabTitles: [
        "Overview",
        "About",
        "Experience",
        "Education",
        "Activity",
        "Network",
      ],
      edExpTimeChartModalShow: false,
      profileComputedData: {
        experienceTime: null,
        educationTime: null,
      }

    };

    this.switchToTabIndex = this.switchToTabIndex.bind(this);
    this.displayTabTitle = this.displayTabTitle.bind(this);
    this.setProfileComputedData = this.setProfileComputedData.bind(this);
    
  }

  componentDidMount() {

    this.setProfileComputedData();

    // Setting the data for the chart
    eventBus.on(eventBus.SHOW_ED_EXP_TIME_CHART_MODAL, (data) =>
      {
        this.handleEdExpTimeChartModalShow();
      }
    );

  }

  componentWillUnmount(){
    eventBus.remove(eventBus.SHOW_ED_EXP_TIME_CHART_MODAL);
  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.profile != this.props.profile){
      if (prevProps.profile.experience != this.props.profile.experience
            || prevProps.profile.education != this.props.profile.education)
      this.setProfileComputedData();
    }

  }

  setProfileComputedData(){

    var experienceTime = computePeriodTimeSpan(this.props.profile.experience, "experience", LuxonDateTime);
    var educationTime = computePeriodTimeSpan(this.props.profile.education, "education", LuxonDateTime);

    this.setState(prevState => {
      let profileComputedData = Object.assign({}, prevState.profileComputedData);
      profileComputedData.experienceTime = experienceTime;
      profileComputedData.educationTime = educationTime;
      return { profileComputedData };
    });

  }

  switchToTabIndex(tabIndex){

    this.setState({currentTabIndex: tabIndex});

  }

  handleEdExpTimeChartModalClose = () => this.setState({edExpTimeChartModalShow: false});
  handleEdExpTimeChartModalShow = () => this.setState({edExpTimeChartModalShow: true});

  displayTabTitle(index){

    switch(index){
      // case 0:{
      //   break;
      // }
      case 4:{
        if (!this.props.profile.activity
              || (this.props.profile.activity && !this.props.profile.activity.length)){
          return false;
        }
        break;
      }
    }

    return true;

  }

  render(){
    return (
      <>
        <div class="card mt-4 shadow pb-3">
          <div class="card-header">
            <ul class="nav nav-tabs card-header-tabs">
              {this.state.navTabTitles.map((tabTitle, index) => ( this.displayTabTitle(index)
                                                &&  <li class="nav-item">
                                                      <a class={"nav-link " + (this.state.currentTabIndex == index ? "active" : "")} aria-current={this.state.currentTabIndex == index ? "true" : ""} href="#" onClick={() => {this.switchToTabIndex(index)}}>
                                                        {tabTitle} 
                                                        { index == 1 
                                                            && <span>
                                                                { !this.props.profile.info && <span class="ms-1 text-warning px-0">
                                                                                                      <OverlayTrigger
                                                                                                        placement="top"
                                                                                                        overlay={<Tooltip id="tooltip1">No data for this section</Tooltip>}
                                                                                                      >
                                                                                                        <span>
                                                                                                          <AlertCircleIcon
                                                                                                            size="16"/>
                                                                                                        </span>
                                                                                                      </OverlayTrigger>
                                                                                                    </span>}
                                                              </span>}
                                                        { index == 2 
                                                            && <span>
                                                                { this.props.profile.experience && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">
                                                                                                      {this.props.profile.experience.length}
                                                                                                  </span>}
                                                                { !this.props.profile.experience && <span class="ms-1 text-warning px-0">
                                                                                                      <OverlayTrigger
                                                                                                        placement="top"
                                                                                                        overlay={<Tooltip id="tooltip1">No data for this section</Tooltip>}
                                                                                                      >
                                                                                                        <span>
                                                                                                          <AlertCircleIcon
                                                                                                            size="16"/>
                                                                                                        </span>
                                                                                                      </OverlayTrigger>
                                                                                                    </span>}
                                                              </span>} 
                                                        { index == 3 
                                                            && <span>
                                                                  { this.props.profile.education && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">
                                                                                                        {this.props.profile.education.length}
                                                                                                    </span>}
                                                                  { !this.props.profile.education && <span class="ms-1 text-warning px-0">
                                                                                                        <OverlayTrigger
                                                                                                          placement="top"
                                                                                                          overlay={<Tooltip id="tooltip1">No data for this section</Tooltip>}
                                                                                                        >
                                                                                                          <span>
                                                                                                            <AlertCircleIcon
                                                                                                              size="16"/>
                                                                                                          </span>
                                                                                                        </OverlayTrigger>
                                                                                                      </span>}
                                                              </span>} 
                                                        { index == 4 
                                                            && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">
                                                                  {this.props.profile.activity.length}
                                                              </span>}
                                                        { index == 5 
                                                            && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">
                                                                {this.props.profile.profileSuggestions ? this.props.profile.profileSuggestions.length : ""}
                                                              </span>}
                                                      </a>
                                                    </li>
                                                  ))}
            </ul>
          </div>
          <div class="card-body">

            { this.state.currentTabIndex == 0 
                && <div class="">
                      <ProfileOverviewSectionView 
                        profile={this.props.profile} 
                        switchToTab={this.switchToTabIndex}
                        localDataObject={{profileComputedData: this.state.profileComputedData}} />
                  </div>}

            { this.state.currentTabIndex == 1 
                && <div class="">
                      <ProfileAboutSectionView 
                        profile={this.props.profile} 
                        localDataObject={this.props.localDataObject}/>
                  </div>}

            { this.state.currentTabIndex == 2 
                && <div class="">
                    <ProfileExperienceSectionView 
                        profile={this.props.profile} 
                        localDataObject={{profileComputedData: this.state.profileComputedData}} />
                  </div>}

            { this.state.currentTabIndex == 3 
                && <div class="">
                    <ProfileEducationSectionView 
                        profile={this.props.profile} 
                        localDataObject={{profileComputedData: this.state.profileComputedData}} />
                  </div>}

            { this.state.currentTabIndex == 4
                && this.props.profile.activity
                && this.props.profile.activity.length != 0
                && <div class="">
                    <ProfileActivitySectionView profile={this.props.profile} />
                  </div>}

            { this.state.currentTabIndex == 5 
                && <div class="">
                    <ProfileNetworkSectionView 
                      profile={this.props.profile} 
                      localDataObject={this.props.localDataObject} />
                  </div>}

          </div>
        </div>


        {/*Modals*/}
        
        {/*EdExpTimeChartModal*/}
        <Modal show={this.state.edExpTimeChartModalShow} onHide={this.handleEdExpTimeChartModalClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Education & Experience</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { ["experience", "education"].filter(sectionName => this.props.profile[sectionName][this.props.profile[sectionName].length - 1] == "incomplete")
                                         .map(sectionName => (<IncompleteSectionMessageView
                                                                sectionName={sectionName}
                                                                profile={this.props.profile}/>))}

            <ProfileGanttChartWidget
              profile={this.props.profile} 
              periodLabel="all" />

          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={this.handleEdExpTimeChartModalClose} 
              className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
