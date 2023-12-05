/*import './HomeMenu.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { activateInCurrentTab } from "../Local_library";
import ProfileGanttChart from "./charts/ProfileGanttChart";
import ItemPercentageDoughnutChart from "./charts/ItemPercentageDoughnutChart";

export default class ProfileExperienceSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {



  }

  render(){
    return (
      <>
        <div class="container-fluid horizontal-scrollable">
        	<div class="rounded p-2 mt-2 mx-0 d-flex flex-row flex-nowrap row gap-3 border">
            { this.props.profile.experience.map((experienceItem, index) =>  <div class="col-4 shadow rounded py-3">
                                                                              <ItemPercentageDoughnutChart/>
                                                                            </div>) }
  		    </div>
        </div>

        <div class="shadow border rounded p-2 mt-5 mx-3 border-1">
    			<ProfileGanttChart profile={this.props.profile}/>
    		</div>
      </>
    );
  }
}
