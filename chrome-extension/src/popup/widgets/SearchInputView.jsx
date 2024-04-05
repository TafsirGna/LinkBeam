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
import moment from 'moment';
import default_user_icon from '../../assets/user_icons/default.png';
import { SearchIcon } from './SVGs';
import eventBus from "../EventBus";
import { 
  appParams,
  dbData,
  setGlobalDataReminders,
  setGlobalDataHomeAllVisitsList,
  getProfileDataFrom,
} from "../Local_library";
import { db } from "../../db";

export default class SearchInputView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    	text: "",
    };

    this.handleInputChange = this.handleInputChange.bind(this);
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
      }

      return;
      
    }

    // if the given search text is not empty then

    const highlightSearchText = (propValue) => {

      const index = propValue.toLowerCase().indexOf(this.state.text.toLowerCase());
      var result = propValue.slice(0, index)
      result += `<span class="border rounded shadow-sm bg-info-subtle text-muted border-primary">${propValue.slice(index, (index + this.state.text.length))}</span>`;
      result += propValue.slice((index + this.state.text.length));

      return result;

    }

    switch(this.props.objectStoreName){

      case dbData.objectStoreNames.VISITS:{

        (async () => {

          var visits = null;
          try{

            var urls = [];
            await db.visits
                    .filter(visit =>  Object.hasOwn(visit, "profileData") 
                                        && visit.profileData.fullName
                                        && (visit.profileData.fullName.toLowerCase().indexOf(this.state.text.toLowerCase()) != -1))
                    .each(visit => {
                      if (urls.indexOf(visit.url) == -1){
                        urls.push(visit.url);
                      }
                    });

            for (var url of urls){

              var profileVisits = await db.visits
                                            .where("url")
                                            .equals(url)
                                            .sortBy("date");

              const profile = getProfileDataFrom(profileVisits);

              if (profile.fullName.toLowerCase().indexOf(this.state.text.toLowerCase()) != -1){

                profile.fullName = highlightSearchText(profile.fullName);
                visits = visits ? visits : [];

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

        })();

        break;
      }

      case dbData.objectStoreNames.REMINDERS:{

        (async () => {

          var reminders = null;

          try{

            reminders = await db.reminders
                                    .filter(reminder => (reminder.text.toLowerCase().indexOf(this.state.text.toLowerCase()) != -1))
                                    .toArray();

            reminders.forEach(async (reminder) => {

                try{

                  const visits = await db.visits
                                         .where("url")
                                         .equals(reminder.url)
                                         .sortBy("date");

                  const profile = getProfileDataFrom(visits);
                  reminder.profile = profile;

                  reminder.text = highlightSearchText(reminder.text);

                }
                catch(error){
                  console.log("Error : ", error);
                }
                
              }
            );

          }
          catch(error){
            console.error("Error : ", error);
          }

          if (reminders){
            eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "reminderList", value: {list: reminders, action: "search", text: this.state.text }});
          }

        })();

        break;
      }
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
