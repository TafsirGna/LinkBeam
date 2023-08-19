/*import './HomeMenu.css'*/
import React from 'react';
import { Link } from 'react-router-dom';

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
            <li><Link class="dropdown-item small" to="/index.html/Calendar" >Calendar</Link></li>
            <li><Link class="dropdown-item small" to="/index.html/Statistics">Statistics</Link></li>
            <li><Link class="dropdown-item small" to="/index.html/Settings">Settings</Link></li>
            <li><Link class="dropdown-item small" to="/index.html/About" >About</Link></li>
          </ul>
        </div>
      </>
    );
  }
}
