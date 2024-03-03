/*import './SearchInputView.css'*/
import React from 'react';
import moment from 'moment';
import default_user_icon from '../../assets/user_icons/default.png';
import { SearchIcon } from './SVGs';
import { Link } from 'react-router-dom';
import eventBus from "../EventBus";
import { 
  sendDatabaseActionMessage,
  ack,
  startMessageListener, 
  messageParams,
  appParams,
  dbData,
} from "../Local_library";

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

    if (this.state.text.length == 0){

      switch(this.props.objectStoreName){
        case dbData.objectStoreNames.PROFILES:{
          eventBus.dispatch(eventBus.EMPTY_SEARCH_TEXT_VISIT, null);
          return;
          break;
        }

        case dbData.objectStoreNames.REMINDERS:{
          eventBus.dispatch(eventBus.EMPTY_SEARCH_TEXT_REMINDER, null);
          return;
          break;
        }
      }
      
    }


    var props = null;
    switch(this.props.objectStoreName){
      case dbData.objectStoreNames.PROFILES:{
        props = { fullName: this.state.text };
        break;
      }

      case dbData.objectStoreNames.REMINDERS:{
        props = { text: this.state.text };
        break;
      }
    }

  	sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, this.props.objectStoreName, { context: [this.props.context, "search"].join("-"), criteria: { props: props}});

  }

  render(){
    return (
		<>
			<div class="px-1 my-2">
			  <div class="input-group mb-3 input-group-sm shadow">
			    <input type="text" class="form-control" placeholder="Search a profile..." aria-label="Search" aria-describedby="basic-addon2" onChange={this.handleInputChange} onKeyDown={this.handleKeyDown}/>
			    <span class="input-group-text handy-cursor text-muted" id="basic-addon2" onClick={() => {this.searchText()}} title="search">
			      <SearchIcon size="20" />
			    </span>
			  </div>
			</div>
		</>
    );
  }
}
