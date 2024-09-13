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
import TagListView from "../widgets/Lists/TagListView";
import { 
  saveCurrentPageTitle, 
  appParams,
  setGlobalDataTags,
} from "../Local_library";
import eventBus from "../EventBus";
import { db } from "../../db";
import { liveQuery } from "dexie";
import { CheckIcon } from  "../widgets/SVGs";

export default class TagSettingsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      tag: "",
      processing: false,
      alertBadgeContent: "",
    };

    this.handleTagInputChange = this.handleTagInputChange.bind(this);
    this.addTag = this.addTag.bind(this);
    this.deleteTag = this.deleteTag.bind(this);
    this.checkInputTag = this.checkInputTag.bind(this);
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.TAGS);

    if (!this.props.globalData.tagList){

      setGlobalDataTags(db, eventBus, liveQuery);

    }

  }

  // Function for initiating the insertion of a tag
  addTag(){

    var message = null;

    if (this.state.tag == ""){
      return;
    }

    message = "The tag should consist of only one word !";
    if (this.state.tag.indexOf(" ") != -1){
      alert(message);
      return;
    }

    if (!this.checkInputTag()){
      console.log("Check of input returned false");
      return;
    }

    // Displaying the spinner and cleaning the tag input
    this.setState({processing: true}, () => {
      
      (async () => {

        await db.tags.add({
                                name: this.state.tag,
                                createdOn: (new Date()).toISOString(),
                              });

        this.setState({processing: false, tag: "", alertBadgeContent: "Added !"}, () => {

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
      this.addTag();
    }
  }

  checkInputTag(){

    // Making sure that there's no duplicates
    for (let tag of this.props.globalData.tagList){
      
      if (tag.name.toLowerCase() === this.state.tag.toLowerCase()){
        alert("Duplicated tags are not allowed !");
        return false;
      }

    }

    return true;
  }

  deleteTag(tag){

    this.setState({processing: true}, () => {

      (async () => {

        await db.tags.delete(tag.id);

        this.setState({processing: false, tag: "", alertBadgeContent: "Deleted !"}, () => {

          // Setting a timeout for the alertBadge to disappear
          setTimeout(() => {
            this.setState({alertBadgeContent: ""});
          }
          , appParams.TIMER_VALUE_1);

        });

      }).bind(this)();

    });

  }

  handleTagInputChange = (event) => this.setState({tag: event.target.value});

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.OBJECTS_SETTINGS}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.TAGS}/>

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
              <input onKeyDown={this.handleKeyDown} type="text" class="form-control" placeholder="New tag" aria-describedby="basic-addon2" value={this.state.tag} onChange={this.handleTagInputChange}/>
              <span class="input-group-text handy-cursor" id="basic-addon2" onClick={this.addTag}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 text-muted"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </span>
            </div>
            
            {/* tag list view */}

            <TagListView 
              objects={this.props.globalData.tagList} 
              deleteTag={this.deleteTag} />

          </div>
        </div>
      </>
    );
  }

}
