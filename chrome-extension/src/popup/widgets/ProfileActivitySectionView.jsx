/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

// import '../assets/css/ProfileActivitySectionView.css';
import React from 'react';
import ActivityListView from "./ActivityListView";


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

    return this.props.profile.activity.map(activity => ({
      user: {
        picture: this.props.profile.avatar,
        name: this.props.profile.fullName,
      },
      url: activity.url,
      date: this.props.profile.lastVisit.date,
      text: activity.title,
    }));

  }

  render(){
    return (
      <>
        <ActivityListView 
          objects={this.getObjects()} 
          variant="timeline" />
      </>
    );
  }
}
