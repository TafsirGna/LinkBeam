/*import './HomeMenu.css'*/
import React from 'react';
// import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { dbDataSanitizer } from "../Local_library";
import ProfileGanttChart from "./charts/ProfileGanttChart";
import ItemPercentageDoughnutChart from "./charts/ItemPercentageDoughnutChart";
import JobTitlesBarChart from "./charts/JobTitlesBarChart";
import eventBus from "../EventBus";
import moment from 'moment';
import { BarChartIcon, AlertCircleIcon } from "./SVGs";
import JobDetailsModal from "./modals/JobDetailsModal";

export default class ProfileExperienceSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      doughnutChartsData: null,
      jobTitlesBarData: null,
      jobModalShow: false,
      selectedDonutChartElement: null,
    };
  }

  componentDidMount() {

    if (!this.props.profile.experience){
      return;
    }

    // setting doughnutChartsData
    var doughnutChartsData = [], 
        jobTitlesBarData = [];
    for (var experience of this.props.profile.experience){

      var companyLabel = dbDataSanitizer.companyName(experience.company),
          title = dbDataSanitizer.companyName(experience.title),
          expTime = ((experience.period.endDateRange.toDate() - experience.period.startDateRange.toDate()) / this.props.computedData.experienceTime) * 100;

      var index = doughnutChartsData.map(e => e.label.toLowerCase()).indexOf(companyLabel.toLowerCase());
      if (index == -1){
        doughnutChartsData.push({
          label: companyLabel,
          value: expTime,
        });
      }
      else{
        doughnutChartsData[index].value += expTime;
      }

      index = jobTitlesBarData.map(e => e.label.toLowerCase()).indexOf(title.toLowerCase());
      if (index == -1){
        jobTitlesBarData.push({
          label: title,
          value: expTime,
        });
      }
      else{
        jobTitlesBarData[index].value += expTime;
      }
    }
    this.setState({
      doughnutChartsData: doughnutChartsData, 
      jobTitlesBarData: jobTitlesBarData,
    });

  }

  showEdExpTimeChart(){
    eventBus.dispatch(eventBus.SHOW_ED_EXP_TIME_CHART_MODAL, null);
  }

  handleJobModalClose = () => { 
    this.setState({jobModalShow: false}, 
    () => { this.setState({selectedDonutChartElement: null}); });
  };

  handleJobModalShow = (element) => { 
    this.setState({selectedDonutChartElement: element}, 
    () => { 
      this.setState({jobModalShow: true});
    }
  )};

  render(){
    return (
      <>

        {/*<span>{ typeof this.props.profile.experience}</span>
        <span>{ JSON.stringify(this.props.profile.experience)}</span>*/}

        { !this.props.profile.experience && <div class="text-center m-5 mt-2">
                    <AlertCircleIcon size="100" className="text-muted"/>
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No experience data here</span></p>
                  </div> }

        { this.props.profile.experience && <div>

                    { this.state.doughnutChartsData &&  <div>
                                                        <div class="container-fluid horizontal-scrollable">
                                                          <div class="rounded p-2 mt-2 mx-0 d-flex flex-row flex-nowrap row gap-3">
                                                            { this.state.doughnutChartsData.map((experienceItem, index) =>  <div class="col-4 shadow rounded py-3 border">
                                                                                                                              <ItemPercentageDoughnutChart data={experienceItem} variant={"primary"} className="handy-cursor" onClick={() => {this.handleJobModalShow(experienceItem.label)}}/>
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
                    <span class="border shadow-sm rounded p-1 text-muted">
                      <span  onClick={this.showEdExpTimeChart} class="handy-cursor mx-1 text-primary">
                        <BarChartIcon size="16"/>
                      </span>
                    </span>
                  </OverlayTrigger> 
                  <div class="mt-3">
                     <ProfileGanttChart 
                        profile={this.props.profile} 
                        periodLabel="experience" 
                        onClick={(label) => {this.handleJobModalShow(label)}}/>
                  </div>
                </div>
        
                <div class="mt-2 mx-2">
                  <JobTitlesBarChart data={this.state.jobTitlesBarData} profile={this.props.profile}/>
                </div>
        
        
                <JobDetailsModal 
                  show={this.state.jobModalShow} 
                  onHide={this.handleJobModalClose} 
                  profile={this.props.profile} 
                  label={this.state.selectedDonutChartElement}
                  labelClass="company"/>


              </div>}


      </>
    );
  }
}
