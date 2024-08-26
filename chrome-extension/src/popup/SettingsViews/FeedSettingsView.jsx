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
import BackToPrev from "../widgets/BackToPrev";
import PageTitleView from "../widgets/PageTitleView";
import { 
  saveCurrentPageTitle, 
  appParams,
  setGlobalDataSettings,
  saveSettingsPropertyValue,
} from "../Local_library";
import eventBus from "../EventBus";
import { db } from "../../db";
import { liveQuery } from "dexie";
import { 
  HideIcon,
  BookmarkIcon,
  PostIcon,
} from  "../widgets/SVGs";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

export default class FeedSettingsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.FEED_SETTINGS);

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

  }

  getBrowseFeedForMePostCountValue = () => (this.props.globalData.settings && this.props.globalData.settings.browseFeedForMePostCount) || appParams.defautBrowseFeedForMePostCount;

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
                    Hide posts {/*(if no change)*/} after
                  </strong>
                  <div class="dropdown">
                    <div data-bs-toggle="dropdown" aria-expanded="false" class="float-start py-0 handy-cursor">
                      <span class="rounded shadow-sm badge border text-primary">{this.props.globalData.settings ? this.props.globalData.settings.hidePostViewCount : null}</span>
                    </div>
                    <ul class="dropdown-menu shadow-lg border">
                      {appParams.allHidePostViewCountValues.map((value) => (
                            <li>
                              <a class="dropdown-item small" href="#" onClick={() => {this.saveSettingsPropertyValue("hidePostViewCount", value, this.props.globalData, db)}}>
                                {value}
                              </a>
                            </li>  
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <BookmarkIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Post highlight color
                  </strong>
                  { this.props.globalData.settings
                      && this.props.globalData.settings.postHighlightColor
                      && <input 
                            type="color" 
                            class="form-control form-control-color" 
                            value={this.props.globalData.settings.postHighlightColor} 
                            onChange={(event) => { saveSettingsPropertyValue("postHighlightColor", event.target.value, this.props.globalData, db); }}
                            title="Choose the feed post highlight color"/>}
                </div>
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <PostIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Post count | Browse feed for me
                  </strong>
                  { this.props.globalData.settings
                      /*&& this.props.globalData.settings.browseFeedForMePostCount*/
                      &&  <OverlayTrigger 
                            trigger="click" 
                            placement="top" 
                            overlay={<Popover id="popover-basic" className="shadow">
                                      {/*<Popover.Header as="h6" className="py-1">Post count</Popover.Header>*/}
                                      <Popover.Body className="py-1">
                                        <input 
                                          type="range" 
                                          class="form-range border rounded mt-1 px-1 shadow-sm" 
                                          min={appParams.defautBrowseFeedForMePostCount} 
                                          max={50} 
                                          step="5"
                                          value={this.getBrowseFeedForMePostCountValue()}
                                          onChange={(event) => { saveSettingsPropertyValue("browseFeedForMePostCount", event.target.value, this.props.globalData, db); }} />
                                      </Popover.Body>
                                    </Popover>}>
                            <span class="rounded shadow-sm badge border text-primary handy-cursor">
                              {`${this.getBrowseFeedForMePostCountValue()} posts`}
                          </span>
                        </OverlayTrigger>}
                </div>
              </div>
            </div>
          </div>

        </div>
      </>
    );
  }

}
