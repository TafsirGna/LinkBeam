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
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import FolderListView from "./widgets/FolderListView";
import { 
  saveCurrentPageTitle, 
  appParams,
  setGlobalDataFolders,
} from "./Local_library";
import eventBus from "./EventBus";
import { db } from "../db";
import { liveQuery } from "dexie";
import { CheckIcon } from  "./widgets/SVGs";

export default class FolderView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      folder: "",
      processing: false,
      alertBadgeContent: "",
    };

    this.handleFolderInputChange = this.handleFolderInputChange.bind(this);
    this.addFolder = this.addFolder.bind(this);
    this.deleteFolder = this.deleteFolder.bind(this);
    this.checkInputFolder = this.checkInputFolder.bind(this);
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.FOLDERS_SETTINGS);

    if (!this.props.globalData.folderList){

      setGlobalDataFolders(db, eventBus, liveQuery);

    }

  }

  // Function for initiating the insertion of a folder
  addFolder(){

    var message = null;

    if (this.state.folder == ""){
      return;
    }

    if (!this.checkInputFolder()){
      console.log("Check of input returned false");
      return;
    }

    // Displaying the spinner and cleaning the folder input
    this.setState({processing: true}, () => {
      
      (async () => {

        await db.folders.add({
                                name: this.state.folder,
                                createdOn: (new Date()).toISOString(),
                              });

        this.setState({processing: false, folder: "", alertBadgeContent: "Added !"}, () => {

          // Setting a timeout for the alertBadge to disappear
          setTimeout(() => {
            this.setState({alertBadgeContent: ""});
          }
          , appParams.TIMER_VALUE_1);

        });

      }).bind(this)();

    });

  }

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.addFolder();
    }
  }

  checkInputFolder(){

    // Making sure that there's no duplicates
    for (let folder of this.props.globalData.folderList){
      
      if (folder.name.toLowerCase() === this.state.folder.toLowerCase()){
        alert("Duplicated folders are not allowed !");
        return false;
      }

    }

    return true;
  }

  deleteFolder(folder){

    this.setState({processing: true}, () => {

      (async () => {

        await db.folders.delete(folder.id);

        this.setState({processing: false, folder: "", alertBadgeContent: "Deleted !"}, () => {

          // Setting a timeout for the alertBadge to disappear
          setTimeout(() => {
            this.setState({alertBadgeContent: ""});
          }
          , appParams.TIMER_VALUE_1);

        });

      }).bind(this)();

    });

  }

  handleFolderInputChange(event) {
    this.setState({folder: event.target.value});
  }

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.OBJECTS_SETTINGS}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.FOLDERS}/>

          <div class="clearfix">
            <div class={"spinner-grow float-end spinner-grow-sm text-secondary " + (this.state.processing ? "" : "d-none")} role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div class={"float-end " + (this.state.alertBadgeContent == "" ? "d-none" : "")}>
              <span class="badge text-bg-success fst-italic shadow-sm">
                <CheckIcon size="16"/>
                {this.state.alertBadgeContent}
              </span>
            </div>
          </div>
          <div class="mt-3">
            <div class="input-group mb-3 shadow">
              <input onKeyDown={this.handleKeyDown} type="text" class="form-control" placeholder="New folder" aria-describedby="basic-addon2" value={this.state.folder} onChange={this.handleFolderInputChange}/>
              <span class="input-group-text handy-cursor" id="basic-addon2" onClick={this.addFolder}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 text-muted"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </span>
            </div>
            
            {/* folder list view */}

            <FolderListView 
              objects={this.props.globalData.folderList} 
              deleteFolder={this.deleteFolder} />

          </div>
        </div>
      </>
    );
  }

}
