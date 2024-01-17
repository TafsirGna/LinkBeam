/*import './About.css'*/
import React from 'react';
import { 
  messageParams, 
  appParams,
} from "./Local_library";
import { Link } from 'react-router-dom';
import { AlertCircleIcon } from "./widgets/SVGs";

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

        <div class="text-center mt-5">
          <span class="badge text-bg-warning shadow">Warning</span>
        </div>
        
        <div class="text-center m-5 mt-3">
          <AlertCircleIcon size="100" className=""/>
          {/*<svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>*/}
          <p class="mt-2 small fw-light">
            {this.state.errorData == messageParams.contentMetaData.SW_DB_NOT_CREATED_YET && <span>Your <span class="badge text-bg-primary">{appParams.appName}</span> app is not properly set yet. Go to the <a href="/install.html" target="_blank">Setup</a> page to set it up</span>}
          </p>
        </div>

      </>
    );
  }
}
