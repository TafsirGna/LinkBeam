// import '../assets/css/ProfileActivitySectionView.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ProfileActivityListView from "./ProfileActivityListView";

export default class ProfileActivitySectionView extends React.Component{

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
        <ProfileActivityListView/>
      </>
    );
  }
}
