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
import { 
  DuplicateIcon, 
  ClockIcon,
} from "./SVGs";
import { db } from "../../db";
import { DateTime as LuxonDateTime } from "luxon";
import { 
  isLinkedinProfilePage,
  appParams,
} from "../Local_library";

export default class ReminderListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      objectUrl: null,
    };

    this.getObjectUrl = this.getObjectUrl.bind(this);

  }

  componentDidMount() {
    this.getObjectUrl();
  }

  componentDidUpdate(prevProps, prevState){

  }

  async getObjectUrl(){

    var objectUrl = null
    if (isLinkedinProfilePage(this.props.object.objectId)){
      objectUrl = `/index.html?view=Profile&data=${this.props.object.objectId}`;
    }
    else{

      const feedPostView = await db.feedPostViews
                                   .where({feedPostId: this.props.object.objectId})
                                   .last();

      objectUrl = `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${feedPostView.htmlElId}`;
    }

    this.setState({objectUrl: objectUrl});

  }

  getTitle = () => isLinkedinProfilePage(this.props.object.objectId)
                    ? this.props.object.object.fullName
                    : `${this.props.object.object.profile.name} | feed`;

  render(){
    return (
      <>

        <a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
          <div class="d-flex gap-2 w-100 justify-content-between">
            <div>
              <h6 class="mb-0 d-flex gap-2 w-100">
                <a 
                  href={this.state.objectUrl} 
                  target="_blank" 
                  class="text-decoration-none text-muted w-100">
                  {this.getTitle()}
                </a>
              </h6>
              <p class="mb-0 opacity-75 fst-italic" /*dangerouslySetInnerHTML={{__html: this.props.object.text}}*/>{this.props.object.text}</p>
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