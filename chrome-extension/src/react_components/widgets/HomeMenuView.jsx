/*import './HomeMenu.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { activateInCurrentTab } from "../Local_library";
import bell_icon from '../../assets/bell_icon.png';

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
            || (this.props.envData != null && this.props.envData.codeInjected == false))
          && <div class="dropdown">
                            <div data-bs-toggle="dropdown" aria-expanded="false" class={"float-start py-0 m-3 handy-cursor"}>
                              <img src={bell_icon} alt="twbs" width="20" height="20" class=""/>
                              <div class="spinner-grow spinner-grow-sm text-secondary ms-1" role="status">
                                <span class="visually-hidden">Loading...</span>
                              </div>
                            </div>
                            <ul class="dropdown-menu shadow-lg border border-secondary">
                              { (this.props.envData != null && this.props.envData.codeInjected == false) && <li><Link class="dropdown-item small" onClick={() => {activateInCurrentTab({productID: this.props.globalData.settings.productID})}}>Show ui in page</Link></li>}
                              { (this.props.globalData.todayReminderList && this.props.globalData.todayReminderList.length > 0) && <li><Link class="dropdown-item small" onClick={() => {this.props.handleOffCanvasShow()}}>{this.props.globalData.todayReminderList.length} unchecked reminder(s)</Link></li>}
                            </ul>
                          </div>}


        <div class="dropdown float-end m-3 mt-2 bd-gray">
          <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="gray" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          </div>
          <ul class="dropdown-menu shadow-lg">
            <li>
              <Link class="dropdown-item small" to="/index.html/Feed">
                Feed
                {/*<div class={"spinner-grow spinner-grow-sm text-danger ms-2 "} role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>*/}
              </Link>
            </li>
            <li><Link class="dropdown-item small" to="/index.html?redirect_to=CalendarView" target="_blank">Calendar</Link></li>
            <li><Link class="dropdown-item small" to="/index.html/Statistics">Statistics</Link></li>
            <li><Link class="dropdown-item small" to="/index.html/Settings">Settings</Link></li>
            <li><Link class="dropdown-item small" to="/index.html/About">About</Link></li>
          </ul>
        </div>
      </>
    );
  }
}
