/*import './SearchInputView.css'*/
import React from 'react';
import moment from 'moment';
import default_user_icon from '../../assets/user_icons/default.png';
import { SearchIcon } from './SVGs';
import { Link } from 'react-router-dom';
import eventBus from "../EventBus";
import { 
  appParams,
  dbData,
  setGlobalDataReminders,
  setGlobalDataHomeAllVisitsList,
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
        case dbData.objectStoreNames.PROFILES:{

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

    switch(this.props.objectStoreName){
      case dbData.objectStoreNames.PROFILES:{

        const highlightSearchText = (profile) => {

          const index = profile.fullName.toLowerCase().indexOf(this.state.text.toLowerCase());
          var fullName = profile.fullName.slice(0, index)
          fullName += `<span class="border rounded shadow-sm bg-info-subtle text-muted border-primary">${profile.fullName.slice(index, (index + this.state.text.length))}</span>`;
          fullName += profile.fullName.slice((index + this.state.text.length));
          profile.fullName = fullName;

        }

        (async () => {

          var urls = [];
          await db.profiles
                  .filter(profile => (profile.fullName.toLowerCase().indexOf(this.state.text.toLowerCase()) != -1))
                  .each(profile => {
                    urls.push(profile.url);
                  });

          const visits = await db.visits
                                 .where("url")
                                 .anyOf(urls)
                                 .toArray();

          await Promise.all (visits.map (async visit => {
            [visit.profile] = await Promise.all([
              db.profiles.where('url').equals(visit.url).first()
            ]);
            // highlighting the search text in the profile fullName property
            highlightSearchText(visit.profile);
          }));

          eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "homeAllVisitsList", value: {list: visits, action: "search", text: this.state.text }});

        })();

        break;
      }

      case dbData.objectStoreNames.REMINDERS:{

        (async () => {

          const reminders = await db.reminders
                                    .filter(reminder => (reminder.text.toLowerCase().indexOf(this.state.text.toLowerCase()) != -1))
                                    toArray();

          eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "reminderList", value: {list: reminders, action: "search", text: this.state.text }});

        })();

        break;
      }
    }

  }

  getInputPlaceholder(){

    var label = null;

    switch(this.props.objectStoreName){
      case dbData.objectStoreNames.PROFILES:{
        label = "profile";
        break;
      }

      case dbData.objectStoreNames.REMINDERS:{
        label = "reminder";
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
            onClick={() => {this.searchText()}} 
            title="search">
			      <SearchIcon size="20" />
			    </span>
			  </div>
			</div>
		</>
    );
  }
}
