/*import './ProfileEducationSectionView.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { dbDataSanitizer } from "../Local_library";
import ProfileGanttChartWidget from "./ProfileGanttChartWidget";
import ProfileSingleItemDonutChart from "./Charts/ProfileSingleItemDonutChart";
import eventBus from "../EventBus";
import { BarChartIcon, AlertCircleIcon } from "./SVGs";
import EdExpInfoModal from "./Modals/EdExpInfoModal";
import sorry_icon from '../../assets/sorry_icon.png';
import IncompleteSectionMessageView from "./IncompleteSectionMessageView";

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

    if (!this.props.profile.education){
      return;
    }

    // setting doughnutChartsData
    var doughnutChartsData = []/*, 
        wordCloudData = []*/;
    for (var education of this.props.profile.education){

      if (education == "incomplete"){
        continue;
      }

      if (!education.period){
        continue
      }

      console.log("dddddddddddddd ed : ", education, education.period);

      var entityName = dbDataSanitizer.preSanitize(education.entity.name),
          edTime = ((education.period.endDateRange.toJSDate() - education.period.startDateRange.toJSDate()) / this.props.localDataObject.profileComputedData.educationTime) * 100;

      var index = doughnutChartsData.map(e => e.label.toLowerCase()).indexOf(entityName.toLowerCase());
      if (index == -1){
        doughnutChartsData.push({
          label: entityName,
          value: edTime,
          missingData: (education.period ? false : true),
        });
      }
      else{
        doughnutChartsData[index].value += edTime;
      }

    }
    this.setState({
      doughnutChartsData: doughnutChartsData, 
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

        { (!this.props.profile.education
              || (this.props.profile.education
                  && this.state.doughnutChartsData
                  && this.state.doughnutChartsData.length == 0)) 
            && <div class="text-center m-5 mt-2">
                    <img 
                      src={sorry_icon} 
                      width="80" />
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">Unable to retrieve education data for this user</span></p>
                  </div> }

        { this.props.profile.education 
            && this.state.doughnutChartsData
            && this.state.doughnutChartsData.length != 0
            && <div>

                    { this.props.profile.education[this.props.profile.education.length - 1] == "incomplete"
                        && <IncompleteSectionMessageView
                            sectionName="education"
                            profile={this.props.profile}/> }
                
                    <div>
                      <div class="container-fluid horizontal-scrollable">
                        <div class="rounded p-2 mt-2 mx-0 d-flex flex-row flex-nowrap row gap-3">
                          { this.state.doughnutChartsData.map((educationItem, index) =>  <div class="col-4 shadow rounded py-3 border">
                                                                                            <ProfileSingleItemDonutChart data={educationItem} className="handy-cursor" variant={"primary"} onClick={() => {this.handleEdModalShow(educationItem.label)}}/>
                                                                                          </div>) }
                        </div>
                      </div>
                      <p class="small badge text-muted fst-italic p-0 ps-2">
                        <span>Share of each education institution</span>
                      </p>
                    </div>
        
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
                       <ProfileGanttChartWidget 
                          profile={this.props.profile} 
                          periodLabel="education"
                          onChartClick={(label) => {this.handleEdModalShow(label)}} />
                    </div>
                  </div>
        
        
                  <EdExpInfoModal 
                    show={this.state.edModalShow} 
                    onHide={this.handleEdModalClose} 
                    profile={this.props.profile} 
                    label={this.state.selectedDonutChartElement}
                    section="education"
                    labelName="entityName"/>
        
                </div>}
      </>
    );
  }
}
