// import '../assets/css/ProfileActivitySectionView.css';
import React from 'react';
import ProfileActivityListView from "./ProfileActivityListView";


export default class ProfileActivitySectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };

    this.getObjects = this.getObjects.bind(this);

  }

  componentDidMount() {

  }

  getObjects(){

    if (!this.props.profile.activity){
      return [];
    }

    return this.props.profile.activity.map(activity => { 
            activity.profile = this.props.profile;
            activity.date = this.props.profile.date; 
            return activity;
          });

  }

  render(){
    return (
      <>
        <ProfileActivityListView 
          objects={this.getObjects()} 
          variant="timeline" />
      </>
    );
  }
}
