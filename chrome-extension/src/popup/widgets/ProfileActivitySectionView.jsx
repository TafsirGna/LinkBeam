// import '../assets/css/ProfileActivitySectionView.css';
import React from 'react';
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
        <ProfileActivityListView objects={[this.props.profile]} variant="timeline" showPost={() => {}} />
      </>
    );
  }
}
