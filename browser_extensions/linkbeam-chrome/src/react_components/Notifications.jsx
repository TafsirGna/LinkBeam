/*import './About.css'*/
import React from 'react'
import BackToPrev from "./widgets/BackToPrev"
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default class Notifications extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    /*// Saving the current page title
    chrome.runtime.sendMessage({header: 'set-settings-data', data: {property: "currentPageTitle", value: "About"}}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Save page title request sent', response);
    });*/

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle="Activity"/>
          <div class="list-group small mt-3 shadow-sm">
            <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
              <div class="d-flex gap-2 w-100 justify-content-between">
                <div>
                  <h6 class="mb-0">List group item heading</h6>
                  <p class="mb-0 opacity-75">Some placeholder content in a paragraph.</p>
                </div>
                <small class="opacity-50 text-nowrap">now</small>
              </div>
            </a>
            <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
              <div class="d-flex gap-2 w-100 justify-content-between">
                <div>
                  <h6 class="mb-0">Another title here</h6>
                  <p class="mb-0 opacity-75">Some placeholder content in a paragraph that goes a little longer so it wraps to a new line.</p>
                </div>
                <small class="opacity-50 text-nowrap">3d</small>
              </div>
            </a>
            <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
              <div class="d-flex gap-2 w-100 justify-content-between">
                <div>
                  <h6 class="mb-0">Third heading</h6>
                  <p class="mb-0 opacity-75">Some placeholder content in a paragraph.</p>
                </div>
                <small class="opacity-50 text-nowrap">1w</small>
              </div>
            </a>
          </div>
        </div>
      </>
    );
  }
}
