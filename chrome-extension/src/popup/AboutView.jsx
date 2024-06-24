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

/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import beaver_icon from '../assets/beaver_icon.png';
import BackToPrev from "./widgets/BackToPrev";
import { LockIcon, GithubIcon, SendIcon, TagIcon } from "./widgets/SVGs";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  saveCurrentPageTitle, 
  appParams,
  switchToView,
} from "./Local_library";
import eventBus from "./EventBus";

export default class AboutView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    saveCurrentPageTitle("About");

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>
          <div class="text-center">
            <img src={app_logo}  alt="" width="40" height="40"/>
            <p class="fw-bold mt-2">
              {appParams.appName}
              <span class="badge text-bg-primary ms-1 shadow">{appParams.appVersion}</span>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip1">Privacy by design</Tooltip>}
              >
                <span class="ms-2">
                  <LockIcon size="16"/>
                </span>
              </OverlayTrigger>
            </p>
            <p class="fw-light mt-2">
              LinkBeam is a light app designed to assist you in your browsing of Linkedin platform.
            </p>
            <p class="mt-2 small">
              Designed by {appParams.appAuthor}
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip1">Hello, there</Tooltip>}
              >
                <img 
                  src={beaver_icon} 
                  alt="twbs" 
                  width="14" 
                  height="14" 
                  class="rounded-circle flex-shrink-0"/>
              </OverlayTrigger>
              .
            </p>
            <div>
              <a 
                href="https://github.com/TafsirGna/LinkBeam" 
                target="_blank" 
                title="View on github" 
                class="mx-2">
                <GithubIcon size="24"/>
              </a>
              <a 
                href=/*"mailto:author@mail.com"*/"https://github.com/TafsirGna/LinkBeam/issues" 
                title="Send feedback" 
                class="mx-2">
                <SendIcon size="24"/>                
              </a>
              <a 
                href="#" 
                title="See License and Credits" 
                class="mx-2" 
                onClick={() => {switchToView(eventBus, "LicenseCredits")}}>
                <TagIcon size="24" />
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }
}
