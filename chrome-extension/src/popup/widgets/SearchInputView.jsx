/*import './SearchInputView.css'*/
import React from 'react';
import moment from 'moment';
import default_user_icon from '../../assets/user_icons/default.png';
import { Link } from 'react-router-dom';
import { 
  sendDatabaseActionMessage,
  ack,
  startMessageListener, 
  messageParams,
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

  searchText(){

    if (this.state.text.length == 0){
      return;
    }

  	sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, this.props.objectStoreName, {searchText: this.state.text, context: [appParams.COMPONENT_CONTEXT_NAMES.ACTIVITY, "search"].join("-")});

  }

  render(){
    return (
		<>
			<div class="px-1 my-2">
			  <div class="input-group mb-3 input-group-sm shadow">
			    <input type="text" class="form-control" placeholder="Search..." aria-label="Search" aria-describedby="basic-addon2" onChange={this.handleInputChange}/>
			    <span class="input-group-text handy-cursor text-muted" id="basic-addon2" onClick={() => {this.searchText()}}>
			      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
			    </span>
			  </div>
			</div>
		</>
    );
  }
}
