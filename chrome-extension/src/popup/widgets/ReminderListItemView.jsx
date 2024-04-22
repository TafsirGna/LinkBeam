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
import { 
  DuplicateIcon, 
  ClockIcon,
} from "./SVGs";
import { db } from "../../db";
import { 
  isLinkedinProfilePage,
} from "../Local_library";

export default class ReminderListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      reminderObject: null,
    };

  }

  componentDidMount() {

    this.setReminderObject();

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

  async setReminderObject(){

    if (this.state.reminderObject){
      return;
    }

    var post = null;
    try{

      post = await db.feedPosts
                         .where("uid")
                         .equals(this.props.object.objectId)
                         .first();

    }
    catch(error){
      console.error("Error : ", error);
    }

    if (!post){
      return null;
    }

    this.setState({reminderObject: post});

  }

  render(){
    return (
      <>

        <a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
          <div class="d-flex gap-2 w-100 justify-content-between">
            <div>
              <h6 class="mb-0 d-flex gap-2 w-100">
                { this.props.object.objectId.indexOf("/in/") != -1
                    && <a 
                                  href={this.getObjectLink()} 
                                  target="_blank" 
                                  class="text-decoration-none text-muted w-100">
                                  {this.getItemTitle()}
                                </a>}
                { this.props.object.objectId.indexOf("/in/") == -1
                    && <OverlayTrigger
                          placement="top"
                          overlay={<ReactTooltip id="tooltip1">{this.state.reminderObject 
                                                                  ? (this.state.reminderObject.initiator
                                                                      ? this.state.reminderObject.initiator.name
                                                                      : this.state.reminderObject.content.author.name)
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
                    href={ this.props.object.objectId.indexOf("/in/") != -1 ? `https://${this.props.object.objectId}` : this.getObjectLink() } 
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
                <span class="ms-2">{moment(this.props.object.date, moment.ISO_8601).format('ll')}</span>
              </div>
            </div>
            <small class="opacity-50 text-nowrap">{moment(this.props.object.createdOn, moment.ISO_8601).fromNow()}</small>
          </div>
        </a>

      </>
    );
  }
}