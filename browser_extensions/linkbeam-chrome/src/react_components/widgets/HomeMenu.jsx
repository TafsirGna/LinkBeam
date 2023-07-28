/*import './HomeMenu.css'*/
import React from 'react'

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
            <li><a class="dropdown-item small" href="#" onClick={() => {this.props.switchOnDisplay("Notifications");}}>Notifications</a></li>
            <li><a class="dropdown-item small" href="#" onClick={() => {this.props.switchOnDisplay("NewsFeed");}}>NewsFeed</a></li>
            <li><a class="dropdown-item small" href="#" onClick={() => {this.props.switchOnDisplay("Statistics");}}>Statistics</a></li>
            <li><a class="dropdown-item small" href="#" onClick={() => {this.props.switchOnDisplay("Settings");}}>Settings</a></li>
            <li><a class="dropdown-item small" href="#" onClick={() => {this.props.switchOnDisplay("About");}} >About</a></li>
          </ul>
        </div>
      </>
    );
  }
}
