/*import './MainProfileView.css'*/
import React from 'react';
import CustomToast from "./toasts/CustomToast";
import ProfileViewHeader from "./ProfileViewHeader";
import ProfileViewBody from "./ProfileViewBody";
import ProfileViewReminderModal from "./modals/ProfileReminderModal";
import ProfileVisitsChartModal from "./modals/ProfileVisitsChartModal";
import { appParams } from "../Local_library";
import eventBus from "../EventBus";

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
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onReminderAdditionDataReceived = this.onReminderAdditionDataReceived.bind(this);
    this.onReminderDeletionDataReceived = this.onReminderDeletionDataReceived.bind(this);
    this.onBookmarkAdditionDataReceived = this.onBookmarkAdditionDataReceived.bind(this);
    this.onBookmarkDeletionDataReceived = this.onBookmarkDeletionDataReceived.bind(this);
    this.onProfilesDataReceived = this.onProfilesDataReceived.bind(this);

  }

  componentDidMount() {

    this.listenToMessages();

    eventBus.on(eventBus.PROFILE_SHOW_REMINDER_OBJECT, (data) =>
      {
        this.handleReminderModalShow();
      }
    );

  }

  componentWillUnmount() {

    eventBus.remove(eventBus.PROFILE_SHOW_REMINDER_OBJECT);
    // eventBus.remove(eventBus.PROFILE_SHOW_DOUGHNUT_MODAL);

  }

  onBookmarkAdditionDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    this.toggleToastShow("Profile bookmarked !");

  }

  onReminderAdditionDataReceived(message, sendResponse){

    this.handleReminderModalClose();
    this.toggleToastShow("Reminder added !");

  }

  onBookmarkDeletionDataReceived(message, sendResponse){

    this.toggleToastShow("Profile unbookmarked !");

  }

  onReminderDeletionDataReceived(message, sendResponse){

    this.toggleToastShow("Reminder deleted !");

  }

  onProfilesDataReceived(message, sendResponse){

    var context = message.data.objectData.context; 
    if (context.indexOf(appParams.COMPONENT_CONTEXT_NAMES.PROFILE) == -1){
      return;
    }

    // acknowledge receipt
    ack(sendResponse);

    var profiles = message.data.objectData.list;
    this.setState({allProfiles: profiles});

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
      },
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.PROFILES].join(messageParams.separator), 
        callback: this.onProfilesDataReceived
      },
    ]);
    
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
        sendDatabaseActionMessage(messageParams.requestHeaders.DEL_OBJECT, dbData.objectStoreNames.REMINDERS, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILES, criteria: { props: {url: this.props.profile.url} } } );
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

    sendDatabaseActionMessage(action, dbData.objectStoreNames.BOOKMARKS, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILES, criteria: { props: { url: this.props.profile.url } } });

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
              <li><a class="dropdown-item small" href="#" onClick={this.toggleBookmarkStatus}>{ Object.hasOwn(this.props.profile, "bookmark") ? "Unbookmark this" : "Bookmark this" }</a></li>
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
