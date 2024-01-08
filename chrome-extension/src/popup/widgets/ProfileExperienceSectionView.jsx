/*import './HomeMenu.css'*/
import React from 'react';
// import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { computeExperienceTime, dbDataSanitizer } from "../Local_library";
import ProfileGanttChart from "./charts/ProfileGanttChart";
import ItemPercentageDoughnutChart from "./charts/ItemPercentageDoughnutChart";
import JobTitlesWordCloudChart from "./charts/JobTitlesWordCloudChart";
import JobTitlesBarChart from "./charts/JobTitlesBarChart";
import eventBus from "../EventBus";
import moment from 'moment';

export default class ProfileExperienceSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      doughnutChartsData: null,
      wordCloudData: null,
    };
  }

  componentDidMount() {

    // setting doughnutChartsData
    var doughnutChartsData = [], 
        wordCloudData = [];
    for (var experience of this.props.profile.experience){

      var companyLabel = dbDataSanitizer.companyName(experience.company),
          title = dbDataSanitizer.companyName(experience.title),
          expTime = ((experience.period.endDateRange.toDate() - experience.period.startDateRange.toDate()) / this.props.computedData.experienceTime) * 100;

      var index = doughnutChartsData.map(e => e.label).indexOf(companyLabel);
      if (index == -1){
        doughnutChartsData.push({
          label: companyLabel,
          value: expTime,
        });
      }
      else{
        doughnutChartsData[index].value += expTime;
      }

      index = wordCloudData.map(e => e.title).indexOf(title);
      if (index == -1){
        wordCloudData.push({
          label: title,
          value: expTime,
        });
      }
      else{
        wordCloudData[index].value += expTime;
      }
    }
    this.setState({
      doughnutChartsData: doughnutChartsData, 
      wordCloudData: wordCloudData,
    });

  }

  showEdExpTimeChart(){
    eventBus.dispatch(eventBus.SHOW_ED_EXP_TIME_CHART_MODAL, null);
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

        <div class="mt-2 mx-2">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="tooltip1">Click to chart education & experience</Tooltip>}
          >
            <div class="handy-cursor spinner-grow spinner-grow-sm text-secondary ms-1 mb-2" role="status" onClick={this.showEdExpTimeChart}>
              <span class="visually-hidden">Loading...</span>
            </div>
          </OverlayTrigger> 
    			<ProfileGanttChart profile={this.props.profile}/>
    		</div>

        <div class="mt-2 mx-2">
          {/*<JobTitlesWordCloudChart data={this.state.wordCloudData}/>*/}
          <JobTitlesBarChart data={this.state.wordCloudData}/>
        </div>
      </>
    );
  }
}
