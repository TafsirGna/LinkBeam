/*import './HomeMenu.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { activateInCurrentTab } from "../Local_library";
import bell_icon from '../../assets/bell_icon.png';
import { LayersIcon } from "./SVGs";

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
            /*|| (this.props.globalData.currentTabWebPageData != null && this.props.globalData.currentTabWebPageData.codeInjected == false)*/)
          && <div class="dropdown">
                            <div data-bs-toggle="dropdown" aria-expanded="false" class={"float-start py-0 m-3 handy-cursor"}>
                              <img src={bell_icon} alt="twbs" width="20" height="20" class=""/>
                              <div class="spinner-grow spinner-grow-sm text-secondary ms-1" role="status">
                                <span class="visually-hidden">Loading...</span>
                              </div>
                            </div>
                            <ul class="dropdown-menu shadow-lg border border-secondary">
                              {/*{ (this.props.globalData.currentTabWebPageData != null && this.props.globalData.currentTabWebPageData.codeInjected == false) && <li><Link class="dropdown-item small" onClick={() => {activateInCurrentTab({productID: this.props.globalData.settings.productID})}}>Show ui in tab</Link></li>}*/}
                              { (this.props.globalData.todayReminderList && this.props.globalData.todayReminderList.length > 0) && <li><Link class="dropdown-item small" onClick={() => {this.props.handleOffCanvasShow()}}>{this.props.globalData.todayReminderList.length} unchecked reminder(s)</Link></li>}
                            </ul>
                          </div>}


        <div class="dropdown float-end m-3 mt-2 bd-gray">
          <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
            <LayersIcon size="18" className=""/>
          </div>
          <ul class="dropdown-menu shadow-lg">
            <li><Link class="dropdown-item small" to="/index.html/Statistics">Profiles' stats</Link></li>
            <li>
              <Link class="dropdown-item small" to="/index.html?redirect_to=FeedDashView" target="_blank">
                Feed's stats
              </Link>
            </li>
            <li><Link class="dropdown-item small" to="/index.html?redirect_to=CalendarView" target="_blank">Calendar</Link></li>
            <li><Link class="dropdown-item small" to="/index.html/Bookmarks">Bookmarks</Link></li>
            <li>
              <Link class="dropdown-item small" to="/index.html/ProfileActivity">
                All Profiles' Activity
              </Link>
            </li>
            <li><Link class="dropdown-item small" to="/index.html/Settings">Settings</Link></li>
            <li><Link class="dropdown-item small" to="/index.html/About">About</Link></li>
          </ul>
        </div>
      </>
    );
  }
}
