/*import './About.css'*/
import React from 'react';
import { 
  messageParams, 
  appParams,
} from "./Local_library";
import { Link } from 'react-router-dom';

export default class ErrorPageView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      errorData: null,
    };
  }

  componentDidMount() {

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const errorData = urlParams.get("data");
    this.setState({errorData: errorData});
  }

  render(){
    return (
      <>
        
        <div class="text-center m-5">
          <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p class="mt-2 small fst-italic">
            {this.state.errorData == messageParams.contentMetaData.SW_DB_NOT_CREATED_YET && <span>Your <span class="badge text-bg-primary">{appParams.appName}</span> app is not properly set yet. Go to <a href="/install.html" target="_blank">Setup</a> to set it up</span>}
          </p>
        </div>

      </>
    );
  }
}