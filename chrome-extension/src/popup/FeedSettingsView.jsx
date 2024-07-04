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

import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import FolderListView from "./widgets/FolderListView";
import { 
  saveCurrentPageTitle, 
  appParams,
  setGlobalDataSettings,
} from "./Local_library";
import eventBus from "./EventBus";
import { db } from "../db";
import { liveQuery } from "dexie";
import { 
  HideIcon,
} from  "./widgets/SVGs";

export default class FeedSettingsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };

    this.saveSettingsPropertyValue = this.saveSettingsPropertyValue.bind(this);

  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.FEED_SETTINGS);

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

  }

  saveSettingsPropertyValue(property, value){

    var settings = this.props.globalData.settings;
    settings[property] = value;

    (async () => {

      await db.settings
              .update(1, settings);

    })();

  }

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.FEED_SETTINGS}/>

          <div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <HideIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Hide posts (if no change) after
                  </strong>
                  <div class="dropdown">
                    <div data-bs-toggle="dropdown" aria-expanded="false" class="float-start py-0 handy-cursor">
                      <span class="rounded shadow-sm badge border text-primary">{this.props.globalData.settings ? this.props.globalData.settings.hidePostViewCount : null}</span>
                    </div>
                    <ul class="dropdown-menu shadow-lg border">
                      {["Never", "2 views", "3 views"].map((value) => (
                            <li>
                              <a class="dropdown-item small" href="#" onClick={() => {this.saveSettingsPropertyValue("hidePostViewCount", value)}}>
                                {value}
                              </a>
                            </li>  
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/*<div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <TagIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Tags 
                    <span class="badge text-bg-light ms-1 shadow border">
                      {this.state.tagCount}
                    </span>
                  </strong>
                  <a 
                    href="#" 
                    class="text-primary badge" 
                    title="Add new tag"
                    onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.TAGS)}}>
                      Add
                  </a>
                </div>
              </div>
            </div>*/}
          </div>

        </div>
      </>
    );
  }

}
