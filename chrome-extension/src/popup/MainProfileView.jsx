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
import LoadingProfileView, { buildProfileObject } from "./widgets/LoadingProfileView";
import { 
  appParams,
  setGlobalDataSettings,
} from "./Local_library";
import { db } from "../db";
import eventBus from "./EventBus";
import { AlertCircleIcon } from "./widgets/SVGs";
import { liveQuery } from "dexie"; 

export default class MainProfileView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profile: null, 
      loadingProfile: true,
      dbLastestProfileVisitObject: null,
    };

    this.loadingProfileDone = this.loadingProfileDone.bind(this);

  }

  componentDidMount() {

    setGlobalDataSettings(db, eventBus, liveQuery);

  }

  componentWillUnmount(){

    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
      this.profileSubscription = null;
    }

    if (this.bookmarkSubscription) {
      this.bookmarkSubscription.unsubscribe();
      this.bookmarkSubscription = null;
    }

    if (this.reminderSubscription) {
      this.reminderSubscription.unsubscribe();
      this.reminderSubscription = null;
    }

  }

  loadingProfileDone(status, payload){
    this.setState({loadingProfile: false}, () => {
      if (status == "SUCCESS"){

        this.profileSubscription = payload.profileObservable.subscribe(
          result => this.setState({dbLastestProfileVisitObject: result}),
          error => this.setState({error})
        );

        this.setState({profile: payload.profileObject}, () => {

          this.bookmarkSubscription = liveQuery(() => db.bookmarks
                                                        .where({url: (new URLSearchParams(window.location.search)).get("data")})
                                                        .first()).subscribe(
            result => this.setState({profile: {...this.state.profile, bookmark: result}}),
            error => this.setState({error})
          );

          this.reminderSubscription = liveQuery(() => db.reminders
                                                        .where({objectId: (new URLSearchParams(window.location.search)).get("data")})
                                                        .first()).subscribe(
            result => this.setState({profile: {...this.state.profile, reminder: result}}),
            error => this.setState({error})
          );

        });
      }
    });
  }

  componentDidUpdate(prevProps, prevState){

    if (prevState.dbLastestProfileVisitObject != this.state.dbLastestProfileVisitObject){
      if (prevState.dbLastestProfileVisitObject){
        (async () => {
          this.setState({profile: await buildProfileObject((new URLSearchParams(window.location.search)).get("data"))});
        }).bind(this)();
      }
    }

  }

  render(){
    return (
      <>
        <div class="col-8 offset-2 pb-5">

          {this.state.loadingProfile
            && <LoadingProfileView 
                loadingDone = {this.loadingProfileDone} />}

          {!this.state.loadingProfile 
            && <div>

                {this.state.profile 
                  && <ProfileView 
                        profile={this.state.profile} 
                        globalData={this.props.globalData}/>}

                {!this.state.profile 
                  && <div class="text-center m-5 mt-4">
                      <AlertCircleIcon size="100" className="text-muted"/>
                      <p><span class="badge text-bg-primary fst-italic shadow">An error occured when displaying the page</span></p>
                    </div>}

              </div>}

        </div>
      </>
    );
  }
}