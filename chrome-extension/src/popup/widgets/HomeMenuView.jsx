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

/*import './HomeMenu.css'*/
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  switchToView,
  appParams,
} from "../Local_library";
import bell_icon from '../../assets/bell_icon.png';
import { 
  LayersIcon,
  FolderIcon,
  SettingsIcon,
  BookmarkIcon,
  SearchIcon,
  BarChartIcon,
  BellIcon,
  HelpIcon,
  MediaIcon,
  CompassIcon,
} from "./SVGs";
import eventBus from "../EventBus";

export default class HomeMenu extends React.Component{

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

        { ((this.props.globalData.todayReminderList && this.props.globalData.todayReminderList.length > 0)
            /*|| (this.props.globalData.currentTabWebPageData != null && this.props.globalData.currentTabWebPageData.codeInjected == false)*/
            || this.props.args.previousDaySavedTime != null
            || (this.props.args.outdatedProfiles && this.props.args.outdatedProfiles.length != 0))
              && <div class="dropdown">
                            <div 
                              data-bs-toggle="dropdown" 
                              aria-expanded="false" 
                              class={"float-start py-0 m-3 handy-cursor"}>
                              <img 
                                src={bell_icon} 
                                alt="twbs" 
                                width="20" 
                                height="20" 
                                class=""/>
                              <div 
                                class="spinner-grow spinner-grow-sm text-secondary ms-1" 
                                role="status">
                                <span class="visually-hidden">Loading...</span>
                              </div>
                            </div>
                            <ul class="dropdown-menu shadow-lg border border-secondary">

                              {/*{ (this.props.globalData.currentTabWebPageData != null && this.props.globalData.currentTabWebPageData.codeInjected == false) && <li><a class="dropdown-item small" onClick={() => {activateInCurrentTab({productID: this.props.globalData.settings.productID})}}>Show ui in tab</a></li>}*/}
                              
                              { (this.props.globalData.todayReminderList 
                                    && this.props.globalData.todayReminderList.length > 0) 
                                  && <li><a class="dropdown-item small" onClick={() => {this.props.handleOffCanvasShow("Reminders")}}>{this.props.globalData.todayReminderList.length} unchecked reminder(s)</a></li>}
                              
                              { this.props.args.previousDaySavedTime 
                                  && <li><a class="dropdown-item small" onClick={() => {this.props.handleOffCanvasShow("Saved time")}} href="#">Time saved notification</a></li>}

                              { this.props.args.outdatedProfiles 
                                  && this.props.args.outdatedProfiles.length != 0
                                  && <li><a class="dropdown-item small" onClick={() => {this.props.handleOffCanvasShow("Outdated profiles")}} href="#">Some outdated profiles</a></li>}

                            </ul>
                          </div>}


        <div class="dropdown float-end m-3 mt-2 bd-gray">
          <div 
            class="dropdown-toggle handy-cursor" 
            data-bs-toggle="dropdown" 
            aria-expanded="false" 
            title="Actions">
            <LayersIcon 
              size="18" 
              className=""/>
          </div>
          <ul class="dropdown-menu shadow-lg">
            <li>
              <a 
                class="dropdown-item small" 
                href="#" 
                onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.STATISTICS)}}
                title="See profile visits statistics">
                <BarChartIcon
                  size="15"
                  className="me-2 text-muted"/>
                Profile visits stats
              </a>
            </li>
            <li>
              <a 
                class="dropdown-item small" 
                href="/index.html?view=FeedDash" 
                target="_blank"
                title="See feed visits statistics">
                <BarChartIcon
                  size="15"
                  className="me-2 text-muted"/>
                Feed visits stats
              </a>
            </li>
            <li>
              <a 
                class="dropdown-item small" 
                href="#" 
                onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.BOOKMARKS)}}
                title="List bookmarked profiles">
                <BookmarkIcon
                  size="15"
                  className="me-2 text-muted"/>
                Bookmarked Profiles
              </a>
            </li>
            <li>
              <a 
                class="dropdown-item small" 
                href="#" 
                onClick={() => {this.props.handleOffCanvasShow("Posts")}}
                title="Search a post">
                <SearchIcon
                  size="15"
                  className="me-2 text-muted"/>
                Search Posts
              </a>
            </li>
            <li>
              <a 
                class="dropdown-item small" 
                href="#" 
                onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.REMINDERS)}}
                title="List reminders">
                <BellIcon
                  size="15"
                  className="me-2 text-muted"/>
                Reminders
              </a>
            </li>
            <li>
              <a 
                class="dropdown-item small" 
                href="#" 
                onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.FOLDERS)}}
                title="List folders">
                <FolderIcon
                  size="15"
                  className="me-2 text-muted"/>
                Folders
              </a>
            </li>
            <li>
              <a 
                class="dropdown-item small" 
                href="/index.html?view=Media" 
                target="_blank"
                title="Display all media">
                <MediaIcon
                  size="15"
                  className="me-2 text-muted"/>
                Media center
              </a>
            </li>
            {/*<li>
              <a 
                class="dropdown-item small" 
                href="/index.html?view=Media" 
                target="_blank"
                title="Display all media">
                <MediaIcon
                  size="15"
                  className="me-2 text-muted"/>
                Profile Studio
              </a>
            </li>*/}
            <li>
              <a 
                class="dropdown-item small" 
                href="#" 
                onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.SETTINGS)}}
                title="See app settings">
                <SettingsIcon
                  size="15"
                  className="me-2 text-muted"/>
                Settings
              </a>
            </li>
            {/*<li>
              <a 
                class="dropdown-item small" 
                href="#" 
                onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.ABOUT)}}
                title="About the app">
                <CompassIcon
                  size="15"
                  className="me-2 text-muted"/>
                Did you know ... ?
              </a>
            </li>*/}
            <li>
              <a 
                class="dropdown-item small" 
                href="#" 
                onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.ABOUT)}}
                title="About the app">
                <HelpIcon
                  size="15"
                  className="me-2 text-muted"/>
                About
              </a>
            </li>
          </ul>
        </div>
      </>
    );
  }
}
