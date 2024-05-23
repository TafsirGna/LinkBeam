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
/*import './Settings.css'*/
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import Form from 'react-bootstrap/Form';
import { OverlayTrigger, Tooltip, ProgressBar } from "react-bootstrap";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { DateTime as LuxonDateTime } from "luxon";
import JSZip from "jszip";
import { liveQuery } from "dexie"; 
import { 
  saveCurrentPageTitle,
  appParams,
  procExtractedData,
  switchToView,
  setGlobalDataSettings,
  removeObjectsId,
} from "./Local_library";
import eventBus from "./EventBus";
import { db } from "../db";
import { 
  AlertCircleIcon,
  TagIcon,
  KeyIcon,
  FolderIcon,
  BellIcon,
  DuplicateIcon,
} from "./widgets/SVGs";

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

const keywordCountObservable = liveQuery(() => db.keywords.count());
const tagCountObservable = liveQuery(() => db.tags.count());
const folderCountObservable = liveQuery(() => db.folders.count());

export default class SettingsView extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      keywordCount: 0,
      tagCount: 0,
      folderCount: 0,
      darkThemeCheckBoxValue: false,
      processingState: {
        status: "NO",
        info: ""
      },
      offCanvasShow: false,
      offCanvasTitle: "",
      offCanvasFormValidated: false,
      offCanvasFormStartDate: (new Date()).toISOString().split("T")[0],
      offCanvasFormEndDate: (new Date()).toISOString().split("T")[0],
      offCanvasFormSelectValue: "1",
      usageQuota: null,
    };

    this.deleteData = this.deleteData.bind(this);
    this.saveSettingsPropertyValue = this.saveSettingsPropertyValue.bind(this);
    this.checkStorageUsage = this.checkStorageUsage.bind(this);
    this.handleOffCanvasFormStartDateInputChange = this.handleOffCanvasFormStartDateInputChange.bind(this);
    this.handleOffCanvasFormEndDateInputChange = this.handleOffCanvasFormEndDateInputChange.bind(this);
    this.handleOffCanvasFormSelectInputChange = this.handleOffCanvasFormSelectInputChange.bind(this);
    this.initDataExport = this.initDataExport.bind(this);

  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.SETTINGS);

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

    this.keywordSubscription = keywordCountObservable.subscribe(
      result => this.setState({keywordCount: result}),
      error => this.setState({error})
    );

    this.tagSubscription = tagCountObservable.subscribe(
      result => this.setState({tagCount: result}),
      error => this.setState({error})
    );

    this.folderSubscription = folderCountObservable.subscribe(
      result => this.setState({folderCount: result}),
      error => this.setState({error})
    );

    this.checkStorageUsage();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.globalData != this.props.globalData){
      if (prevProps.globalData.settings != this.props.globalData.settings){
        this.setState({offCanvasFormStartDate: this.props.globalData.settings.lastDataResetDate.split("T")[0]});
      }
    }

  }

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

  componentWillUnmount(){

    if (this.keywordSubscription) {
      this.keywordSubscription.unsubscribe();
      this.keywordSubscription = null;
    }

    if (this.tagSubscription) {
      this.tagSubscription.unsubscribe();
      this.tagSubscription = null;
    }

    if (this.folderSubscription) {
      this.folderSubscription.unsubscribe();
      this.folderSubscription = null;
    }

  }

  deleteData(){
    const response = confirm("Do you confirm the erase of your data as specified ?");
    if (response){

      this.handleOffCanvasClose();
      // Displaying the spinner
      this.setState({processingState: {status: "YES", info: "ERASING"}});

      // Initiate data removal

      (async () => {

        for (var table of db.tables){

          if (["settings", "feedPosts", "reminders", "tags", "folders", "bookmarks"].indexOf(table.name) != -1){
            continue;
          }

          // the following code should allow me to delete all visits in the specified range without deleting any of the corresponding profile if this profile has been visited outside of this very range
          switch(table.name){

            case "feedPostViews": {

              if (this.state.offCanvasFormSelectValue == "1"){

                // Deleting all feedPost objects
                await db.feedPosts.clear();
                // Deleting all reminder objects if not done yet
                await db.reminders.clear();
                
              }
              else{

                const feedPostViews = await table.filter(entry => betweenRange(this.state.offCanvasFormStartDate, this.state.offCanvasFormEndDate, entry[datePropertyNames[table.name]].split("T")[0]))
                                      .toArray();
                var feedPostIds = [], doneFeedPostIds = [];

                await Promise.all(feedPostViews.map(async feedPostView => {

                  if (doneFeedPostIds.indexOf(feedPostView.feedPostId) == -1){

                    var subFeedPostViews = null;
                    [subFeedPostViews] = await Promise.all([
                      db.feedPostViews
                        .filter(entry => entry.feedPostId == feedPostView.feedPostId 
                                          && !betweenRange(this.state.offCanvasFormStartDate, this.state.offCanvasFormEndDate, entry[datePropertyNames[table.name]].split("T")[0]))
                        .toArray()
                    ]);

                    if (!subFeedPostViews.length){

                      feedPostIds.push(feedPostView.feedPostId);

                      // then i delete any reminder associated with this feedPost object
                      await db.reminders
                              .where({objectId: feedPostView.feedPostId})
                              .delete();

                    }

                    doneFeedPostIds.push(feedPostView.feedPostId);

                  }

                }));

                await db.feedPosts.where("id").anyOf(feedPostIds).delete();

              }

              break;

            }

            case "visits": {

              if (this.state.offCanvasFormSelectValue == "1"){

                // Deleting all reminder objects if not done yet
                await db.reminders.clear();
                // Deleting all folder objects
                await db.folders.clear();
                // Deleting all tag objects
                await db.tags.clear();
                // Deleting all bookmark objects
                await db.bookmarks.clear();

              }
              else{

                const profileVisits = await table.filter(entry => betweenRange(this.state.offCanvasFormStartDate, this.state.offCanvasFormEndDate, entry[datePropertyNames[table.name]].split("T")[0]))
                                      .toArray();

                var profileUrls = [];

                await Promise.all(profileVisits.map(async visit => {

                  if (!Object.hasOwn(visit, "profileData")){
                    return;
                  }

                  if (profileUrls.indexOf(visit.url) != -1){
                    return;
                  }

                  // Delete associated reminder if exists
                  await db.reminders
                          .where("objectId")
                          .anyOf([visit.url, encodeURI(visit.url), decodeURI(visit.url)])
                          .delete();

                  // Delete associated bookmarks
                  await db.bookmarks
                          .where("url")
                          .anyOf([visit.url, encodeURI(visit.url), decodeURI(visit.url)])
                          .delete();

                  // delete associated folder
                  var folder = await db.folders
                                        .filter(folder => folder.profiles && folder.profiles.map(p => p.url).indexOf(visit.url) != -1)
                                        .first();

                  if (folder){

                    folder.profiles.splice(folder.profiles.map(p => p.url).indexOf(visit.url), 1);

                    if (!folder.profiles.length){
                      if (betweenRange(this.state.offCanvasFormStartDate, this.state.offCanvasFormEndDate, folder.createdOn.split("T")[0])){
                        await db.folders
                                .where({id: folder.id})
                                .delete();
                      }
                    }
                    else{
                      await db.folders.update(folder.id, folder);
                    }

                  }

                  // delete associated tags
                  var tags = await db.tags
                                     .filter(tag => tag.profiles && tag.profiles.map(p => p.url).indexOf(visit.url) != -1)
                                     .toArray();

                  for (var tag of tags){
                    tag.profiles.splice(tag.profiles.map(p => p.url).indexOf(visit.url), 1);

                    if (!tag.profiles.length){
                      if (betweenRange(this.state.offCanvasFormStartDate, this.state.offCanvasFormEndDate, tag.createdOn.split("T")[0])){
                        await db.tags
                                .where({id: tag.id})
                                .delete();
                      }
                    }
                    else{
                      await db.tags.update(tag.id, tag);
                    }

                  }

                  profileUrls.push(visit.url);

                }));


              }

              break;
            }


          }

          if (this.state.offCanvasFormSelectValue == "1"){
            await table.clear();
          }
          else{
            await table.filter(entry => betweenRange(this.state.offCanvasFormStartDate, this.state.offCanvasFormEndDate, entry[datePropertyNames[table.name]].split("T")[0]))
                       .delete();
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

      }).bind(this)();

    }
  }

  initDataExport(action){
    const response = confirm(`Do you confirm the ${action} of your data as specified ?`);

    if (response){

      var dbData = {
        dbVersion: appParams.appDbVersion,
        objectStores: {},
      };

      (async () => {

        var tableData = null;
        for (var table of db.tables){

          if (table.name == "settings"){
            tableData = await table.toArray();
          }
          else if (["feedPosts", "reminders", "tags", "folders", "bookmarks"].indexOf(table.name) != -1){
            continue;
          }
          else{

            tableData = await table.filter(entry => betweenRange(this.state.offCanvasFormStartDate, this.state.offCanvasFormEndDate, entry[datePropertyNames[table.name]].split("T")[0]))
                                     .toArray();

            if (["keywords", "feedPostViews"].indexOf(table.name) != -1){ // no need to include the id for these objects
              tableData = removeObjectsId(tableData)
            }

          }

          dbData.objectStores[table.name] = tableData;

          switch(table.name){

            case "feedPostViews":{

              // Retrieving all the other db objects linked to the feed visits 
              var feedPosts = [],
                  reminders = [];
              await Promise.all (tableData.map (async feedPostView => {

                if (feedPosts.map(p => p.id).indexOf(feedPostView.feedPostId) != -1){
                  return;
                }

                // linked feedpost
                var feedPost = null, reminder = null;
                [feedPost] = await Promise.all([
                  db.feedPosts.where({id: feedPostView.feedPostId}).first()
                ]);

                // if (!feedPost){
                //   return;
                // }
                feedPosts.push(feedPost);

                // linked reminder if exists
                [reminder] = await Promise.all([
                  db.reminders.where({objectId: feedPost.id}).first()
                ]);

                if (reminder && reminders.map(r => r.id).indexOf(reminder.id) != -1){
                  reminders.push(reminder);
                }

              }));

              if (!dbData.objectStores["reminders"]){
                dbData.objectStores["reminders"] = removeObjectsId(reminders);
              }
              else{
                dbData.objectStores["reminders"] = dbData.objectStores["reminders"].concat(removeObjectsId(reminders));
              }
              dbData.objectStores["feedPosts"] = feedPosts;

              break;
              
            }

            // Retrieving all the other db objects linked to the profile visits 
            case "visits":{

              var profileUrls = [], 
                  reminders = [],
                  bookmarks = [],
                  folders = [],
                  tags = [];

              await Promise.all (tableData.map (async visit => {

                if (!Object.hasOwn(visit, 'profileData')){
                  return;
                }

                if (profileUrls.indexOf(visit.url) != -1){
                  return;
                }

                // linked reminder & bookmark
                var reminder = null,
                    bookmark = null;
                [reminder, bookmark] = await Promise.all([
                  db.reminders.where("objectId").anyOf([visit.url, encodeURI(visit.url), decodeURI(visit.url)]).first(),
                  db.bookmarks.where("url").anyOf([visit.url, encodeURI(visit.url), decodeURI(visit.url)]).first()
                ]);

                if (reminder && reminders.map(r => r.id).indexOf(reminder.id) != -1){
                  reminders.push(reminder);
                }

                if (bookmark && bookmarks.map(b => b.id).indexOf(bookmark.id) != -1){
                  bookmarks.push(bookmark);
                }

                // linked folders
                await db.folders
                        .each(folder => {

                          if (!folder.profiles){
                            return;
                          }

                          const profileIndex = folder.profiles.map(p => p.url).indexOf(visit.url);
                          if (profileIndex != -1){
                            const folderIndex = folders.map(f => f.id).indexOf(folder.id);
                            if (folderIndex != -1){
                              folders[folderIndex].profiles.push(folder.profiles[profileIndex]);
                            }
                            else{
                              folder.profiles = [folder.profiles[profileIndex]];
                              folders.push(folder);
                            }
                          }

                        });

                // linked tags
                await db.tags
                        .each(tag => {

                          if (!tag.profiles){
                            return;
                          }

                          const profileIndex = tag.profiles.map(p => p.url).indexOf(visit.url);
                          if (profileIndex != -1){
                            const tagIndex = tags.map(t => t.id).indexOf(tag.id);
                            if (tagIndex != -1){
                              tags[tagIndex].profiles.push(tag.profiles[profileIndex]);
                            }
                            else{
                              tag.profiles = [tag.profiles[profileIndex]];
                              tags.push(tag);
                            }
                          }

                        });

              }));

              if (!dbData.objectStores["reminders"]){
                dbData.objectStores["reminders"] = removeObjectsId(reminders);
              }
              else{
                dbData.objectStores["reminders"] = dbData.objectStores["reminders"].concat(removeObjectsId(reminders));
              }

              dbData.objectStores["bookmarks"] = removeObjectsId(bookmarks);
              dbData.objectStores["folders"] = removeObjectsId(folders);
              dbData.objectStores["tags"] = removeObjectsId(tags);

              break;
            }

          }

        }

        try {
      
          const jsonData = JSON.stringify(dbData),
                jsonDataBlob = new Blob([jsonData]);
          const fileName = "LinkBeam_Data_" + action + "_" + (this.state.offCanvasFormSelectValue == "1" ? `${LuxonDateTime.now().toFormat("dd_MMM_yy")}` : `${LuxonDateTime.fromISO(this.state.offCanvasFormStartDate).toFormat("dd_MMM_yy")}_to_${LuxonDateTime.fromISO(this.state.offCanvasFormEndDate).toFormat("dd_MMM_yy")}`) + ".json";
          procExtractedData(jsonDataBlob, fileName, action, new JSZip());

        } catch (error) {
          console.error('Error while downloading the received data: ', error);
        }

      }).bind(this)();
  
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

  handleOffCanvasFormStartDateInputChange(event) {

    this.setState({offCanvasFormStartDate: event.target.value}); 

  }

  handleOffCanvasFormEndDateInputChange(event) {

    this.setState({offCanvasFormEndDate: event.target.value}, () => {
      if (new Date(this.state.offCanvasFormEndDate) < new Date(this.state.offCanvasFormStartDate)){
        this.setState({offCanvasFormStartDate: this.state.offCanvasFormEndDate});
      }
    }); 

  }

  saveSettingsPropertyValue(property, value){

    var settings = this.props.globalData.settings;
    settings[property] = value;

    (async () => {

      await db.settings
              .update(1, settings);

    })();

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>

          <div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <BellIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Enable popup notifications
                  </strong>
                  <Form.Check // prettier-ignore
                    type="switch"
                    id="notif-custom-switch"
                    label=""
                    checked={ this.props.globalData.settings ? this.props.globalData.settings.notifications : false }
                    onChange={(event) => {this.saveSettingsPropertyValue("notifications", event.target.checked);}}
                  />
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <DuplicateIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Auto tab opening
                  </strong>
                  <Form.Check // prettier-ignore
                    type="switch"
                    id="notif-custom-switch"
                    label=""
                    checked={ this.props.globalData.settings ? this.props.globalData.settings.autoTabOpening : false }
                    onChange={(event) => {this.saveSettingsPropertyValue("autoTabOpening", event.target.checked);}}
                  />
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <BellIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Outdated profiles reminder
                  </strong>
                  <div class="dropdown">
                    <div data-bs-toggle="dropdown" aria-expanded="false" class="float-start py-0 handy-cursor">
                      <span class="rounded shadow-sm badge border text-primary">{this.props.globalData.settings ? this.props.globalData.settings.outdatedProfileReminder : null}</span>
                    </div>
                    <ul class="dropdown-menu shadow-lg border">
                      {["Never", "> 1 month", "> 6 months", "> 1 year"].map((value) => (
                            <li>
                              <a class="dropdown-item small" href="#" onClick={() => {this.saveSettingsPropertyValue("outdatedProfileReminder", value)}}>
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
                  <strong class="text-gray-dark">Max time per day</strong>
                  <div class="dropdown">
                    <div data-bs-toggle="dropdown" aria-expanded="false" class="float-start py-0 handy-cursor">
                      <span class="rounded shadow-sm badge border text-primary">{this.props.globalData.settings ? this.props.globalData.settings.maxTimeAlarm : null}</span>
                    </div>
                    <ul class="dropdown-menu shadow-lg border">
                      {["Never", "30 mins", "45 mins", "1 hour"].map((value) => (
                            <li>
                              <a class="dropdown-item small" href="#" onClick={() => {this.saveSettingsPropertyValue("maxTimeAlarm", value)}}>
                                {value}
                              </a>
                            </li>  
                        ))}
                    </ul>
                  </div>
                </div>
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
                  <strong class="text-gray-dark">
                    <KeyIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Keywords 
                    <span class="badge text-bg-primary ms-1 shadow">
                      {this.state.keywordCount}
                    </span>
                  </strong>
                  <a 
                    href="#" 
                    class="text-primary badge" 
                    title="Add new keyword"
                    onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.KEYWORDS)}}>
                      Add
                  </a>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <FolderIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Folders 
                    <span class="badge text-bg-primary ms-1 shadow">
                      {this.state.folderCount}
                    </span>
                  </strong>
                  <a 
                    href="#" 
                    class="text-primary badge" 
                    title="Add new folder"
                    onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.FOLDERS_SETTINGS)}}>
                      Add
                  </a>
                </div>
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <TagIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Tags 
                    <span class="badge text-bg-primary ms-1 shadow">
                      {this.state.tagCount}
                    </span>
                  </strong>
                  <a 
                    href="#" 
                    class="text-primary badge" 
                    title="Add new tag"
                    onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.TAGS)}}>
                      Add
                  </a>
                </div>
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">My identity</strong>
                  <a 
                    href="#" 
                    class="text-primary badge" 
                    title="View My ID"
                    onClick={() => {switchToView(eventBus, appParams.COMPONENT_CONTEXT_NAMES.MY_ACCOUNT)}}>
                      View
                  </a>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Export my data {/*(csv)*/}</strong>
                  <a href="#" onClick={() => {this.handleOffCanvasShow("Data export")}} class="text-primary badge" title="Export all my data">Export</a>
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
                  <strong class="text-gray-dark">Erase data</strong>
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

              { this.state.offCanvasTitle == "Data export" && 
                                        <div class="ms-auto">
                                          <button type="button" class="shadow btn btn-sm mx-2 border border-secondary" onClick={() => {this.initDataExport("archiving");}}>Archive</button>
                                          <button type="button" class="shadow btn btn-primary btn-sm" onClick={() => {this.initDataExport("export");}}>Export</button>
                                        </div>}
            </div>

          </Offcanvas.Body>
        </Offcanvas>

      </>
    )
  }
}
