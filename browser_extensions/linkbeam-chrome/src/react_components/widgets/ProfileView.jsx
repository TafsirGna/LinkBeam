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

    this.bookmarkProfile = this.bookmarkProfile.bind(this);
  }

  componentDidMount() {
  }

  handleReminderModalClose = () => this.setState({reminderModalShow: false});
  handleReminderModalShow = () => this.setState({reminderModalShow: true});
  toggleBookmarkToastShow = () => this.setState((prevState) => ({bookmarkToastShow: !prevState.bookmarkToastShow}));

  bookmarkProfile(){
    this.toggleBookmarkToastShow();
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
              <li><a class="dropdown-item small" href="#" onClick={this.bookmarkProfile}>Bookmark</a></li>
              <li><a class="dropdown-item small" href="#" onClick={this.handleReminderModalShow}>Add reminder</a></li>
            </ul>
          </div>
        </div>          

        <ProfileViewHeader/>

        <ProfileViewBody/>

        <ProfileViewReminderModal show={this.state.reminderModalShow} onHide={this.handleReminderModalClose} />

        <CustomToast message="Profile bookmarked !" show={this.state.bookmarkToastShow} onClose={this.toggleBookmarkToastShow} />

      </>
    );  
  }
}
