/*import './HomeMenu.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { computeExperienceTime, dbDataSanitizer } from "../Local_library";
import ProfileGanttChart from "./charts/ProfileGanttChart";
import ItemPercentageDoughnutChart from "./charts/ItemPercentageDoughnutChart";
import ExperienceWordCloud from "./charts/ExperienceWordCloud";

export default class ProfileExperienceSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      doughnutChartsData: null,
    };
  }

  componentDidMount() {

    // setting doughnutChartsData
    var doughnutChartsData = [];
    for (var experience of this.props.profile.experience){
      doughnutChartsData.push({
        label: dbDataSanitizer.companyName(experience.company),
        value: 0,
      });
    }
    this.setState({doughnutChartsData: doughnutChartsData});

  }

  render(){
    return (
      <>
        { this.state.doughnutChartsData &&  <div>
                                                <div class="container-fluid horizontal-scrollable">
                                                  <div class="rounded p-2 mt-2 mx-0 d-flex flex-row flex-nowrap row gap-3">
                                                    { this.state.doughnutChartsData.map((experienceItem, index) =>  <div class="col-4 shadow rounded py-3 border">
                                                                                                                      <ItemPercentageDoughnutChart data={experienceItem} variant={"primary"}/>
                                                                                                                    </div>) }
                                                  </div>
                                                </div>
                                                <p class="small badge text-muted fst-italic p-0 ps-2">
                                                  <span>Share of each job experience</span>
                                                </p>
                                              </div>}

        <div class="mt-4 mx-2">
    			<ProfileGanttChart profile={this.props.profile}/>
    		</div>

        <div class="mt-4 mx-2">
          <ExperienceWordCloud />
        </div>
      </>
    );
  }
}
