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
    let requestData = {name: "profiles", data: profileUrl};
    chrome.runtime.sendMessage({header: 'get-object', data: requestData}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Get Profile request sent', response, requestData);
    });


    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch(message.header){
        case "object-data":{
          
          switch(message.data.objectStoreName){
            case "profiles": {
              // sending a response
              sendResponse({
                  status: "ACK"
              });

              let profile = message.data.objectData;

              // Setting the retrieved profile as a local variable
              this.setState({profile: profile});
            }
          }
          break;
        }
        case "bookmark-added":{
          var bookmark = message.data;

          this.setState(prevState => {
            let profile = Object.assign({}, prevState.profile);
            profile.bookmark = bookmark;
            return { profile };
          });
          
          break;
        }
        case "bookmark-deleted":{
          this.setState(prevState => {
            let profile = Object.assign({}, prevState.profile);
            profile.bookmark = null;
            return { profile };
          });
          
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