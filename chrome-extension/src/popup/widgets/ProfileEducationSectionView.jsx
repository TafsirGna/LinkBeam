/*import './ProfileEducationSectionView.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { dbDataSanitizer } from "../Local_library";
import ProfileGanttChart from "./charts/ProfileGanttChart";
import ItemPercentageDoughnutChart from "./charts/ItemPercentageDoughnutChart";
import eventBus from "../EventBus";
import moment from 'moment';
import { BarChartIcon } from "./SVGs";
import EducationDetailsModal from "./modals/EducationDetailsModal";

export default class ProfileEducationSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      doughnutChartsData: null,
      edModalShow: false,
      selectedDonutChartElement: null,
    };
  }

  componentDidMount() {

    // setting doughnutChartsData
    var doughnutChartsData = []/*, 
        wordCloudData = []*/;
    for (var education of this.props.profile.education){

      var institutionName = dbDataSanitizer.institutionName(education.institutionName),
          // title = dbDataSanitizer.institutionName(education.degree),
          expTime = ((education.period.endDateRange.toDate() - education.period.startDateRange.toDate()) / this.props.computedData.educationTime) * 100;

      var index = doughnutChartsData.map(e => e.label.toLowerCase()).indexOf(institutionName.toLowerCase());
      if (index == -1){
        doughnutChartsData.push({
          label: institutionName,
          value: expTime,
        });
      }
      else{
        doughnutChartsData[index].value += expTime;
      }

      // index = wordCloudData.map(e => e.title).indexOf(title);
      // if (index == -1){
      //   wordCloudData.push({
      //     label: title,
      //     value: expTime,
      //   });
      // }
      // else{
      //   wordCloudData[index].value += expTime;
      // }
    }
    this.setState({
      doughnutChartsData: doughnutChartsData, 
      // wordCloudData: wordCloudData,
    });

  }

  showEdExpTimeChart(){
    eventBus.dispatch(eventBus.SHOW_ED_EXP_TIME_CHART_MODAL, null);
  }

  handleEdModalClose = () => { 
    this.setState({edModalShow: false}, 
    () => { this.setState({selectedDonutChartElement: null}); });
  };

  handleEdModalShow = (element) => { 
    this.setState({selectedDonutChartElement: element}, 
    () => { 
      this.setState({edModalShow: true});
    }
  )};

  render(){
    return (
      <>
        { this.state.doughnutChartsData &&  <div>
                                                <div class="container-fluid horizontal-scrollable">
                                                  <div class="rounded p-2 mt-2 mx-0 d-flex flex-row flex-nowrap row gap-3">
                                                    { this.state.doughnutChartsData.map((educationItem, index) =>  <div class="col-4 shadow rounded py-3 border">
                                                                                                                      <ItemPercentageDoughnutChart data={educationItem} className="handy-cursor" variant={"primary"} onClick={() => {this.handleEdModalShow(educationItem.label)}}/>
                                                                                                                    </div>) }
                                                  </div>
                                                </div>
                                                <p class="small badge text-muted fst-italic p-0 ps-2">
                                                  <span>Share of each education institution</span>
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
                periodLabel="education"
                onClick={(label) => {this.handleEdModalShow(label)}} />
          </div>
        </div>


        <EducationDetailsModal 
          show={this.state.edModalShow} 
          onHide={this.handleEdModalClose} 
          profile={this.props.profile} 
          label={this.state.selectedDonutChartElement}
          labelClass="institution"/>
      </>
    );
  }
}
