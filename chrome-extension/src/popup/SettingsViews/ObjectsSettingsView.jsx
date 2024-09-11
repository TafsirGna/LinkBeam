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
  setGlobalDataFolders,
  switchToView
} from "../Local_library";
import eventBus from "../EventBus";
import { db } from "../../db";
import { liveQuery } from "dexie";
import {
  KeyIcon,
  TagIcon,
  FolderIcon,
} from  "../widgets/SVGs";

const keywordCountObservable = liveQuery(() => db.keywords.count());
const tagCountObservable = liveQuery(() => db.tags.count());
const folderCountObservable = liveQuery(() => db.folders.count());

export default class ObjectsSettingsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      keywordCount: 0,
      tagCount: 0,
      folderCount: 0,
    };
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.OBJECTS_SETTINGS);

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

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>

          <div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">
                    <KeyIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Keywords 
                    <span class="badge text-bg-light ms-1 shadow border">
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
                    <span class="badge text-bg-light ms-1 shadow border">
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
                    <span class="badge text-bg-light ms-1 shadow border">
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
          </div>

        </div>
      </>
    );
  }

}
