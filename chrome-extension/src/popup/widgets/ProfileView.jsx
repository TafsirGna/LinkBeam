/*import './MainProfileView.css'*/
import React from 'react';
import CustomToast from "./toasts/CustomToast";
import ProfileViewHeader from "./ProfileViewHeader";
import ProfileViewBody from "./ProfileViewBody";
import ProfileViewReminderModal from "./modals/ProfileReminderModal";
import ProfileVisitsChartModal from "./modals/ProfileVisitsChartModal";
import { appParams } from "../Local_library";
import eventBus from "../EventBus";
import { db } from "../../db";

export default class ProfileView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      coverImageModalShow: false,
      toastShow: false,
      reminderModalShow: false,
      visitsChartModalShow: false,
      toastMessage: "",
      allProfiles: null,
    };

    this.toggleBookmarkStatus = this.toggleBookmarkStatus.bind(this);
    this.onReminderMenuActionClick = this.onReminderMenuActionClick.bind(this);

  }

  componentDidMount() {

    eventBus.on(eventBus.PROFILE_SHOW_REMINDER_OBJECT, (data) =>
      {
        this.handleReminderModalShow();
      }
    );

    eventBus.on(eventBus.SET_PROFILE_DATA, (data) =>
      {
        if (data.property == "reminder" && data.value){
          this.handleReminderModalClose();
          this.toggleToastShow("Reminder added !");
        }
      }
    );

  }

  componentWillUnmount() {

    eventBus.remove(eventBus.PROFILE_SHOW_REMINDER_OBJECT);
    eventBus.remove(eventBus.SET_PROFILE_DATA);

  }


  handleReminderModalClose = () => this.setState({reminderModalShow: false});
  handleReminderModalShow = () => this.setState({reminderModalShow: true});

  handleVisitsChartModalClose = () => this.setState({visitsChartModalShow: false});
  handleVisitsChartModalShow = () => this.setState({visitsChartModalShow: true});

  toggleToastShow = (message = "") => this.setState((prevState) => ({toastMessage: message, toastShow: !prevState.toastShow}));


  onReminderMenuActionClick(){
    if (this.props.profile.reminder){
      var response = confirm("Do you confirm the deletion of the reminder ?");
      if (response){

        (async () => {

          await db.reminders.delete(this.props.profile.reminder.id);

          eventBus.dispatch(eventBus.SET_PROFILE_DATA, {property: "reminder", value: null});

          this.toggleToastShow("Reminder deleted !");

        }).bind(this)();

      }
    } 
    else{
      this.handleReminderModalShow();
    }
  }

  async toggleBookmarkStatus(){

    if (this.props.profile.bookmark){
      
      await db.bookmarks.delete(this.props.profile.bookmark.id);

      eventBus.dispatch(eventBus.SET_PROFILE_DATA, {property: "bookmark", value: null});

      this.toggleToastShow("Profile unbookmarked !");

    }
    else{
      
      await db.bookmarks.add({
        url: this.props.profile.url,
        createdOn: (new Date()).toISOString(),
      });

      const bookmark = await db.bookmarks.where("url").equals(this.props.profile.url).first();

      eventBus.dispatch(eventBus.SET_PROFILE_DATA, {property: "bookmark", value: bookmark});

      this.toggleToastShow("Profile bookmarked !");

    }

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
              <li><a class="dropdown-item small" href="#" onClick={this.toggleBookmarkStatus}>{ this.props.profile.bookmark ? "Unbookmark this" : "Bookmark this" }</a></li>
              <li><a class={"dropdown-item small " + (this.props.profile.reminder ? "text-danger" : "")} href="#" onClick={this.onReminderMenuActionClick}>{ this.props.profile.reminder ? "Delete" : "Add" } reminder</a></li>
              <li><a class="dropdown-item small" href="#" onClick={this.handleVisitsChartModalShow}>Chart visits</a></li>
            </ul>
          </div>
        </div>          

        <ProfileViewHeader profile={this.props.profile} globalData={this.props.globalData} localData={{profiles: this.state.allProfiles}}/>

        <ProfileViewBody profile={this.props.profile} globalData={{profiles: this.state.allProfiles}}/>

        <ProfileViewReminderModal profile={this.props.profile} show={this.state.reminderModalShow} onHide={this.handleReminderModalClose} />
        
        <ProfileVisitsChartModal profile={this.props.profile} show={this.state.visitsChartModalShow} onHide={this.handleVisitsChartModalClose} />

        <CustomToast globalData={this.props.globalData} message={this.state.toastMessage} show={this.state.toastShow} onClose={this.toggleToastShow} />

      </>
    );  
  }
}
