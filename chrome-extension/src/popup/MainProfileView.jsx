/*import './MainProfileView.css'*/
import React from 'react';
import ProfileView from "./widgets/ProfileView";
import { sendDatabaseActionMessage, startMessageListener, ack, messageParams, dbData, appParams } from "./Local_library";

export default class MainProfileView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profile: null, 
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onProfileDataReceived = this.onProfileDataReceived.bind(this);
    this.onReminderDataReceived = this.onReminderDataReceived.bind(this);
    this.onReminderDeletionDataReceived = this.onReminderDeletionDataReceived.bind(this);
    this.onBookmarkDataReceived = this.onBookmarkDataReceived.bind(this);
    this.onBookmarkDeletionDataReceived = this.onBookmarkDeletionDataReceived.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();

    // Getting the window url params
    const urlParams = new URLSearchParams(window.location.search);
    const profileUrl = urlParams.get("data");

    // Retrieving the profile for the url given throught the url paremeters 
    sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.PROFILES, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE, criteria: { props: { url: encodeURI(profileUrl) } }});

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

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_ADDED, dbData.objectStoreNames.REMINDERS].join(messageParams.separator), 
        callback: this.onReminderDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.REMINDERS].join(messageParams.separator), 
        callback: this.onReminderDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_ADDED, dbData.objectStoreNames.BOOKMARKS].join(messageParams.separator), 
        callback: this.onBookmarkDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.BOOKMARKS].join(messageParams.separator), 
        callback: this.onBookmarkDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_DELETED, dbData.objectStoreNames.REMINDERS].join(messageParams.separator), 
        callback: this.onReminderDeletionDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_DELETED, dbData.objectStoreNames.BOOKMARKS].join(messageParams.separator), 
        callback: this.onBookmarkDeletionDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.PROFILES].join(messageParams.separator), 
        callback: this.onProfileDataReceived
      },
    ]);
    
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