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

/*import './ReminderListItemView.css'*/
import React from 'react';
import moment from 'moment';
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import { db } from "../../db";
import { 
  getProfileDataFrom, 
} from "../Local_library";
import { DuplicateIcon } from "./SVGs";

export default class ReminderListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profileData: null,
    };

    this.setProfileData = this.setProfileData.bind(this);

  }

  componentDidMount() {

    this.setProfileData();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.object != this.props.object){
      this.setProfileData();
    }

  }

  async setProfileData(){

    const visits = await db.visits
                            .where("url")
                            .equals(this.props.object.url)
                            .sortBy("date");

    const profileData = getProfileDataFrom(visits);

    this.setState({profileData: profileData});

  }

  render(){
    return (
      <>

        { this.state.profileData && <a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                  <div class="d-flex gap-2 w-100 justify-content-between">
                    <div>
                      <h6 class="mb-0 d-flex gap-2 w-100">
                        <a href={"/index.html?view=Profile&data=" + this.props.object.url} target="_blank" class="text-decoration-none text-muted w-100">{this.state.profileData.fullName}</a>
                        <span class="text-muted">·</span>
                        <OverlayTrigger
                          placement="top"
                          overlay={<ReactTooltip id="tooltip1">Visit Linkedin Page</ReactTooltip>}
                        >
                          <a href={this.props.object.url} target="_blank" class="">
                            <DuplicateIcon
                              size="18"/>
                          </a>
                        </OverlayTrigger>
                      </h6>
                      <p class="mb-0 opacity-75 fst-italic" dangerouslySetInnerHTML={{__html: this.props.object.text}}></p>
                    </div>
                    <small class="opacity-50 text-nowrap">{moment(this.props.object.createdOn, moment.ISO_8601).fromNow()}</small>
                  </div>
                </a>}

      </>
    );
  }
}