/*import './About.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { saveCurrentPageTitle } from "./Local_library";
/*import 'bootstrap/dist/css/bootstrap.min.css';*/

export default class Feed extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      notifications: null,
      newsList: null,
      currentTabIndex: 0,
    };
  }

  componentDidMount() {

    saveCurrentPageTitle("Feed");

  }

  switchCurrentTab(index){

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.PROFILE_ACTIVITY}/>

          <div class="text-center mt-3">
            <div class="btn-group btn-group-sm mb-2 shadow-sm" role="group" aria-label="Small button group">
              <button type="button" class={"btn btn-primary badge" + (this.state.currentTabIndex == 0 ? " active " : "")} onClick={() => {this.switchCurrentTab(0)}}>
                Notifs {(this.state.notifications && this.state.notifications.length != 0) ? "("+this.state.notifications.length+")" : null}
              </button>
              <button type="button" class={"btn btn-secondary badge" + (this.state.currentTabIndex == 1 ? " active " : "") } title="See News" onClick={() => {this.switchCurrentTab(1)}} >
                News {(this.state.newsList && this.state.newsList.length != 0) ? "("+this.state.newsList.length+")" : null}
              </button>
            </div>
          </div>

          <div class="list-group small mt-1 shadow-sm">
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
