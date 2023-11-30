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
      	<div class="shadow border border-info rounded p-2 m-5 mt-3 border-1 row">
          { this.props.profile.experience.map((experienceItem, index) =>  <div class="col-4">
                                                                            <ItemPercentageDoughnutChart/>
                                                                          </div>) }
		    </div>

        <div class="shadow border border-success rounded p-2 m-5 mt-2 border-1">
    			<ProfileGanttChart profile={this.props.profile}/>
    		</div>
      </>
    );
  }
}
