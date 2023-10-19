/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import BackToPrev from "./widgets/BackToPrev";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  saveCurrentPageTitle, 
  appParams,
} from "./Local_library";
import { Link } from 'react-router-dom';
/*import 'bootstrap/dist/css/bootstrap.min.css';*/

export default class About extends React.Component{

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
          <BackToPrev prevPageTitle="Activity"/>
          <div class="text-center">
            <img src={app_logo}  alt="" width="40" height="40"/>
            <p class="fw-bold mt-2">
              {appParams.appName}
              <span class="badge text-bg-primary ms-1 shadow">{appParams.appVersion}</span>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip1">Privacy by design {/*Incognito by design*/}</Tooltip>}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="#6c757d" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 ms-2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </OverlayTrigger>
            </p>
            <p class="fw-light mt-2">
              LinkBeam is a light app designed to vizualize in a different way all publicly available linkedin profiles.
            </p>
            <p class="mt-2 small">
              Designed by Tafsir GNA.
            </p>
            <div>
              <a href="https://github.com/TafsirGna/LinkBeam" target="_blank" title="View on github" class="mx-2">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#6c757d" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              <Link to="/index.html/Feedback" title="Send feedback" class="mx-2">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#6c757d" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </Link>
              <Link to="/index.html/LicenseCredits" title="See License and Credits" class="mx-2">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#6c757d" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }
}
