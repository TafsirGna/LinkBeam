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
/*import './Settings.css'*/
import BackToPrev from "../widgets/BackToPrev";
import PageTitleView from "../widgets/PageTitleView";
import Form from 'react-bootstrap/Form';
import { liveQuery } from "dexie"; 
import { 
  saveCurrentPageTitle,
  appParams,
  switchToView,
  setGlobalDataSettings,
  saveSettingsPropertyValue,
} from "../Local_library";
import eventBus from "../EventBus";
import { db } from "../../db";
import { 
  AlertCircleIcon,
  BellIcon,
  DuplicateIcon,
  UserIcon,
  ClockIcon,
  StorageIcon,
  GridIcon,
  FeedIcon,
  EyeIcon,
  BoltIcon,
} from "../widgets/SVGs";

export default class SettingsView extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      
    };

  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.SETTINGS);

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

  }

  componentDidUpdate(prevProps, prevState){

  }

  componentWillUnmount(){

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>

          <div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <BellIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Enable popup notifications
                  </strong>
                  <Form.Check // prettier-ignore
                    type="switch"
                    id="notif-custom-switch"
                    label=""
                    checked={ this.props.globalData.settings ? this.props.globalData.settings.notifications : false }
                    onChange={(event) => {saveSettingsPropertyValue("notifications", event.target.checked, this.props.globalData, db);}}
                  />
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <DuplicateIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Auto tab opening
                  </strong>
                  <Form.Check // prettier-ignore
                    type="switch"
                    id="notif-custom-switch"
                    label=""
                    checked={ this.props.globalData.settings ? this.props.globalData.settings.autoTabOpening : false }
                    onChange={(event) => {saveSettingsPropertyValue("autoTabOpening", event.target.checked, this.props.globalData, db);}}
                  />
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            { this.props.globalData.settings 
                && this.props.globalData.settings.notifications
                && <div class="d-flex text-body-secondary pt-3">
                          <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                            <div class="d-flex justify-content-between">
                              <strong class="text-gray-dark">
                                <BellIcon
                                  size="15"
                                  className="me-2 text-muted"/>
                                Outdated profiles reminder
                              </strong>
                              <div class="dropdown">
                                <div data-bs-toggle="dropdown" aria-expanded="false" class="float-start py-0 handy-cursor">
                                  <span class="rounded shadow-sm badge border text-primary">{this.props.globalData.settings ? this.props.globalData.settings.outdatedProfileReminder : null}</span>
                                </div>
                                <ul class="dropdown-menu shadow-lg border">
                                  {appParams.allOutdatedProfileReminderSettingValues.map((value) => (
                                        <li>
                                          <a class="dropdown-item small" href="#" onClick={() => {saveSettingsPropertyValue("outdatedProfileReminder", value, this.props.globalData, db)}}>
                                            {value}
                                          </a>
                                        </li>  
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>}
            { this.props.globalData.settings 
                && this.props.globalData.settings.notifications
                && <div class="d-flex text-body-secondary pt-3">
                          <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                            <div class="d-flex justify-content-between">
                              <strong class="text-gray-dark">
                                <ClockIcon
                                  size="15"
                                  className="me-2 text-muted"/>
                                Max time per day
                              </strong>
                              <div class="dropdown">
                                <div data-bs-toggle="dropdown" aria-expanded="false" class="float-start py-0 handy-cursor">
                                  <span class="rounded shadow-sm badge border text-primary">{this.props.globalData.settings ? this.props.globalData.settings.maxTimeAlarm : null}</span>
                                </div>
                                <ul class="dropdown-menu shadow-lg border">
                                  {appParams.allMaxTimeAlarmSettingValues.map((value) => (
                                        <li>
                                          <a class="dropdown-item small" href="#" onClick={() => {saveSettingsPropertyValue("maxTimeAlarm", value, this.props.globalData, db)}}>
                                            {value}
                                          </a>
                                        </li>  
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>}
            {/*<div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Dark Theme</strong>
                  <Form.Check // prettier-ignore
                    type="switch"
                    id="theme-custom-switch"
                    label=""
                    checked={this.state.darkThemeCheckBoxValue}
                    onChange={this.saveDarkThemeState}
                  />
                </div>
              </div>
            </div>*/}
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <GridIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Objects
                  </strong>
                  <a 
                    href="#" 
                    class="text-primary badge" 
                    title="View Objects"
                    onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.OBJECTS_SETTINGS)}}>
                      View
                  </a>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <UserIcon
                      size="15"
                      className="me-2 text-muted"/>
                    My identity
                  </strong>
                  <a 
                    href="#" 
                    class="text-primary badge" 
                    title="View My ID"
                    onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.MY_ACCOUNT)}}>
                      View
                  </a>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <FeedIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Feed
                  </strong>
                  <a 
                    href="#" 
                    class="text-primary badge" 
                    title="View feed settings"
                    onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.FEED_SETTINGS)}}>
                      View
                  </a>
                </div>
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <StorageIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Data
                  </strong>
                  <a 
                    href="#" 
                    class="text-primary badge" 
                    title="View data Settings"
                    onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.DATA_SETTINGS)}}>
                      View
                  </a>
                </div>
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <EyeIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Visuals
                  </strong>
                  <a 
                    href="#" 
                    class="text-primary badge" 
                    title="View visuals settings"
                    onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.VISUALS_SETTINGS)}}>
                      View
                  </a>
                </div>
              </div>
            </div>
            {/*<div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <BoltIcon
                      size="15"
                      className="me-2 text-muted"/>
                    AI
                  </strong>
                  <a 
                    href="#" 
                    class="text-primary badge" 
                    title="View visuals settings"
                    onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.AI_SETTINGS)}}>
                      View
                  </a>
                </div>
              </div>
            </div>*/}
          </div>
        </div>
      </>
    )
  }
}
