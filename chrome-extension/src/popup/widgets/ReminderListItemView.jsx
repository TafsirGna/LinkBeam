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
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import { 
  DuplicateIcon, 
  ClockIcon,
} from "./SVGs";
import { db } from "../../db";
import { DateTime as LuxonDateTime } from "luxon";
import { 
  isLinkedinProfilePage,
} from "../Local_library";

export default class ReminderListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

  }

  getObjectLink(){

    return isLinkedinProfilePage(this.props.object.objectId)
              ?  `/index.html?view=Profile&data=${this.props.object.objectId}`
              : `https://www.linkedin.com/feed/update/${this.props.object.objectId}`;

  }

  getItemTitle(){
    
    return isLinkedinProfilePage(this.props.object.objectId)
              ? this.props.object.object.fullName
              : "Feed Post";

  }

  render(){
    return (
      <>

        <a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
          <div class="d-flex gap-2 w-100 justify-content-between">
            <div>
              <h6 class="mb-0 d-flex gap-2 w-100">
                { isLinkedinProfilePage(this.props.object.objectId)
                    && <a 
                                  href={this.getObjectLink()} 
                                  target="_blank" 
                                  class="text-decoration-none text-muted w-100">
                                  {this.getItemTitle()}
                                </a>}
                { !isLinkedinProfilePage(this.props.object.objectId)
                    && <OverlayTrigger
                          placement="top"
                          overlay={<ReactTooltip id="tooltip1">{this.props.object.object 
                                                                  ? (this.props.object.object.initiator
                                                                      ? this.props.object.object.initiator.name
                                                                      : this.props.object.object.content.author.name)
                                                                  : null}</ReactTooltip>}
                        >
                          <a 
                            href={this.getObjectLink()} 
                            target="_blank" 
                            class="text-decoration-none text-muted w-100">
                            {this.getItemTitle()}
                          </a>
                        </OverlayTrigger>}
                <span class="text-muted">·</span>
                <OverlayTrigger
                  placement="top"
                  overlay={<ReactTooltip id="tooltip1">Visit Linkedin Page</ReactTooltip>}
                >
                  <a 
                    href={ isLinkedinProfilePage(this.props.object.objectId) ? `https://${this.props.object.objectId}` : this.getObjectLink() } 
                    target="_blank" 
                    class="">
                    <DuplicateIcon
                      size="18"/>
                  </a>
                </OverlayTrigger>
              </h6>
              <p class="mb-0 opacity-75 fst-italic" dangerouslySetInnerHTML={{__html: this.props.object.text}}></p>
              <div class={`small mt-1 ${new Date(this.props.object.date) >= new Date() ? "text-warning" : "text-muted"}`}>
                <ClockIcon
                  size="14"/>
                <span class="ms-2">{LuxonDateTime.fromISO(this.props.object.date).toFormat('MMMM dd, yyyy')}</span>
              </div>
            </div>
            <small class="opacity-50 text-nowrap">{LuxonDateTime.fromISO(this.props.object.createdOn).toRelative()}</small>
          </div>
        </a>

      </>
    );
  }
}