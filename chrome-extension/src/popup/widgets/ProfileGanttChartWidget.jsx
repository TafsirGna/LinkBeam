/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

/*import './ProfileGanttChartWidget.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import {  
  dbDataSanitizer,
} from "../Local_library";
import ProfileGanttChart from "./charts/ProfileGanttChart";
import { AlertCircleIcon } from "./SVGs";

export default class ProfileGanttChartWidget extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      missingDataObjects: null,
    };

    this.setMissingDataObjects = this.setMissingDataObjects.bind(this);

  }

  componentDidMount() {

  }

  setMissingDataObjects(objects){
    this.setState({missingDataObjects: objects})
  }

  render(){
    return (
      <>
        <div> 
          <div class="shadow border rounded border-1 p-2">

              <ProfileGanttChart
                setMissingDataObjects={this.setMissingDataObjects}
                profile={this.props.profile}
                onClick={this.props.onChartClick}
                periodLabel={this.props.periodLabel}/>

              { this.state.missingDataObjects 
                  && this.state.missingDataObjects.length != 0 
                  && <div class="rounded border shadow mt-2 p-2">
                          { this.state.missingDataObjects.map((object) => (<span class="mx-1 handy-cursor badge align-items-center p-1 pe-2 text-secondary-emphasis bg-secondary-subtle border border-secondary-subtle rounded-pill">
                            <OverlayTrigger
                              placement="top"
                              overlay={<ReactTooltip id="tooltip1">Missing period data</ReactTooltip>}
                            >
                              <span><AlertCircleIcon size="16" className="text-warning rounded-circle me-1"/></span>
                            </OverlayTrigger>
                            {dbDataSanitizer.preSanitize(object.entity.name)}
                          </span>
                        ))}
                      </div>}
          </div>
          <p class="small badge text-muted fst-italic p-0">
            <span>
              Time chart of 
              {this.props.periodLabel == "experience" 
                ? " job experiences"
                : this.props.periodLabel == "education"
                  ? " institutions attended"
                  : " job experiences and institutions attended" }
            </span>
          </p>
        </div>
      </>
    );
  }
}
