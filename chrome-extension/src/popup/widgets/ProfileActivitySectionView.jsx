// import '../assets/css/ProfileActivitySectionView.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ProfileActivityListView from "./ProfileActivityListView";
import { sendDatabaseActionMessage, messageParams, dbData, appParams } from "../Local_library";


export default class ProfileActivitySectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };

  }

  componentDidMount() {

    if (this.props.profile.activity == undefined){
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.PROFILE_ACTIVITY, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE });
    }

  }

  render(){
    return (
      <>
        <ProfileActivityListView objects={this.props.profile.activity} variant="timeline" showPost={() => {}} />
      </>
    );
  }
}
