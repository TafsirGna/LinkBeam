import React from 'react';
/*import './Settings.css'*/
import BackToPrev from "./widgets/BackToPrev";
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import moment from 'moment';
/*import 'bootstrap/dist/css/bootstrap.min.css';*/
import { 
  saveCurrentPageTitle, 
  sendDatabaseActionMessage,
  ack,
  startMessageListener, 
  messageParams,
  dbData, 
} from "./Local_library";

export default class Settings extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      keywordCount: 0,
      reminderCount: 0,
      notifSettingCheckBoxValue: true,
      darkThemeCheckBoxValue: false,
      processingState: {
        status: "NO",
        info: ""
      }
    };

    this.deleteAll = this.deleteAll.bind(this);
    this.saveCheckBoxNewState = this.saveCheckBoxNewState.bind(this);
    this.saveDarkThemeState = this.saveDarkThemeState.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onKeywordsDataReceived = this.onKeywordsDataReceived.bind(this);
    this.onSettingsDataReceived = this.onSettingsDataReceived.bind(this);
    this.onRemindersDataReceived = this.onRemindersDataReceived.bind(this);
    this.onAllDataReceived = this.onAllDataReceived.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();

    if (Object.hasOwn(this.props.globalData.settings, 'notifications')){
      this.setState({notifSettingCheckBoxValue: this.props.globalData.settings.notifications});
    }

    // setting the local variable with the global data
    if (this.props.globalData.keywordList){
      this.setState({keywordCount: this.props.globalData.keywordList.length});
    }

    saveCurrentPageTitle("Settings");

    // Getting the keyword count
    sendDatabaseActionMessage(messageParams.requestHeaders.GET_COUNT, dbData.objectStoreNames.KEYWORDS, null);

    // Getting the reminder count
    sendDatabaseActionMessage(messageParams.requestHeaders.GET_COUNT, dbData.objectStoreNames.REMINDERS, null);

    // Knowing the previous status of the notification checkbox
    sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["notifications"]);
  }

  onKeywordsDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    this.setState({keywordCount: message.data.objectData});

  }

  onRemindersDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    this.setState({reminderCount: message.data.objectData});

  }

  onAllDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    try {
      
      const url = window.URL.createObjectURL(new Blob([message.data.objectData])) 
      const link = document.createElement('a')
      link.href = url
      const fileName = `LinkBeam_Export_${moment(new Date()).format("DD MMM YY")}.csv`;
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()

    } catch (error) {
      console.error('Error while downloading the received data: ', error);
    }

  }

  onSettingsDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    switch(message.data.objectData.property){
      case "notifications": {
        this.setState({notifSettingCheckBoxValue: message.data.objectData.value});
        break;
      }

      case "lastDataResetDate": {

        // Displaying the validation sign
        this.setState({processingState: {status: "NO", info: "ERASING"}});

        // updating local value
        this.setState({keywordCount: 0});

        // Setting a timer to reset all of this
        setTimeout(() => {
          this.setState({processingState: {status: "NO", info: ""}});
        }, appParams.TIMER_VALUE);

        break;
      }            
    }

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_COUNT, dbData.objectStoreNames.KEYWORDS].join(messageParams.separator), 
        callback: this.onKeywordsDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_COUNT, dbData.objectStoreNames.REMINDERS].join(messageParams.separator), 
        callback: this.onRemindersDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.SETTINGS].join(messageParams.separator), 
        callback: this.onSettingsDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, "all"].join(messageParams.separator), 
        callback: this.onAllDataReceived
      },
    ]);

  }

  saveCheckBoxNewState(event){

    // Initiating the recording of the new state
    sendDatabaseActionMessage(messageParams.requestHeaders.UPDATE_OBJECT, dbData.objectStoreNames.SETTINGS, {property: "notifications", value: event.target.checked});
  }

  saveDarkThemeState(){

  }

  deleteAll(){
    const response = confirm("Do you confirm the erase of all your data ?");
    if (response){
      // Displaying the spinner
      this.setState({processingState: {status: "YES", info: "ERASING"}});

      // Initiate data removal
      sendDatabaseActionMessage(messageParams.requestHeaders.DEL_OBJECT, "all", null);
    }
  }

  exportData(){

  }

  initDataExport(){
    const response = confirm("You are about to download all your data. Do you confirm ?");

    if (response){
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, "all", null);
    }

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle="Activity"/>
          <div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Activate notifications</strong>
                  <Form.Check // prettier-ignore
                    type="switch"
                    id="notif-custom-switch"
                    label=""
                    checked={this.state.notifSettingCheckBoxValue}
                    onChange={this.saveCheckBoxNewState}
                  />
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            {/*<div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Dark Theme</strong>
                  <Form.Check // prettier-ignore
                    type="switch"
                    id="theme-custom-switch"
                    label=""
                    checked={this.state.darkThemeCheckBoxValue}
                    onChange={this.saveDarkThemeState}
                  />
                </div>
              </div>
            </div>*/}
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Keywords <span class="badge text-bg-primary ms-1 shadow">{this.state.keywordCount}</span></strong>
                  <Link to="/index.html/Keywords" class="text-primary badge" title="Add new keyword">Add</Link>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Reminders <span class="badge text-bg-secondary ms-1 shadow">{this.state.reminderCount}</span></strong>
                  <Link to="/index.html/Reminders" class="text-primary badge" title="View reminders">View</Link>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">My identity</strong>
                  <Link to="/index.html/MyAccount" class="text-primary badge" title="View My ID">View</Link>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Export my data (csv)</strong>
                  <a href="#" onClick={() => {this.initDataExport()}} class="text-primary badge" title="Export all my data">Export</a>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Erase all data</strong>
                  <a href="#" class={"text-danger badge " + (this.state.processingState.status == "NO" && this.state.processingState.info == ""  ? "" : "d-none")} onClick={this.deleteAll}>Delete</a>
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="#198754" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class={"css-i6dzq1 " + (this.state.processingState.status == "NO" && this.state.processingState.info != "" ? "" : "d-none")}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <div class={"spinner-border spinner-border-sm " + (this.state.processingState.status == "YES" ? "" : "d-none")} role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
          </div>
        </div>

      </>
    )
  }
}
