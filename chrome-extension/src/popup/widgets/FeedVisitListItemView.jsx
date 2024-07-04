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

/*import './FeedVisitListItemView.css'*/
import React from 'react';
import linkedin_icon from '../../assets/linkedin_icon.png';
import { DateTime as LuxonDateTime } from "luxon";
import { getPostCount } from "../Local_library";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { db } from "../../db";

export default class FeedVisitListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      postCount: null,
    };

  }

  componentDidMount() {

    (async () => {

      this.setState({postCount: getPostCount(await db.feedPostViews.where({visitId: this.props.object.id}).toArray())});

    }).bind(this)();

  }

  componentDidUpdate(prevProps, prevState){


  }

  componentWillUnmount() {

  }

  render(){
    return (
      <>
        <a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
          <img src={ linkedin_icon } alt="twbs" width="40" height="40" class="shadow rounded flex-shrink-0"/>
          <div class="d-flex gap-2 w-100 justify-content-between">
            <div>
              <div class="d-flex gap-2 align-items-center">
                <h6 class="mb-0 d-flex align-items-center gap-1">
                  <a class="text-decoration-none text-black" href={`/index.html?view=FeedDash&data=${JSON.stringify({from: this.props.object.date, to: this.props.object.date})}`} target="_blank">Linkedin feed</a> 
                  { this.props.parentList == "aggregated" && <OverlayTrigger
                                          placement="top"
                                          overlay={<Tooltip id="tooltip1">{this.props.object.count} visit{this.props.object.count > 1 ? "s" : ""} { this.props.context == "all" ? " | " + LuxonDateTime.fromISO(this.props.object.date).toRelative() : " in total"}</Tooltip>}
                                        >
                                          <span class="text-muted badge text-bg-light shadow-sm border">{this.props.object.count}</span>
                                        </OverlayTrigger> }
                </h6>
                
                { this.props.parentList == "ordinary" && <small class={ this.props.object.date.split("T")[0] == (new Date()).toISOString().split("T")[0] ? "text-warning text-nowrap" : "opacity-50 text-nowrap"}>{LuxonDateTime.fromISO(this.props.object.date).toRelative()}</small> }
                { this.props.parentList == "aggregated" && <small class="opacity-50 text-nowrap ms-auto">{LuxonDateTime.fromISO(this.props.object.date).toFormat("MM-dd-yyyy")}</small>}
              </div>
              {this.state.postCount
                  && <p class="shadow-sm fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-warning">{this.state.postCount} viewed posts</p>}
            </div>
          </div>
        </a>
      </>
    );
  }
}
