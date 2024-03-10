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

/*import './MainProfileView.css'*/
import React from 'react';
import ProfileView from "./widgets/ProfileView";
import { appParams } from "./Local_library";
import { db } from "../db";
import eventBus from "./EventBus";

export default class MainProfileView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profile: null, 
    };

  }

  componentDidMount() {

    eventBus.on(eventBus.SET_PROFILE_DATA, (data) =>
      {
        this.setState(prevState => {
          let profile = Object.assign({}, prevState.profile);
          profile[data.property] = data.value;
          return { profile };
        });
      }
    );

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const profileUrl = urlParams.get("data");

    // Retrieving the profile for the url given throught the url paremeters 
    (async () => {
      const profile = await db.profiles
                              .where("url")
                              .equals(encodeURI(profileUrl))
                              .first();

      await Promise.all ([profile].map (async profile => {
        [profile.bookmark] = await Promise.all([
          db.bookmarks.where('url').equals(profile.url).first()
        ]);
      }));

      await Promise.all ([profile].map (async profile => {
        [profile.reminder] = await Promise.all([
          db.reminders.where('url').equals(profile.url).first()
        ]);
      }));

      this.setState({profile: profile});

      }).bind(this)();

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.SET_PROFILE_DATA);

  }

  render(){
    return (
      <>
        <div class="col-8 offset-2 pb-5">

          {this.state.profile == null && <div class="text-center"><div class="mt-5 pt-5"><div class="spinner-border text-primary" role="status">
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                  </div>
                </div>}

          {this.state.profile && <ProfileView profile={this.state.profile} globalData={this.props.globalData} />}

        </div>
      </>
    );
  }
}