import React from 'react';
/*import './Settings.css'*/
import BackToPrev from "./widgets/BackToPrev";
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip, ProgressBar } from "react-bootstrap";
import moment from 'moment';
import { 
  saveCurrentPageTitle, 
  sendDatabaseActionMessage,
  ack,
  startMessageListener, 
  messageParams,
  dbData, 
} from "./Local_library";

export default class SettingsView extends React.Component{
  
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
      },
      usageQuota: null,
    };

    this.deleteAll = this.deleteAll.bind(this);
    this.saveCheckBoxNewState = this.saveCheckBoxNewState.bind(this);
    this.saveDarkThemeState = this.saveDarkThemeState.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onKeywordsDataReceived = this.onKeywordsDataReceived.bind(this);
    this.onSettingsDataReceived = this.onSettingsDataReceived.bind(this);
    this.onRemindersDataReceived = this.onRemindersDataReceived.bind(this);
    this.onAllDataReceived = this.onAllDataReceived.bind(this);
    this.checkStorageUsage = this.checkStorageUsage.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();

    saveCurrentPageTitle("Settings");

    if (Object.hasOwn(this.props.globalData.settings, 'notifications')){
      this.setState({notifSettingCheckBoxValue: this.props.globalData.settings.notifications});
    }
    else{
      // Knowing the previous status of the notification checkbox
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["notifications"]);
    }

    // setting the local variable with the global data
    if (this.props.globalData.keywordList){
      this.setState({keywordCount: this.props.globalData.keywordList.length});
    }
    else{
      // Getting the keyword count
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_COUNT, dbData.objectStoreNames.KEYWORDS, null);
    }

    if (this.props.globalData.reminderList){
      this.setState({reminderCount: this.props.globalData.reminderList.length});
    }
    else{
      // Getting the reminder count
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_COUNT, dbData.objectStoreNames.REMINDERS, null);
    }

    this.checkStorageUsage();
  }

  checkStorageUsage(){

    // Storage usage 
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then((({usage, quota}) => {
        console.log(`Using ${usage} out of ${quota} bytes.`);
        var usageQuota = {percentage: ((usage * 100) / quota).toFixed(1), size: Math.round(usage / (1024 * 1024))};
        this.setState({usageQuota: usageQuota});
      }).bind(this));
    }

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
      
      var jsonData = JSON.stringify(message.data.objectData);

      const url = window.URL.createObjectURL(new Blob([jsonData]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `LinkBeam_Data_Export_${moment(new Date()).format("DD_MMM_YY")}.json`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

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
        this.setState({
          processingState: {status: "NO", info: "ERASING"},
          keywordCount: 0,
          reminderCount: 0,
        });

        this.checkStorageUsage();

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
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Automatic tab opening</strong>
                  <Form.Check // prettier-ignore
                    type="switch"
                    id="notif-custom-switch"
                    label=""
                    checked={true}
                    // onChange={this.saveCheckBoxNewState}
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
                  <strong class="text-gray-dark">Storage usage</strong>

                  { !this.state.usageQuota && <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip id="tooltip1">Not supported feature</Tooltip>}
                                    >
                                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 text-danger me-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                    </OverlayTrigger>}
                  { this.state.usageQuota && <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip id="tooltip2">{this.state.usageQuota.percentage}%({this.state.usageQuota.size}Mb) used</Tooltip>}
                                    >
                                      {/*<ProgressBar now={60} class="me-2" style={{width:"30px", height:"7px"}}/>*/}
                                      <div style={{width:"30px", height:"7px"}} class="progress me-2" role="progressbar" aria-label="Basic example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                        <div class="progress-bar rounded" style={{width: this.state.usageQuota.percentage+"%"}}></div>
                                      </div>
                                    </OverlayTrigger>}
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Erase all data</strong>
                  { this.state.processingState.status == "NO" && this.state.processingState.info == "" && <a href="#" class="text-danger badge " onClick={this.deleteAll}>Delete</a>}
                  { this.state.processingState.status == "NO" && this.state.processingState.info != "" && <svg viewBox="0 0 24 24" width="18" height="18" stroke="#198754" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
                  { this.state.processingState.status == "YES" && <div class="spinner-border spinner-border-sm" role="status">
                                      <span class="visually-hidden">Loading...</span>
                                    </div>}
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
