/*import './ProfileView.css'*/
import React from 'react';
import CustomToast from "./CustomToast";
import ProfileViewHeader from "./ProfileViewHeader";
import ProfileViewBody from "./ProfileViewBody";
import ProfileViewReminderModal from "./ProfileViewReminderModal";
import { sendDatabaseActionMessage } from "../Local_library";

export default class ProfileView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      coverImageModalShow: false,
      bookmarkToastShow: false,
      reminderModalShow: false,
      toastMessage: "",
    };

    this.toggleBookmarkStatus = this.toggleBookmarkStatus.bind(this);
    this.onReminderMenuActionClick = this.onReminderMenuActionClick.bind(this);
    this.startMessageListener = this.startMessageListener.bind(this);

  }

  componentDidMount() {

    this.startMessageListener();

  }

  startMessageListener(){

    // listening to events
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      
      switch(message.header){
        case "object-added": {

          switch(message.data.objectStoreName){
            case "bookmarks": {
              // sending a response
              sendResponse({
                  status: "ACK"
              });
              this.toggleBookmarkToastShow("Profile bookmarked !");
              break;
            }

          case "reminders": {
              // sending a response
              sendResponse({
                  status: "ACK"
              });
              this.handleReminderModalClose();
              this.toggleBookmarkToastShow("Reminder added !");
              break;
            }
          }

          break;
        }

        case "object-deleted": {

          switch(message.data.objectStoreName){
            case "bookmarks": {
              // sending a response
              sendResponse({
                  status: "ACK"
              });
              this.toggleBookmarkToastShow("Profile unbookmarked !");
              break;
            }

          case "reminders": {
              // sending a response
              sendResponse({
                  status: "ACK"
              });
              this.handleReminderModalClose();
              this.toggleBookmarkToastShow("Reminder deleted !");
              break;
            }
          }
          
          break;
        }
      }

    });
    
  }

  handleReminderModalClose = () => this.setState({reminderModalShow: false});
  handleReminderModalShow = () => this.setState({reminderModalShow: true});
  toggleBookmarkToastShow = (message = "") => this.setState((prevState) => ({toastMessage: message, bookmarkToastShow: !prevState.bookmarkToastShow}));


  onReminderMenuActionClick(){
    if (this.props.profile.reminder){
      var response = confirm("Do you confirm the deletion of the reminder ?");
      if (response){
        sendDatabaseActionMessage("delete-object", "reminders", this.props.profile.url);
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
      action = "delete-object";
    }
    else{
      //
      action = "add-object"
    }

    sendDatabaseActionMessage(action, "bookmarks", this.props.profile.url);

  }

  render(){
    return (
      <>
        <div class="clearfix mt-5">
          <div class="dropdown float-end m-3 mt-2 bd-gray">
            <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="gray" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <ul class="dropdown-menu shadow-lg">
              <li><a class="dropdown-item small" href="#" onClick={this.toggleBookmarkStatus}>{ this.props.profile.bookmark ? "Unbookmark" : "Bookmark" }</a></li>
              <li><a class={"dropdown-item small " + (this.props.profile.reminder ? "text-danger" : "")} href="#" onClick={this.onReminderMenuActionClick}>{ this.props.profile.reminder ? "Delete" : "Add" } reminder</a></li>
            </ul>
          </div>
        </div>          

        <ProfileViewHeader profile={this.props.profile} />

        <ProfileViewBody profile={this.props.profile} />

        <ProfileViewReminderModal profile={this.props.profile} show={this.state.reminderModalShow} onHide={this.handleReminderModalClose} />

        <CustomToast message={this.state.toastMessage} show={this.state.bookmarkToastShow} onClose={this.toggleBookmarkToastShow} />

      </>
    );  
  }
}
