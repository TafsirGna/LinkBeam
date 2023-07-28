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

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev onClick={() => this.props.switchOnDisplay("Activity")}/>
          <div class="text-center">
            <img src={app_logo}  alt=""/>
            <p class="fw-bold mt-2">
              LinkBeam 
              <span class="badge text-bg-primary ms-1">0.1.0</span>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip1">All data are stored locally</Tooltip>}
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
          </div>
        </div>
      </>
    );
  }
}
