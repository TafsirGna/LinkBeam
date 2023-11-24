/*import './StatIndicatorsView.css'*/
import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { 
  saveCurrentPageTitle, 
  sendDatabaseActionMessage,
  ack,
  startMessageListener, 
  messageParams,
  dbData, 
} from "../Local_library";

export default class StatIndicatorsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profileCount: 0,
      searchCount: 0,
    };

    this.onProfilesDataReceived = this.onProfilesDataReceived.bind(this);
    this.onSearchesDataReceived = this.onSearchesDataReceived.bind(this);

  }

  componentDidMount() {

    this.listenToMessages();

    this.getProfileCount();

    this.getSearchCount();

  }

  componentDidUpdate(prevProps, prevState){

  }

  seeMoreVisibilityHandler(){

  }

  componentWillUnmount(){

  }

  getProfileCount(){

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_COUNT, dbData.objectStoreNames.PROFILES, null);

  }

  getSearchCount(){

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_COUNT, dbData.objectStoreNames.SEARCHES, null);

  }

  onProfilesDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    var profileCount = message.data.objectData;
    this.setState({profileCount: profileCount});

  }

  onSearchesDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    var searchCount = message.data.objectData;
    this.setState({searchCount: searchCount});

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_COUNT, dbData.objectStoreNames.PROFILES].join(messageParams.separator), 
        callback: this.onProfilesDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_COUNT, dbData.objectStoreNames.SEARCHES].join(messageParams.separator), 
        callback: this.onSearchesDataReceived
      },
    ]);

  }

  render(){
    return (
      <>
        <div class="row mx-4 my-3">
          <button type="button" class="btn  shadow col mx-2 text-muted fw-light text-start">
            <h4 class="text-warning ms-3 my-0">{this.state.searchCount}</h4>
            <p class="ms-3 my-0">Searches </p>
            {/*<span class="badge text-bg-warning">{this.state.searchCount}</span>*/}
          </button>
          <button type="button" class="btn shadow col mx-2 text-muted fw-light text-start">
            <h4 class="ms-3 my-0">{this.state.profileCount}</h4>
            <p class="ms-3 my-0">Profiles </p>
            {/*<span class="badge text-bg-secondary">{this.state.profileCount}</span>*/}
          </button>
        </div>
        <div class="row mx-4 my-3">
          <button type="button" class="btn shadow col mx-2 text-muted fw-light text-start">
            <h4 class="text-success ms-3 my-0">{this.state.searchCount}</h4>
            <p class="ms-3 my-0">News </p>
            {/*<span class="badge text-bg-success">{this.state.searchCount}</span>*/}
          </button>
          <button type="button" class="btn shadow col mx-2 text-muted fw-light text-start">
            <h4 class="text-info ms-3 my-0">{this.state.searchCount}</h4>
            <p class="ms-3 my-0">Profiles </p>
            {/*<span class="badge text-bg-info">{this.state.profileCount}</span>*/}
          </button>
        </div>
      </>
    );
  }
}
