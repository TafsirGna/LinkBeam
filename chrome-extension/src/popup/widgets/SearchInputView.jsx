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

          break;
        }

        case dbData.objectStoreNames.REMINDERS:{

          if (this.props.globalData.reminderList && this.props.globalData.reminderList.action == "search"){

            (async () => {

              const reminders = await db.reminders.toArray();

              await Promise.all (reminders.map (async reminder => {
                [reminder.profile] = await Promise.all([
                  db.profiles.where('url').equals(reminder.url).first()
                ]);
              }));

              eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "reminderList", value: {list: reminders, action: "all" }});

            })();

          }

          break;
        }
      }

      return;
      
    }

    // if the given search text is not empty then

    switch(this.props.objectStoreName){
      case dbData.objectStoreNames.PROFILES:{
        break;
      }

      case dbData.objectStoreNames.REMINDERS:{

        (async () => {

          const reminders = await db.reminders
                                    .filter(reminder => (reminder.text.toLowerCase().indexOf(this.state.text.toLowerCase()) != -1));

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
			    <span class="input-group-text handy-cursor text-muted" id="basic-addon2" onClick={() => {this.searchText()}} title="search">
			      <SearchIcon size="20" />
			    </span>
			  </div>
			</div>
		</>
    );
  }
}
