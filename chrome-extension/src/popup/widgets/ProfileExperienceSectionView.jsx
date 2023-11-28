/*import './HomeMenu.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { activateInCurrentTab } from "../Local_library";
import ProfileGanttChart from "./charts/ProfileGanttChart";

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
      	<div class="shadow border border-success rounded p-2 my-5 mt-3 border-2">
			
		    </div>

        <div class="shadow border border-success rounded p-2 m-5 mt-2 border-2">
    			<ProfileGanttChart profile={this.props.profile}/>
    		</div>
      </>
    );
  }
}
