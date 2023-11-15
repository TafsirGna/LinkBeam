/*import './ProfileViewReminderModal.css'*/
import React from 'react';
import { OverlayTrigger } from "react-bootstrap";
import { appParams } from "../Local_library";
import ProfileGanttChart from "./ProfileGanttChart";
import ProfileAboutSectionView from "./ProfileAboutSectionView";
import ProfileExperienceSectionView from "./ProfileExperienceSectionView";


export default class ProfileViewBody extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      currentTabIndex: 1,
      navTabTitles: [
        "Overview",
        "About",
        "Experience",
        "Education",
        "Activity",
      ],
    };
  }

  componentDidMount() {

    // Setting the data for the chart
  }

  switchToTabIndex(tabIndex){

    this.setState({currentTabIndex: tabIndex});

  }

  render(){
    return (
      <>
        <div class="card mt-4 shadow">
          <div class="card-header">
            <ul class="nav nav-tabs card-header-tabs">
              {this.state.navTabTitles.map((tabTitle, index) => (
                                                    <li class="nav-item">
                                                    <a class={"nav-link " + (this.state.currentTabIndex == index ? "active" : "")} aria-current={this.state.currentTabIndex == index ? "true" : ""} href="#" onClick={() => {this.switchToTabIndex(index)}}>{tabTitle}</a>
                                                  </li>
                                                  ))}
            </ul>
          </div>
          <div class="card-body">

            { this.state.currentTabIndex == 1 && <div class="">
                                                    <ProfileAboutSectionView profile={this.props.profile} />
                                                </div>}

            { this.state.currentTabIndex == 2 && <div class="">
                                                  <ProfileExperienceSectionView profile={this.props.profile}/>
                                                </div>}

          </div>
        </div>
      </>
    );
  }
}
