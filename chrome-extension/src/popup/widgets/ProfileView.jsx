/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/


/*import './ProfileView.css'*/
import React from 'react';
import CustomToast from "./toasts/CustomToast";
import ProfileViewHeader from "./ProfileViewHeader";
import ProfileViewBody from "./ProfileViewBody";
import ReminderModal from "./modals/ReminderModal";
import ProfileVisitsChartModal from "./modals/ProfileVisitsChartModal";
import FolderPickModal from "./modals/FolderPickModal";
import { appParams } from "../Local_library";
import eventBus from "../EventBus";
import { db } from "../../db";
import { LayersIcon } from "./SVGs";

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
      folderPickModalShow: false,
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

    eventBus.on(eventBus.SET_PROFILE_LOCAL_DATA, (data) =>
      {
        var stateSlice = {};
        stateSlice[data.property] = data.value;
        this.setState(stateSlice);
      }
    );

  }

  componentWillUnmount() {

    eventBus.remove(eventBus.PROFILE_SHOW_REMINDER_OBJECT);
    eventBus.remove(eventBus.SET_PROFILE_DATA);
    eventBus.remove(eventBus.SET_PROFILE_LOCAL_DATA);

  }


  handleReminderModalClose = () => this.setState({reminderModalShow: false});
  handleReminderModalShow = () => this.setState({reminderModalShow: true});

  handleFolderPickModalClose = () => this.setState({folderPickModalShow: false});
  handleFolderPickModalShow = () => this.setState({folderPickModalShow: true});

  handleVisitsChartModalClose = () => this.setState({visitsChartModalShow: false});
  handleVisitsChartModalShow = () => this.setState({visitsChartModalShow: true});

  toggleToastShow = (message = "") => this.setState((prevState) => ({toastMessage: message, toastShow: !prevState.toastShow}));


  onReminderMenuActionClick(){
    if (this.props.profile.reminder){
      var response = confirm("Do you confirm the deletion of the reminder ?");
      if (response){

        (async () => {

          try{
            await db.reminders.delete(this.props.profile.reminder.id);
          }
          catch(error){
            console.error("Error : ", error);
          }

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

    try{

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
    catch(error){
      console.error("Error : ", error);
    }

  }

  render(){
    return (
      <>
      
        <div class="clearfix mt-5">
          <div class="dropdown float-end mt-3 bd-gray">
            <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
              <LayersIcon 
                size="18" 
                className="text-muted"/>
            </div>
            <ul class="dropdown-menu shadow-lg">
              <li><a class="dropdown-item small" href="#" onClick={this.toggleBookmarkStatus}>{ this.props.profile.bookmark ? "Unbookmark this" : "Bookmark this" }</a></li>
              <li><a class={"dropdown-item small " + (this.props.profile.reminder ? "text-danger" : "")} href="#" onClick={this.onReminderMenuActionClick}>{ this.props.profile.reminder ? "Delete" : "Add" } reminder</a></li>
              <li><a class="dropdown-item small" href="#" onClick={this.handleVisitsChartModalShow}>Chart visits</a></li>
              <li><a class="dropdown-item small" href="#" onClick={this.handleFolderPickModalShow}>Move to folder</a></li>
            </ul>
          </div>
        </div>          

        <ProfileViewHeader 
          profile={this.props.profile} 
          globalData={this.props.globalData}
          localDataObject={{profiles: this.state.allProfiles}}/>

        <ProfileViewBody 
          profile={this.props.profile} 
          localDataObject={{profiles: this.state.allProfiles}}/>

        <ReminderModal 
          object={this.props.profile} 
          show={this.state.reminderModalShow} 
          onHide={this.handleReminderModalClose} />
        
        <ProfileVisitsChartModal 
          profile={this.props.profile} 
          show={this.state.visitsChartModalShow} 
          onHide={this.handleVisitsChartModalClose} />

        <CustomToast 
          globalData={this.props.globalData} 
          message={this.state.toastMessage} 
          show={this.state.toastShow} 
          onClose={this.toggleToastShow} />


        <FolderPickModal
          profile={this.props.profile} 
          globalData={this.props.globalData}
          show={this.state.folderPickModalShow} 
          onHide={this.handleFolderPickModalClose}/>

      </>
    );  
  }
}
