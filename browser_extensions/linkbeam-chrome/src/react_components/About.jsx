/*import './About.css'*/
import React from 'react'
import app_logo from '../assets/app_logo.svg'
import BackToPrev from "./widgets/BackToPrev"
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default class About extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      tooltipRef: null,
    };
  }

  componentDidMount() {

    // Saving the current page title
    chrome.runtime.sendMessage({header: 'set-settings-data', data: {property: "currentPageTitle", value: "About"}}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Save page title request sent', response);
    });

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle="Activity"/>
          <div class="text-center">
            <img src={app_logo}  alt=""/>
            <p class="fw-bold mt-2">
              LinkBeam 
              <span class="badge text-bg-primary ms-1 shadow">{this.props.globalData.appParams.appVersion}</span>
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
              <a href="https://github.com/TafsirGna/LinkBeam" target="_blank" title="View on github" >
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#6c757d" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }
}
