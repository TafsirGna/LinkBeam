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
import Form from 'react-bootstrap/Form';
import { 
  BoldIcon,
  MaximizeIcon,
} from  "../widgets/SVGs";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

export default class VisualsSettingsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.VISUALS_SETTINGS);

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

  }

  getFontFamilySetting = () => (this.props.globalData.settings && this.props.globalData.settings.fontFamily) || appParams.allFontFamilySettingValues[1].label;

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.VISUALS_SETTINGS}/>

          <div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <MaximizeIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Immersive mode
                  </strong>
                  <Form.Check // prettier-ignore
                    type="switch"
                    id="notif-custom-switch"
                    label=""
                    checked={ this.props.globalData.settings ? this.props.globalData.settings.immersiveMode : false }
                    onChange={(event) => {saveSettingsPropertyValue("immersiveMode", event.target.checked, this.props.globalData, db);}}
                  />
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>

            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <BoldIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Font family
                  </strong>
                  <div class="dropdown">
                    <div data-bs-toggle="dropdown" aria-expanded="false" class="float-start py-0 handy-cursor">
                      <span class="rounded shadow-sm badge border text-primary">{ this.getFontFamilySetting() }</span>
                    </div>
                    <ul class="dropdown-menu shadow-lg border">
                      {appParams.allFontFamilySettingValues.map((value, index) => (
                            <li>
                              <a 
                                class="dropdown-item small" 
                                href="#" 
                                onClick={() => {
                                  saveSettingsPropertyValue("fontFamily", value.label, this.props.globalData, db);
                                }}>
                                {value.label}
                              </a>
                            </li>  
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </>
    );
  }

}
