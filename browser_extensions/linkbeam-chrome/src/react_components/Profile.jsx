/*import './Profile.css'*/
import React from 'react';
import ProfileView from "./widgets/ProfileView";

export default class Profile extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profile: null, 
    };
  }

  componentDidMount() {

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const profileUrl = urlParams.get("profile-url");

    // Retrieving the profile for the url given throught the url paremeters 
    chrome.runtime.sendMessage({header: 'get-profile', data: profileUrl}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Get Profile request sent', response);
    });


    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch(message.header){
        case "profile-object":{
          let profile = message.data;

          // Setting the retrieved profile as a local variable
          this.setState({profile: profile});

          break;
        }
        case "profile-updated":{
          switch(message.data.property){
            case "bookmark":{
              let bookmarkValue = message.data.value
              if (this.state.profile){
                this.setState(prevState => {
                  let profile = Object.assign({}, prevState.profile);
                  profile.bookmarked = bookmarkValue;
                  return { profile };
                });
              }
              break;
            }
          }
          
          break;
        }

      }
    });
  }

  render(){
    return (
      <>
        <div class="col-8 offset-2">

          {this.state.profile == null && <div class="text-center"><div class="mt-5 pt-5"><div class="spinner-border text-primary" role="status">
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                  </div>
                </div>}

          {this.state.profile && <ProfileView profile={this.state.profile}/>}

        </div>
      </>
    );
  }
}