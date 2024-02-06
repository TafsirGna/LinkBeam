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
          <AlertCircleIcon size="100" className="text-muted"/>
          <p class="mt-2 small fw-light">
            {this.state.errorData == messageParams.contentMetaData.SW_DB_NOT_CREATED_YET && <span>Your <span class="badge text-bg-primary">{appParams.appName}</span> app is not properly set yet. Go to the <a href="/install.html" target="_blank">Setup</a> page to set it up</span>}
          </p>
        </div>

      </>
    );
  }
}
