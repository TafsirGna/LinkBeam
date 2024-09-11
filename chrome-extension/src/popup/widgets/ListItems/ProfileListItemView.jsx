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

/*import './ProfileListItemView.css'*/
import React from 'react';
import default_user_icon from '../../../assets/user_icons/default.png';
import { DateTime as LuxonDateTime } from "luxon";
import { 
  dbDataSanitizer, 
} from "../../Local_library";

export default class ProfileListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){


  }

  componentWillUnmount() {

  }

  render(){
    return (
      <>
        <a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
          <img src={this.props.profile.avatar ? this.props.profile.avatar : default_user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
          <div class="d-flex gap-2 w-100 justify-content-between">
            <div>
              <div class="d-flex gap-2 align-items-center">
                <h6 class="mb-0 d-flex align-items-center gap-1">
                  <a class="text-decoration-none text-black" href={`/index.html?view=Profile&data=${this.props.profile.url}`} target="_blank">{dbDataSanitizer.preSanitize(this.props.profile.fullName)}</a> 
                </h6>
                
                <small class="opacity-50 text-nowrap ms-auto">{LuxonDateTime.fromISO(this.props.profile.lastVisit.date).toFormat("MM-dd-yyyy")}</small>
              </div>
              {this.props.profile.title && <p class="mb-0 opacity-75 small">{dbDataSanitizer.preSanitize(this.props.profile.title)}</p>}
              <p class="shadow-sm fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-warning">{dbDataSanitizer.profileRelationDataPreproc(this.props.profile.nFollowers)} · {dbDataSanitizer.profileRelationDataPreproc(this.props.profile.nConnections)}</p>
            </div>
          </div>
        </a>
      </>
    );
  }
}
