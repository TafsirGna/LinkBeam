/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import BackToPrev from "./widgets/BackToPrev";
import { LockIcon, GithubIcon, SendIcon, TagIcon } from "./widgets/SVGs";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  saveCurrentPageTitle, 
  appParams,
} from "./Local_library";
import { Link } from 'react-router-dom';

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
                overlay={<Tooltip id="tooltip1">Privacy by design {/*Incognito by design*/}</Tooltip>}
              >
                <span class="ms-2">
                  <LockIcon size="16"/>
                </span>
              </OverlayTrigger>
            </p>
            <p class="fw-light mt-2">
              LinkBeam is a light app designed to vizualize in a different way all publicly available linkedin profiles.
            </p>
            <p class="mt-2 small">
              Designed by {appParams.appAuthor}.
            </p>
            <div>
              <a href="https://github.com/TafsirGna/LinkBeam" target="_blank" title="View on github" class="mx-2">
                <GithubIcon size="24"/>
              </a>
              <Link to="/index.html/Feedback" title="Send feedback" class="mx-2">
                <SendIcon size="24"/>                
              </Link>
              <Link to="/index.html/LicenseCredits" title="See License and Credits" class="mx-2">
                <TagIcon size="24" />
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }
}
