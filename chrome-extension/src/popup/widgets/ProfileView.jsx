/*import './ProfileView.css'*/
import React from 'react';
import CustomToast from "./toasts/CustomToast";
import ProfileViewHeader from "./ProfileViewHeader";
import ProfileViewBody from "./ProfileViewBody";
import ProfileViewReminderModal from "./modals/ProfileReminderModal";
import { sendDatabaseActionMessage, startMessageListener, ack, messageParams, dbData } from "../Local_library";

export default class MainProfileView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      coverImageModalShow: false,
      toastShow: false,
      reminderModalShow: false,
      toastMessage: "",
    };

    this.toggleBookmarkStatus = this.toggleBookmarkStatus.bind(this);
    this.onReminderMenuActionClick = this.onReminderMenuActionClick.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onReminderAdditionDataReceived = this.onReminderAdditionDataReceived.bind(this);
    this.onReminderDeletionDataReceived = this.onReminderDeletionDataReceived.bind(this);
    this.onBookmarkAdditionDataReceived = this.onBookmarkAdditionDataReceived.bind(this);
    this.onBookmarkDeletionDataReceived = this.onBookmarkDeletionDataReceived.bind(this);

  }

  componentDidMount() {

    this.listenToMessages();

  }

  onBookmarkAdditionDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    this.toggleToastShow("Profile bookmarked !");

  }

  onReminderAdditionDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    this.handleReminderModalClose();
    this.toggleToastShow("Reminder added !");

  }

  onBookmarkDeletionDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    this.toggleToastShow("Profile unbookmarked !");

  }

  onReminderDeletionDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    this.handleReminderModalClose();
    this.toggleToastShow("Reminder deleted !");

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_ADDED, dbData.objectStoreNames.REMINDERS].join(messageParams.separator), 
        callback: this.onReminderAdditionDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_ADDED, dbData.objectStoreNames.BOOKMARKS].join(messageParams.separator), 
        callback: this.onBookmarkAdditionDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_DELETED, dbData.objectStoreNames.REMINDERS].join(messageParams.separator), 
        callback: this.onReminderDeletionDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_DELETED, dbData.objectStoreNames.BOOKMARKS].join(messageParams.separator), 
        callback: this.onBookmarkDeletionDataReceived
      }
    ]);
    
  }

  handleReminderModalClose = () => this.setState({reminderModalShow: false});
  handleReminderModalShow = () => this.setState({reminderModalShow: true});
  toggleToastShow = (message = "") => this.setState((prevState) => ({toastMessage: message, toastShow: !prevState.toastShow}));


  onReminderMenuActionClick(){
    if (this.props.profile.reminder){
      var response = confirm("Do you confirm the deletion of the reminder ?");
      if (response){
        sendDatabaseActionMessage(messageParams.requestHeaders.DEL_OBJECT, dbData.objectStoreNames.REMINDERS, this.props.profile.url);
      }
    } 
    else{
      this.handleReminderModalShow();
    }
  }

  toggleBookmarkStatus(){

    let action = null;
    if (this.props.profile.bookmark){
      //
      action = messageParams.requestHeaders.DEL_OBJECT;
    }
    else{
      //
      action = messageParams.requestHeaders.ADD_OBJECT;
    }

    sendDatabaseActionMessage(action, dbData.objectStoreNames.BOOKMARKS, this.props.profile.url);

  }

  render(){
    return (
      <>
        <div class="clearfix mt-5">
          <div class="dropdown float-end mt-3 bd-gray">
            <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="gray" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <ul class="dropdown-menu shadow-lg">
              <li><a class="dropdown-item small" href="#" onClick={this.toggleBookmarkStatus}>{ this.props.profile.bookmark ? "Unbookmark" : "Bookmark" }</a></li>
              <li><a class={"dropdown-item small " + (this.props.profile.reminder ? "text-danger" : "")} href="#" onClick={this.onReminderMenuActionClick}>{ this.props.profile.reminder ? "Delete" : "Add" } reminder</a></li>
              <li><a class="dropdown-item small" href="#" onClick={this.onReminderMenuActionClick}>List all searches</a></li>
            </ul>
          </div>
        </div>          

        <ProfileViewHeader profile={this.props.profile} />

        <ProfileViewBody profile={this.props.profile} />

        <ProfileViewReminderModal profile={this.props.profile} show={this.state.reminderModalShow} onHide={this.handleReminderModalClose} />

        <CustomToast globalData={this.props.globalData} message={this.state.toastMessage} show={this.state.toastShow} onClose={this.toggleToastShow} />

      </>
    );  
  }
}
