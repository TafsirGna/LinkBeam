/*import './ProfileView.css'*/
import React from 'react';
import CustomToast from "./CustomToast"
import ProfileViewHeader from "./ProfileViewHeader"
import ProfileViewBody from "./ProfileViewBody"
import ProfileViewReminderModal from "./ProfileViewReminderModal"

export default class ProfileView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      coverImageModalShow: false,
      bookmarkToastShow: false,
      reminderModalShow: false,
    };

    this.toggleBookmarkStatus = this.toggleBookmarkStatus.bind(this);
  }

  componentDidMount() {

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
              this.toggleBookmarkToastShow();
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
              this.toggleBookmarkToastShow();
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
  toggleBookmarkToastShow = () => this.setState((prevState) => ({bookmarkToastShow: !prevState.bookmarkToastShow}));


  toggleBookmarkStatus(){

    let action = null;
    if (this.props.profile.bookmark){
      //
      action = "add-object";
    }
    else{
      //
      action = "delete-object"
    }

    chrome.runtime.sendMessage({header: action, data: {objectStoreName: "bookmarks", objectData: this.props.profile.url}}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log(action + ' bookmark request sent', response);
    });

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
              <li><a class={"dropdown-item small " + (this.props.profile.reminder ? "text-danger" : "")} href="#" onClick={this.handleReminderModalShow}>{ this.props.profile.reminder ? "Delete" : "Add" } reminder</a></li>
            </ul>
          </div>
        </div>          

        <ProfileViewHeader profile={this.props.profile} />

        <ProfileViewBody profile={this.props.profile} />

        <ProfileViewReminderModal profile={this.props.profile} show={this.state.reminderModalShow} onHide={this.handleReminderModalClose} />

        <CustomToast message={"Profile "+(this.props.profile.bookmark ? "" : "un" )+"bookmarked !"} show={this.state.bookmarkToastShow} onClose={this.toggleBookmarkToastShow} />

      </>
    );  
  }
}
