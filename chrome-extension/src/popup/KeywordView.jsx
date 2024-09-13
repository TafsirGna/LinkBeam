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
import KeywordListView from "./widgets/Lists/KeywordListView";
import { 
  saveCurrentPageTitle, 
  appParams,
  setGlobalDataKeywords,
} from "./Local_library";
import eventBus from "./EventBus";
import { db } from "../db";
import { liveQuery } from "dexie";
import { CheckIcon } from  "./widgets/SVGs";

export default class KeywordView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      keyword: "",
      processing: false,
      alertBadgeContent: "",
    };

    this.handleKeywordInputChange = this.handleKeywordInputChange.bind(this);
    this.addKeyword = this.addKeyword.bind(this);
    this.deleteKeyword = this.deleteKeyword.bind(this);
    this.checkInputKeyword = this.checkInputKeyword.bind(this);
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.KEYWORDS);

    if (!this.props.globalData.keywordList){

      setGlobalDataKeywords(db, eventBus, liveQuery);

    }

  }

  // Function for initiating the insertion of a keyword
  addKeyword(){

    var message = null;

    if (this.state.keyword == ""){
      return;
    }

    message = "The keyword should consist of only one word !";
    if (this.state.keyword.indexOf(" ") != -1){
      alert(message);
      return;
    }

    // is it contained in an already-saved keyword
    message = "The given keyword is contained in or contains a keyword you've already saved !";
    for (var keywordObject of this.props.globalData.keywordList){
      if (keywordObject.name.toLowerCase().indexOf(this.state.keyword.toLowerCase()) != -1
          || this.state.keyword.toLowerCase().indexOf(keywordObject.name.toLowerCase()) != -1){
        alert(message);
        return;
      }

    }

    if (!this.checkInputKeyword()){
      console.log("Check of input returned false");
      return;
    }

    // Displaying the spinner and cleaning the keyword input
    this.setState({processing: true}, () => {
      
      (async () => {

        await db.keywords.add({
                                name: this.state.keyword,
                                createdOn: (new Date()).toISOString(),
                              });

        this.setState({processing: false, keyword: "", alertBadgeContent: "Added !"}, () => {

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
      this.addKeyword();
    }
  }

  checkInputKeyword(){

    // Enforcing the limit constraint on the list length
    if (this.props.globalData.keywordList.length == appParams.keywordCountLimit){
      alert("You can not add more than " + appParams.keywordCountLimit + " keywords !");
      return false;
    }

    // Making sure that there's no duplicates
    for (let keyword of this.props.globalData.keywordList){
      
      if (keyword.name.toLowerCase() === this.state.keyword.toLowerCase()){
        alert("Duplicated keywords are not allowed !");
        return false;
      }

    }

    return true;
  }

  deleteKeyword(keyword){

    this.setState({processing: true}, () => {

      (async () => {

        await db.keywords.delete(keyword.id);

        this.setState({processing: false, keyword: "", alertBadgeContent: "Deleted !"}, () => {

          // Setting a timeout for the alertBadge to disappear
          setTimeout(() => {
            this.setState({alertBadgeContent: ""});
          }
          , appParams.TIMER_VALUE_1);

        });

      }).bind(this)();

    });

  }

  handleKeywordInputChange = (event) => this.setState({keyword: event.target.value});

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.OBJECTS_SETTINGS}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.KEYWORDS}/>

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
              <input onKeyDown={this.handleKeyDown} type="text" class="form-control" placeholder="New keyword" aria-describedby="basic-addon2" value={this.state.keyword} onChange={this.handleKeywordInputChange}/>
              <span class="input-group-text handy-cursor" id="basic-addon2" onClick={this.addKeyword}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 text-muted"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </span>
            </div>
            
            {/* Keyword list view */}

            <KeywordListView 
              objects={this.props.globalData.keywordList} 
              deleteKeyword={this.deleteKeyword} />

          </div>
        </div>
      </>
    );
  }

}
