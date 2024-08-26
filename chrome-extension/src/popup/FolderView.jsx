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

/*import './FolderView.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import ProfileListItemView from "./widgets/ProfileListItemView";
import { 
  saveCurrentPageTitle, 
  appParams,
  setGlobalDataFolders,
  setFolderProfiles,
} from "./Local_library";
import { db } from "../db";
import eventBus from "./EventBus";
import Accordion from 'react-bootstrap/Accordion';
import { 
  AlertCircleIcon,
  FolderIcon,
} from "./widgets/SVGs";
import { liveQuery } from "dexie";

export default class FolderView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      folderList: null,
    };
    
  }

  componentDidMount() {

    // Saving the current page title
    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.FOLDERS);

    if (!this.props.globalData.folderList){
      setGlobalDataFolders(db, eventBus, liveQuery);
    }
    else{
      (async () => {
        this.setState({folderList: await setFolderProfiles(this.props.globalData.folderList, db)});
      }).bind(this)();
    }

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.globalData != this.props.globalData){
      if (prevProps.globalData.folderList != this.props.globalData.folderList){
        (async () => {
          this.setState({folderList: await setFolderProfiles(this.props.globalData.folderList, db)});
        }).bind(this)();
      }
    }

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.FOLDERS}/>

          <div class="mt-3">

            { (!this.state.folderList 
                  || (this.state.folderList && this.state.folderList.length == 0))
                && <div class="text-center m-5 mt-4">
                      <AlertCircleIcon size="100" className="text-muted"/>
                      <p><span class="badge text-bg-primary fst-italic shadow">No folders yet</span></p>
                    </div> }

              { this.state.folderList 
                && this.state.folderList.length != 0
                && <Accordion/*defaultActiveKey="0"*/ className="shadow">
                    { this.state.folderList.map(folder => (<Accordion.Item eventKey={folder.id}>
                                                              <Accordion.Header>
                                                                <FolderIcon
                                                                  size="20"
                                                                  className="me-2 text-muted"/>
                                                                <span>
                                                                {folder.name}
                                                                </span>
                                                                <span 
                                                                  class="badge text-bg-light ms-2 shadow py-1 border"
                                                                  title={`${!folder.profiles ? 0 : folder.profiles.length} profiles`}>
                                                                  {!folder.profiles ? 0 : folder.profiles.length}
                                                                </span>
                                                              </Accordion.Header>
                                                              <Accordion.Body>
                                                                
                                                                { !folder.profiles 
                                                                    && <div class="text-center m-5 mt-4">
                                                                        <AlertCircleIcon size="100" className="text-muted"/>
                                                                        <p><span class="badge text-bg-primary fst-italic shadow">No profiles in '{folder.name}' folder yet</span></p>
                                                                      </div> }

                                                                { folder.profiles
                                                                    && folder.profiles.map(profile => (<ProfileListItemView profile={profile}/>)) }

                                                              </Accordion.Body>
                                                            </Accordion.Item>))}
                </Accordion>}

          </div>
        </div>
      </>
    );
  }
}
