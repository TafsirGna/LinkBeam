/*import './Profile.css'*/
import React from 'react';
import ProfileView from "./widgets/ProfileView";
import { sendDatabaseActionMessage, startMessageListener, ack, messageParameters } from "./Local_library";

export default class Profile extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profile: null, 
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onProfileDataReceived = this.onProfileDataReceived.bind(this);
    this.onReminderAdditionDataReceived = this.onReminderAdditionDataReceived.bind(this);
    this.onReminderDeletionDataReceived = this.onReminderDeletionDataReceived.bind(this);
    this.onBookmarkAdditionDataReceived = this.onBookmarkAdditionDataReceived.bind(this);
    this.onBookmarkDeletionDataReceived = this.onBookmarkDeletionDataReceived.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const profileUrl = urlParams.get("profile-url");

    // Retrieving the profile for the url given throught the url paremeters 
    sendDatabaseActionMessage("get-object", "profiles", profileUrl);

  }

  onProfileDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    let profile = message.data.objectData;

    // Setting the retrieved profile as a local variable
    this.setState({profile: profile});

  }

  onBookmarkAdditionDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var bookmark = message.data.objectData;
    this.setState(prevState => {
      let profile = Object.assign({}, prevState.profile);
      profile.bookmark = bookmark;
      return { profile };
    });

  }

  onReminderAdditionDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var reminder = message.data.objectData;
    this.setState(prevState => {
      let profile = Object.assign({}, prevState.profile);
      profile.reminder = reminder;
      return { profile };
    });

  }

  onBookmarkDeletionDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    this.setState(prevState => {
      let profile = Object.assign({}, prevState.profile);
      profile.bookmark = null;
      return { profile };
    });

  }

  onReminderDeletionDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    this.setState(prevState => {
      let profile = Object.assign({}, prevState.profile);
      profile.reminder = null;
      return { profile };
    });

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParameters.actionNames.ADD_OBJECT, messageParameters.actionObjectNames.REMINDERS].join(messageParameters.separator), 
        callback: this.onReminderAdditionDataReceived
      },
      {
        param: [messageParameters.actionNames.ADD_OBJECT, messageParameters.actionObjectNames.BOOKMARKS].join(messageParameters.separator), 
        callback: this.onBookmarkAdditionDataReceived
      },
      {
        param: [messageParameters.actionNames.DEL_OBJECT, messageParameters.actionObjectNames.REMINDERS].join(messageParameters.separator), 
        callback: this.onReminderDeletionDataReceived
      },
      {
        param: [messageParameters.actionNames.DEL_OBJECT, messageParameters.actionObjectNames.BOOKMARKS].join(messageParameters.separator), 
        callback: this.onBookmarkDeletionDataReceived
      },
      {
        param: [messageParameters.actionNames.GET_OBJECT, messageParameters.actionObjectNames.PROFILES].join(messageParameters.separator), 
        callback: this.onProfileDataReceived
      },
    ]);
    
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