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

import React from 'react';
import BackToPrev from "../widgets/BackToPrev";
import PageTitleView from "../widgets/PageTitleView";
import { 
  saveCurrentPageTitle, 
  appParams,
  setGlobalDataSettings,
  saveSettingsPropertyValue,
  procExtractedData,
  removeObjectsId,
  allUrlCombinationsOf,
  getProfileDataFrom,
  convertToCsvString,
  checkForDbIncoherences,
} from "../Local_library";
import eventBus from "../EventBus";
import { db } from "../../db";
import { liveQuery } from "dexie";
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { 
  BookmarkIcon,
  MaximizeIcon,
  DeletionIcon,
  DownloadIcon,
  StorageIcon,
  SearchIcon,
} from  "../widgets/SVGs";
import { DateTime as LuxonDateTime } from "luxon";
import JSZip from "jszip";
import { OverlayTrigger, Tooltip, ProgressBar } from "react-bootstrap";

const datePropertyNames = {
        bookmarks: "createdOn",
        keywords: "createdOn",
        tags: "createdOn",
        folders: "createdOn",
        reminders: "createdOn",
        visits: "date",
        feedPostViews: "date",
      };

const betweenRange = (lower, upper, date) => {
  return (new Date(lower) <= new Date(date) && new Date(date) <= new Date(upper));
}

