/*import './ProfileViewReminderModal.css'*/
import React from 'react';
import { OverlayTrigger } from "react-bootstrap";
import { appParams } from "../Local_library";
import ProfileGanttChart from "./charts/ProfileGanttChart";
import ProfileAboutSectionView from "./ProfileAboutSectionView";
import ProfileExperienceSectionView from "./ProfileExperienceSectionView";
import ProfileActivitySectionView from "./ProfileActivitySectionView";
import ProfileOverviewSectionView from "./ProfileOverviewSectionView";
import EducationExperienceTimeChartModal from "./modals/EducationExperienceTimeChartModal";
import eventBus from "../EventBus";
import Offcanvas from 'react-bootstrap/Offcanvas';
import RelationshipsChart from "./charts/RelationshipsChart";


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
        "Suggestions",
      ],
      edExpTimeChartModalShow: false,
      suggestionsOffCanvasShow: true,
    };
  }

  componentDidMount() {

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

  handleSuggestionsOffCanvasClose = () => {
    this.setState({suggestionsOffCanvasShow: false})
  };

  handleSuggestionsOffCanvasShow = () => {
      this.setState({suggestionsOffCanvasShow: true});
  };

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
                                                      { index == 2 && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">{this.props.profile.experience.length}</span>} 
                                                      {/*{ index == 3 && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">{this.props.profile.experience.length}</span>} 
                                                                                                            { index == 4 && <span class="badge text-bg-light ms-1 border shadow-sm text-muted">{this.props.profile.experience.length}</span>} */}
                                                    </a>
                                                  </li>
                                                  ))}
            </ul>
          </div>
          <div class="card-body">

            { this.state.currentTabIndex == 0 && <div class="">
                                                    <ProfileOverviewSectionView profile={this.props.profile} />
                                                </div>}

            { this.state.currentTabIndex == 1 && <div class="">
                                                    <ProfileAboutSectionView profile={this.props.profile} />
                                                </div>}

            { this.state.currentTabIndex == 2 && <div class="">
                                                  <ProfileExperienceSectionView profile={this.props.profile}/>
                                                </div>}

            { this.state.currentTabIndex == 4 && <div class="">
                                                  <ProfileActivitySectionView profile={this.props.profile}/>
                                                </div>}

            { this.state.currentTabIndex == 5 && <div class="">
                                                  <RelationshipsChart objects={[]} />

                                                  <Offcanvas show={this.state.suggestionsOffCanvasShow} onHide={this.handleSuggestionsOffCanvasClose}>
                                                    <Offcanvas.Header closeButton>
                                                      <Offcanvas.Title>Suggestions</Offcanvas.Title>
                                                    </Offcanvas.Header>
                                                    <Offcanvas.Body>
                                                      {/**/}
                                                    </Offcanvas.Body>
                                                  </Offcanvas>
                                                </div>}

          </div>
        </div>

        <EducationExperienceTimeChartModal profile={this.props.profile} show={this.state.edExpTimeChartModalShow} onHide={this.handleEdExpTimeChartModalClose} />
      </>
    );
  }
}
