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


/*import './SearchInputView.css'*/
import React from 'react';
import default_user_icon from '../../assets/user_icons/default.png';
import { SearchIcon } from './SVGs';
import eventBus from "../EventBus";
import { 
  appParams,
  dbData,
  setGlobalDataReminders,
  setGlobalDataHomeAllVisitsList,
  getProfileDataFrom,
  dbDataSanitizer,
  setReminderObject,
  isLinkedinProfilePage,
  parseHtmlFromString,
  allUrlCombinationsOf,
} from "../Local_library";
import { db } from "../../db";

export default class SearchInputView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    	text: "",
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.searchPosts = this.searchPosts.bind(this);
    this.searchProfiles = this.searchProfiles.bind(this);
    this.searchReminders = this.searchReminders.bind(this);
    this.highlightSearchText = this.highlightSearchText.bind(this);

  }

  componentDidMount() {

  }

  handleInputChange(event){

  	this.setState({text: event.target.value});

  }

  componentDidUpdate(prevProps, prevState){

  }

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.searchText();
    }
  }

  highlightSearchText = (propValue) => {

    const index = propValue.toLowerCase().indexOf(this.state.text.toLowerCase());
    var result = propValue.slice(0, index)
    result += `<span class="border rounded shadow bg-info-subtle text-muted border-primary">${propValue.slice(index, (index + this.state.text.length))}</span>`;
    result += propValue.slice((index + this.state.text.length));

    return result;

  }

  searchText(){

    if (!this.state.text.length){

      switch(this.props.objectStoreName){
        case dbData.objectStoreNames.VISITS:{
          if (this.props.globalData.homeAllVisitsList && this.props.globalData.homeAllVisitsList.action == "search"){
            setGlobalDataHomeAllVisitsList(db, eventBus, this.props.globalData);
          }
          break;
        }
        case dbData.objectStoreNames.REMINDERS:{
          if (this.props.globalData.reminderList && this.props.globalData.reminderList.action == "search"){
            setGlobalDataReminders(db, eventBus);
          }
          break;
        }
        case "posts":{
          eventBus.dispatch(eventBus.SET_MATCHING_POSTS_DATA, {searchText: this.state.text, results: []});
          break;
        }
        case "media":{
          this.props.searchTextChanged({searchText: this.state.text, results: []});
          break;
        }
        case "feed_profiles":{
          this.props.searchTextChanged({searchText: this.state.text, results: []});
          break;
        }

        case "quotes":{
          this.props.searchTextChanged({searchText: this.state.text, results: []});
          break;
        }
      }

      return;
      
    }

    switch(this.props.objectStoreName){

      case dbData.objectStoreNames.VISITS:{
        this.searchProfiles()
        break;
      }
      case dbData.objectStoreNames.REMINDERS:{
        this.searchReminders();
        break;
      }
      case "posts":{
        this.searchPosts();
        break;
      }
      case "media":{
        this.searchPosts("media_only");
        break;
      }
      case "feed_profiles":{
        this.props.searchTextChanged({searchText: this.state.text, results: []});
        break;
      }
      case "quotes":{
        this.props.searchTextChanged({searchText: this.state.text, results: []});
        break;
      }
    }

  }

  async searchReminders(){

    var reminders = null;

    try{

      reminders = [];

      for (var reminder of (await db.reminders.toArray())){

        if (reminders.map(r => r.id).indexOf(reminder.id) != -1){
          continue;
        }

        // first condition
        if (reminder.text.toLowerCase().indexOf(this.state.text.toLowerCase()) != -1){
          await setReminderObject(db, reminder);
          reminders.push(reminder);
          continue;  
        }

        // second condition
        await setReminderObject(db, reminder);
        if (isLinkedinProfilePage(reminder.objectId)){

          if (dbDataSanitizer.preSanitize(reminder.object.fullName).toLowerCase().indexOf(this.state.text.toLowerCase()) != -1){
            reminders.push(reminder);
          }

        }
        else{

          const feedPost = reminder.object;
          if (feedPost.author.name && feedPost.author.name.toLowerCase().indexOf(this.state.text.toLowerCase()) != -1){
            reminders.push(reminder);
          }

        }

      }

    }
    catch(error){
      console.error("Error : ", error);
    }

    if (reminders){

      reminders.sort((a, b) => {
        if (new Date(a.date) < new Date(b.date)){
          return 1;
        }
        else if (new Date(a.date) > new Date(b.date)){
          return -1;
        }
        else{
          return 0;
        }
      });
      
      eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "reminderList", value: {list: reminders, action: "search", text: this.state.text }});
    }

  }

  async searchPosts(selection = null){

    // in order to show the spinner 
    eventBus.dispatch(eventBus.SET_MATCHING_POSTS_DATA, null);

    var posts = [];

    try{

      const relatedFeedProfileIds = (await db.feedProfiles
                                             .filter(p => p.name.toLowerCase().includes(this.state.text.toLowerCase()))
                                             .toArray())
                                             .map(p => p.uniqueId);

      var matchingPosts = await db.feedPosts
                                  .filter(feedPost => (feedPost.text.toLowerCase().includes(this.state.text.toLowerCase()))
                                                        || relatedFeedProfileIds.includes(feedPost.profileId))
                                  .toArray();

      var feedPostViews = [];
      for (const post of matchingPosts){

        var lastView = await db.feedPostViews
                                  .where({feedPostId: post.uniqueId})
                                  .last();

        if (!lastView){
          const feedPost = await db.feedPosts.where({linkedPostId: post.uniqueId}).first();
          lastView = await db.feedPostViews.where({feedPostId: feedPost.uniqueId}).last();
        }

        feedPostViews.push(lastView);

        posts.push({
          author: post.profile,
          url: post.htmlElId 
                  ? `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${post.htmlElId}`
                  : (lastView
                      ? `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${lastView.htmlElId}`
                      : null),
          date: lastView.date,
          text: post.innerContentHtml,
          initiator: lastView.profile,
        });

      }

      if (selection == "media_only"){
        eventBus.dispatch(eventBus.SET_MATCHING_POSTS_DATA, {searchText: this.state.text, results: feedPostViews});
        return;
      }

      matchingPosts = [];
      await db.visits
              .filter(visit => Object.hasOwn(visit, "profileData"))
              .each(visit => {
                if (visit.profileData.activity){
                  for (var activity of visit.profileData.activity){
                    if (dbDataSanitizer.preSanitize(activity.title).toLowerCase().indexOf(this.state.text.toLowerCase()) != -1
                          && !(matchingPosts.filter(p => dbDataSanitizer.preSanitize(p.title) == dbDataSanitizer.preSanitize(activity.title)).length)){
                      activity.date = visit.date;
                      activity.profile = { url: visit.url };
                      matchingPosts.push(activity);
                    }

                  }

                }
              });

      var profiles = [];
      for (var post of matchingPosts){
        
        // checking in the activities already saved, to retrieve a similar profile to match
        const index = profiles.map(p => p.url).indexOf(post.profile.url);
        var profile = null;
        if (index != -1){
          profile = profiles[index];
        }
        else{
          profile = await getProfileDataFrom(db, post.profile.url);
          profiles.push(post.profile);
        }

        posts.push({
          initiator: {
            picture: profile.avatar,
            name: profile.fullName,
          },
          url: post.url,
          date: post.date,
          text: post.title,
        });
      }       

    }
    catch(error){
      console.error("Error : ", error);
    }

    posts.sort((a, b) => {
      if (new Date(a.date) < new Date(b.date)){
        return 1;
      }
      else if (new Date(a.date) > new Date(b.date)){
        return -1;
      }
      else{
        return 0;
      }
    });   

    this.props.searchTextChanged({searchText: this.state.text, results: posts});

  }

  async searchProfiles(){

    var visits = null;
    try{

      var urls = [];
      await db.visits
              .filter(visit =>  Object.hasOwn(visit, "profileData") 
                                  && visit.profileData.fullName
                                  && (dbDataSanitizer.preSanitize(visit.profileData.fullName).toLowerCase().indexOf(this.state.text.toLowerCase()) != -1))
              .each(visit => {
                if (urls.indexOf(visit.url) == -1){
                  urls.push(visit.url);
                }
              });

      for (var url of urls){

        var profile = await getProfileDataFrom(db, url);

        if (dbDataSanitizer.preSanitize(profile.fullName).toLowerCase().indexOf(this.state.text.toLowerCase()) != -1){

          profile.fullName = this.highlightSearchText(profile.fullName);
          visits = visits ? visits : [];

          var profileVisits = await db.visits
                                  .where("url")
                                  .anyOf(allUrlCombinationsOf(url))
                                  .sortBy("date");

          profileVisits = profileVisits.map(visit => {
            visit.profileData = profile;
            return visit;
          });

          visits = visits.concat(profileVisits);
        }

      }

    }
    catch(error){
      console.error("Error : ", error);
    }

    if (visits){

      visits.sort((a, b) => new Date(b.date) - new Date(a.date));
      eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "homeAllVisitsList", value: {list: visits, action: "search", text: this.state.text }});

    }

  }

  getInputPlaceholder(){

    var label = null;

    switch(this.props.objectStoreName){
      case dbData.objectStoreNames.VISITS:{
        label = "profile";
        break;
      }
      case dbData.objectStoreNames.REMINDERS:{
        label = "reminder";
        break;
      }
      case "posts":{
        label = "post";
        break;
      }
      case "media":{
        label = "media";
        break;
      }
      case "feed_profiles":{
        label = "profile";
        break;
      }
      case "quotes":{
        label = "quote";
        break;
      }
    }

    return `Search a ${label} ...`;

  }

  render(){
    return (
		<>
			<div class="px-1 my-2">
			  <div class="input-group mb-3 input-group-sm shadow">
			    <input 
            type="text" 
            class="form-control" 
            placeholder={this.getInputPlaceholder()} 
            aria-label="Search" 
            aria-describedby="basic-addon2" 
            onChange={this.handleInputChange} 
            onKeyDown={this.handleKeyDown} 
            // value={this.props.text ? this.props.text : null}
            />
			    <span 
            class="input-group-text handy-cursor text-muted" 
            id="basic-addon2" 
            onClick={this.searchText} 
            title="search">
			      <SearchIcon size="20" />
			    </span>
			  </div>
			</div>
		</>
    );
  }
}
