/*import './ProfileViewReminderModal.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { appParams, computePeriodTimeSpan } from "../Local_library";
import ProfileGanttChart from "./charts/ProfileGanttChart";
import ProfileAboutSectionView from "./ProfileAboutSectionView";
import ProfileExperienceSectionView from "./ProfileExperienceSectionView";
import ProfileEducationSectionView from "./ProfileEducationSectionView";
import ProfileActivitySectionView from "./ProfileActivitySectionView";
import ProfileOverviewSectionView from "./ProfileOverviewSectionView";
import ProfileSuggestionsSectionView from "./ProfileSuggestionsSectionView";
import EducationExperienceTimeChartModal from "./modals/EducationExperienceTimeChartModal";
import eventBus from "../EventBus";
import moment from 'moment';


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
      computedProfileData: {
        experienceTime: null,
      }

    };
  }

  componentDidMount() {

    var experienceTime = computePeriodTimeSpan(this.props.profile.experience, "experience", {moment: moment});
    var educationTime = computePeriodTimeSpan(this.props.profile.education, "education", {moment: moment});

    this.setState(prevState => {
      let computedProfileData = Object.assign({}, prevState.computedProfileData);
      computedProfileData.experienceTime = experienceTime;
      computedProfileData.educationTime = educationTime;
      return { computedProfileData };
    });

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

  switchToTabIndex(tabIndex){

    this.setState({currentTabIndex: tabIndex});

  }

  handleEdExpTimeChartModalClose = () => this.setState({edExpTimeChartModalShow: false});
  handleEdExpTimeChartModalShow = () => this.setState({edExpTimeChartModalShow: true});

  render(){
    return (
      <>
        <div class="card mt-4 shadow pb-3">
          <div class="card-header">
            <ul class="nav nav-tabs card-header-tabs">
              {this.state.navTabTitles.map((tabTitle, index) => (
                                                    <li class="nav-item">
                                                    <a class={"nav-link " + (this.state.currentTabIndex == index ? "active" : "")} aria-current={this.state.currentTabIndex == index ? "true" : ""} href="#" onClick={() => {this.switchToTabIndex(index)}}>
                                                      {tabTitle} 
                                                      { index == 2 && <span>
                                                                        { this.props.profile.experience && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">
                                                                                                              {this.props.profile.experience.length}
                                                                                                          </span>}
                                                                        { !this.props.profile.experience && <span class="badge ms-1 text-warning px-0">
                                                                                                              <OverlayTrigger
                                                                                                                placement="top"
                                                                                                                overlay={<Tooltip id="tooltip1">No data for this section</Tooltip>}
                                                                                                              >
                                                                                                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                                                                                              </OverlayTrigger>
                                                                                                            </span>}
                                                                      </span>} 
                                                      { index == 3 && <span>
                                                                        { this.props.profile.education && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">
                                                                                                              {this.props.profile.education.length}
                                                                                                          </span>}
                                                                        { !this.props.profile.education && <span class="badge ms-1 text-warning px-0">
                                                                                                              <OverlayTrigger
                                                                                                                placement="top"
                                                                                                                overlay={<Tooltip id="tooltip1">No data for this section</Tooltip>}
                                                                                                              >
                                                                                                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                                                                                              </OverlayTrigger>
                                                                                                            </span>}
                                                                      </span>} 
                                                      { index == 4 && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">{this.props.profile.activity ? this.props.profile.activity.length : ""}</span>}
                                                      { index == 5 && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">{this.props.profile.profileSuggestions ? this.props.profile.profileSuggestions.length : ""}</span>}
                                                    </a>
                                                  </li>
                                                  ))}
            </ul>
          </div>
          <div class="card-body">

            { this.state.currentTabIndex == 0 && <div class="">
                                                    <ProfileOverviewSectionView profile={this.props.profile} computedData={this.state.computedProfileData} globalData={this.props.globalData} />
                                                </div>}

            { this.state.currentTabIndex == 1 && <div class="">
                                                    <ProfileAboutSectionView profile={this.props.profile} globalData={this.props.globalData}/>
                                                </div>}

            { this.state.currentTabIndex == 2 && <div class="">
                                                  { this.props.profile.experience && <ProfileExperienceSectionView profile={this.props.profile} computedData={this.state.computedProfileData} />}
                                                </div>}

            { this.state.currentTabIndex == 3 && <div class="">
                                                  { this.props.profile.education && <ProfileEducationSectionView profile={this.props.profile} computedData={this.state.computedProfileData} />}
                                                </div>}

            { this.state.currentTabIndex == 4 && <div class="">
                                                  <ProfileActivitySectionView profile={this.props.profile} />
                                                </div>}

            { this.state.currentTabIndex == 5 && <div class="">
                                                  <ProfileSuggestionsSectionView profile={this.props.profile} />
                                                </div>}

          </div>
        </div>

        <EducationExperienceTimeChartModal profile={this.props.profile} show={this.state.edExpTimeChartModalShow} onHide={this.handleEdExpTimeChartModalClose} />
      </>
    );
  }
}
