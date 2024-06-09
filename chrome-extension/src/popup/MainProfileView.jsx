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
import { appParams } from "./Local_library";
// import { db } from "../db";
import eventBus from "./EventBus";
import { AlertCircleIcon } from "./widgets/SVGs";

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

    eventBus.on(eventBus.SET_PROFILE_DATA, (data) =>
      {
        this.setState(prevState => {
          let profile = Object.assign({}, prevState.profile);
          profile[data.property] = data.value;
          return { profile };
        });
      }
    );

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.SET_PROFILE_DATA);

    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
      this.profileSubscription = null;
    }

  }

  loadingProfileDone(status, payload){
    this.setState({loadingProfile: false}, () => {
      if (status == "SUCCESS"){

        this.profileSubscription = payload.profileObservable.subscribe(
          result => this.setState({dbLastestProfileVisitObject: result}),
          error => this.setState({error})
        );

        this.setState({profile: payload.profileObject});
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