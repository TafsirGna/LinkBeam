/*import './MainProfileView.css'*/
import React from 'react';
import ProfileView from "./widgets/ProfileView";
import { appParams } from "./Local_library";
import { db } from "../db";

export default class MainProfileView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profile: null, 
    };

    this.onProfileDataReceived = this.onProfileDataReceived.bind(this);
    this.onReminderDataReceived = this.onReminderDataReceived.bind(this);
    this.onReminderDeletionDataReceived = this.onReminderDeletionDataReceived.bind(this);
    this.onBookmarkDataReceived = this.onBookmarkDataReceived.bind(this);
    this.onBookmarkDeletionDataReceived = this.onBookmarkDeletionDataReceived.bind(this);
  }

  componentDidMount() {

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const profileUrl = urlParams.get("data");

    // Retrieving the profile for the url given throught the url paremeters 
    (async () => {
      const profile = await db.profiles
                              .where("url")
                              .equals(encodeURI(profileUrl))
                              .first();

      this.setState({profile: profile});

      }).bind(this)();

  }

  onProfileDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    let profile = message.data.objectData.object;

    // Setting the retrieved profile as a local variable
    if (!this.state.profile){
      this.setState({profile: profile}, () => {

        sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.BOOKMARKS, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE, criteria: { props: { url: this.state.profile.url } }});
        sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.REMINDERS, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE, criteria: { props: { url: this.state.profile.url } }});

      });
    }

  }

  onBookmarkDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var bookmark = message.data.objectData.object;

    if (bookmark == undefined){ // No bookmark for this user
      return;
    }

    if (bookmark.url != this.state.profile.url){
      return;
    }

    var bookmark = message.data.objectData;
    this.setState(prevState => {
      let profile = Object.assign({}, prevState.profile);
      profile.bookmark = bookmark;
      return { profile };
    });

  }

  onReminderDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var reminder = message.data.objectData.object;

    if (reminder == undefined){ // No reminder for this user
      return;
    }
    
    if (reminder.url != this.state.profile.url){
      return;
    }

    this.setState(prevState => {
      let profile = Object.assign({}, prevState.profile);
      profile.reminder = reminder;
      return { profile };
    });

  }

  onBookmarkDeletionDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var props = message.data.objectData.criteria.props;
    if (props.url != this.state.profile.url){
      return;
    }

    this.setState(prevState => {
      let profile = Object.assign({}, prevState.profile);
      delete profile.bookmark;
      return { profile };
    });

  }

  onReminderDeletionDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var props = message.data.objectData.criteria.props;
    if (props.url != this.state.profile.url){
      return;
    }

    this.setState(prevState => {
      let profile = Object.assign({}, prevState.profile);
      delete profile.reminder;
      return { profile };
    });

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