export default class DataSettingsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      processingState: {
        status: "NO",
        info: ""
      },
      offCanvasShow: false,
      offCanvasTitle: "",
      offCanvasFormValidated: false,
      offCanvasFormStartDate: null /*(new Date()).toISOString().split("T")[0]*/,
      offCanvasFormEndDate: (new Date()).toISOString().split("T")[0],
      offCanvasFormSelectValue: "1",
      usageQuota: null,
      checkingDbStatus: null,
    };

    this.deleteData = this.deleteData.bind(this);
    this.checkStorageUsage = this.checkStorageUsage.bind(this);
    this.handleOffCanvasFormStartDateInputChange = this.handleOffCanvasFormStartDateInputChange.bind(this);
    this.handleOffCanvasFormEndDateInputChange = this.handleOffCanvasFormEndDateInputChange.bind(this);
    this.handleOffCanvasFormSelectInputChange = this.handleOffCanvasFormSelectInputChange.bind(this);
    this.onDbCheckActionTriggered = this.onDbCheckActionTriggered.bind(this);
    this.initDataExport = this.initDataExport.bind(this);

  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.DATA_SETTINGS);

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }
    else{
      this.setOffCanvasFormStartDate();
    }

    this.checkStorageUsage();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.globalData != this.props.globalData){
      if (prevProps.globalData.settings != this.props.globalData.settings){
        this.setOffCanvasFormStartDate();
      }
    }

  }

  setOffCanvasFormStartDate = () => {this.setState({offCanvasFormStartDate: this.props.globalData.settings.lastDataResetDate.split("T")[0]});}

  handleOffCanvasClose = () => {this.setState({offCanvasShow: false, offCanvasFormSelectValue: "1"})};
  handleOffCanvasShow = (title) => {this.setState({offCanvasShow: true, offCanvasTitle: title})};

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

  async deleteData(){

    if (!confirm("Do you confirm the erase of your data as specified ?")){
      return;
    }

    this.handleOffCanvasClose();
    // Displaying the spinner
    this.setState({processingState: {status: "YES", info: "ERASING"}});

    // Initiate data removal
    for (const table of db.tables){

      if (this.state.offCanvasFormSelectValue == "1"){
        if (table.name != "settings"){
          await table.clear();
        }
        continue;
      }

      // the following code should allow me to delete all visits in the specified range without deleting any of the corresponding profile if this profile has been visited outside of this very range
      switch(table.name){

        case "settings": {
          continue;
          // break;
        }

        // case "visits": {
        //   break;
        // }

        default: {
          await table.filter(entry => betweenRange(this.state.offCanvasFormStartDate, this.state.offCanvasFormEndDate, entry[datePropertyNames[table.name]].split("T")[0]))
                     .delete();
        }


      }

    }

    this.setState({
      processingState: {status: "NO", info: "ERASING"},
    });

    this.checkStorageUsage();

    // Setting a timer to reset all of this
    setTimeout(() => {
      this.setState({processingState: {status: "NO", info: ""}});
    }, appParams.TIMER_VALUE_1);
  }

  async initDataExport(action, format){

    if (!confirm(`Do you confirm the ${action} of your data as specified ?`)){
      return;
    }

    var dbData = {
      dbVersion: appParams.appDbVersion,
      objectStores: {},
    };

    var tableData = null;
    for (const table of db.tables){

      if (this.state.offCanvasFormSelectValue == "1"){
        dbData.objectStores[table.name] = removeObjectsId(await table.toArray());
        continue;
      }

      if (table.name == "settings"){
        tableData = await table.toArray();
      }
      else if (["feedPosts", "feedProfiles"].indexOf(table.name) != -1){
        continue;
      }
      else{
        tableData = await table.filter(entry => betweenRange(this.state.offCanvasFormStartDate, this.state.offCanvasFormEndDate, entry[datePropertyNames[table.name]].split("T")[0]))
                               .toArray();
      }

      switch(table.name){

        case "feedPostViews":{

          // Retrieving all the other db objects linked to the feed visits 
          var feedPosts = [],
              feedProfiles = [];
          
          for (const feedPostView of tableData.filter((value, index, self) => self.findIndex(v => v.feedPostId == value.feedPostId) === index)){

            // Associated feedpost
            const feedPost = await db.feedPosts.where({uniqueId: feedPostView.feedPostId}).first();
            const linkedPost = feedPost.linkedPostId 
                              ? await db.feedPosts.where({uniqueId: feedPost.linkedPostId}).first()
                              : null;

            feedPosts.push(feedPost);
            feedProfiles.push(await db.feedProfiles.where({uniqueId: feedPost.profileId}).first());
            if (linkedPost){ 
              feedPosts.push(linkedPost); 
              feedProfiles.push(await db.feedProfiles.where({uniqueId: feedPosts.profileId}).first());
            }

          }

          dbData.objectStores["feedPosts"] = removeObjectsId(feedPosts);
          dbData.objectStores["feedProfiles"] = removeObjectsId(feedProfiles);

          break;
          
        }

        // Retrieving all the other db objects linked to the profile visits 
        case "visits":{

          for (const visit of tableData.filter(v => Object.hasOwn(v, "profileData"))
                                       .filter((value, index, self) => self.findIndex(v => v.url == value.url) === index)){

            const index = tableData.findIndex(v => v.url == visit.url);
            tableData[index].profileData = await getProfileDataFrom(db, visit.url, null, (new Date(this.state.offCanvasFormEndDate)).toISOString().split("T")[0]);

          };

          break;
        }

      }

      dbData.objectStores[table.name] = removeObjectsId(tableData);

    }

    try {
  
      const fileName = `LinkBeam_Data_${action}_${(this.state.offCanvasFormSelectValue == "1" 
                                                    ? LuxonDateTime.now().toFormat("dd_MMM_yy") 
                                                    : `${LuxonDateTime.fromISO(this.state.offCanvasFormStartDate).toFormat("dd_MMM_yy")}_to_${LuxonDateTime.fromISO(this.state.offCanvasFormEndDate).toFormat("dd_MMM_yy")}`)}.${format}`;
      
      const blob = format == "json" 
                    ? new Blob([JSON.stringify(dbData)]) 
                    : new Blob([convertToCsvString(dbData)], { type: 'text/csv' });
      procExtractedData(blob, fileName, action, new JSZip());

      // updating the local lastDataBackupDate value
      chrome.storage.local.set({ lastDataBackupDate: new Date().toISOString() });

    } catch (error) {
      console.error('Error while downloading the received data: ', error);
    }

  }

  handleOffCanvasFormSelectInputChange(event) {

    this.setState({offCanvasFormSelectValue: event.target.value}, () => {
      this.setState({offCanvasFormEndDate: (new Date()).toISOString().split("T")[0]});
      if (this.state.offCanvasFormSelectValue == "1"){
        this.setState({offCanvasFormStartDate: this.props.globalData.settings.lastDataResetDate.split("T")[0]});
      }
    }); 

  }

  handleOffCanvasFormStartDateInputChange = (event) => this.setState({offCanvasFormStartDate: event.target.value}); 

  handleOffCanvasFormEndDateInputChange(event) {

    this.setState({offCanvasFormEndDate: event.target.value}, () => {
      if (new Date(this.state.offCanvasFormEndDate) < new Date(this.state.offCanvasFormStartDate)){
        this.setState({offCanvasFormStartDate: this.state.offCanvasFormEndDate});
      }
    }); 

  }

  onDbCheckActionTriggered(){

    if (this.state.checkingDbStatus == "done"){
      return;
    }

    this.setState({checkingDbStatus: "ongoing"}, async () => {

      await checkForDbIncoherences(db);
      this.setState({checkingDbStatus: "done"});

    })

  }

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.DATA_SETTINGS}/>

          <div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <DownloadIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Remind me to backup data every
                  </strong>
                  <div class="dropdown">
                    <div data-bs-toggle="dropdown" aria-expanded="false" class="float-start py-0 handy-cursor">
                      <span class="rounded shadow-sm badge border text-primary">{this.props.globalData.settings && this.props.globalData.settings.dataBackupReminderFrequency ? this.props.globalData.settings.dataBackupReminderFrequency : appParams.allDataBackupReminderFrequencyValues[0]}</span>
                    </div>
                    <ul class="dropdown-menu shadow-lg border">
                      {appParams.allDataBackupReminderFrequencyValues.map((value) => (
                            <li>
                              <a 
                                class="dropdown-item small" 
                                href="#" 
                                onClick={() => {
                                  saveSettingsPropertyValue("dataBackupReminderFrequency", value, this.props.globalData, db); 
                                  if (value == "Never"){
                                    chrome.storage.local.set({ lastDataBackupDate: null });
                                  }
                                }}>
                                {value}
                              </a>
                            </li>  
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <SearchIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Check data in db
                  </strong>

                  { this.state.checkingDbStatus == "ongoing"
                      && <Spinner animation="border" size="sm" /> }

                  { (this.state.checkingDbStatus == null
                        || this.state.checkingDbStatus == "done")
                      && <a 
                          href="#" 
                          onClick={this.onDbCheckActionTriggered} 
                          class={`text-${this.state.checkingDbStatus != "done" ? "primary" : "success"} badge`} 
                          title="Check data">
                          Check{this.state.checkingDbStatus == "done" && "ed"}
                        </a> }

                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <DownloadIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Export my data {/*(csv)*/}
                  </strong>
                  <a href="#" onClick={() => {this.handleOffCanvasShow("Data export")}} class="text-primary badge" title="Export all my data">Export</a>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <StorageIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Storage usage
                  </strong>

                  { !this.state.usageQuota && <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip id="tooltip1">Not supported feature</Tooltip>}
                                    >
                                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 text-danger me-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                    </OverlayTrigger>}
                  { this.state.usageQuota && <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip id="tooltip2">{this.state.usageQuota.size}Mb | {this.state.usageQuota.percentage}% used</Tooltip>}
                                    >
                                      <div style={{width:"30px", height:"7px"}} class="progress me-2 shadow" role="progressbar" aria-label="Basic example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
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
                  <strong class="text-gray-dark">
                    <DeletionIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Erase data
                  </strong>
                  { this.state.processingState.status == "NO" 
                      && this.state.processingState.info == "" 
                      && <a href="#" class="text-danger badge " title="Delete data" onClick={() => {this.handleOffCanvasShow("Data deletion")}}>Delete</a>}
                  { this.state.processingState.status == "NO" 
                      && this.state.processingState.info != "" 
                      && <svg viewBox="0 0 24 24" width="18" height="18" stroke="#198754" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
                  { this.state.processingState.status == "YES"
                      && <div class="spinner-border spinner-border-sm" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>}
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
          </div>

        </div>


        {/*Offcanvas*/}
        <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>{this.state.offCanvasTitle}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>

            <Form noValidate validated={this.state.offCanvasFormValidated} id="offcanvas_form" className="small text-muted">
              <Form.Select aria-label="Default select example" size="sm"
                onChange={this.handleOffCanvasFormSelectInputChange}
                className="shadow"
                value={this.state.offCanvasFormSelectValue}
                >
                <option value="1">All</option>
                <option value="2">Specific dates</option>
              </Form.Select>
              <Form.Group className="my-3" controlId="reminderForm.scheduledForControlInput1">
                <Form.Label>Starting</Form.Label>
                <Form.Control
                  type="date"
                  autoFocus
                  max={(new Date(this.state.offCanvasFormEndDate)).toISOString().split("T")[0]}
                  min={this.props.globalData.settings ? this.props.globalData.settings.lastDataResetDate.split("T")[0] : this.state.offCanvasFormStartDate}
                  value={this.state.offCanvasFormStartDate}
                  onChange={this.handleOffCanvasFormStartDateInputChange}
                  className=""
                  // readOnly={this.state.display}
                  disabled={this.state.offCanvasFormSelectValue == "1"}
                  required
                  size="sm"
                />
                <Form.Control.Feedback type="invalid">
                  Please choose a valid date.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="reminderForm.scheduledForControlInput2">
                <Form.Label>Ending</Form.Label>
                <Form.Control
                  type="date"
                  autoFocus
                  max={new Date().toISOString().slice(0, 10)}
                  min={this.props.globalData.settings ? this.props.globalData.settings.lastDataResetDate.split("T")[0] : this.state.offCanvasFormStartDate}
                  value={this.state.offCanvasFormEndDate}
                  onChange={this.handleOffCanvasFormEndDateInputChange}
                  className=""
                  // readOnly={this.state.display}
                  disabled={this.state.offCanvasFormSelectValue == "1"}
                  required
                  size="sm"
                />
                <Form.Control.Feedback type="invalid">
                  Please choose a valid date.
                </Form.Control.Feedback>
              </Form.Group>
            </Form>

            <div class="d-flex">
              { this.state.offCanvasTitle == "Data deletion" && <button type="button" class="shadow btn btn-danger btn-sm ms-auto" onClick={this.deleteData}>Delete</button>}

              { this.state.offCanvasTitle == "Data export" 
                  && <div class="ms-auto">
                        {this.state.processingState.status == "YES"
                          && <div class="spinner-border spinner-border-sm" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>}
                        { this.state.processingState.status == "NO" 
                            && <div>
                                <button type="button" class="shadow btn btn-sm mx-2 border border-secondary" onClick={() => {this.initDataExport("archiving", "json");}}>Archive</button>
                                <div class="dropdown d-inline">
                                  <button type="button" class="dropdown-toggle shadow btn btn-primary btn-sm" data-bs-toggle="dropdown" aria-expanded="false">Export</button>
                                  <ul class="dropdown-menu shadow-lg">
                                    <li>
                                      <a class="dropdown-item small" href="#" onClick={() => {this.initDataExport("export", "csv");}}>
                                        {/*<BarChartIcon
                                            size="15"
                                            className="me-2 text-muted"/>*/}
                                        Csv
                                        {/*<span class="badge text-bg-danger rounded-pill ms-1 px-1 shadow-sm">In test</span>*/}
                                      </a>
                                      <a class="dropdown-item small" href="#" onClick={() => {this.initDataExport("export", "json");}}>
                                        {/*<BarChartIcon
                                            size="15"
                                            className="me-2 text-muted"/>*/}
                                        Json
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </div>}
                    </div>}
            </div>

          </Offcanvas.Body>
        </Offcanvas>


      </>
    );
  }

}
