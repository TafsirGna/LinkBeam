/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.svg';
import BackToPrev from "./widgets/BackToPrev";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  saveCurrentPageTitle, 
  appParams,
} from "./Local_library";
import { Link } from 'react-router-dom';
/*import 'bootstrap/dist/css/bootstrap.min.css';*/

export default class LicenseCreditsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    saveCurrentPageTitle("LicenseCredits");

  }

  render(){
    return (
      <>
        
      </>
    );
  }
}
