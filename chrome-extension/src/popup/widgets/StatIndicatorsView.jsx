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

const PROFILE_LABEL = "Profiles",
      TIME_SPENT_LABEL = "Time spent",
      PROFILES_NEWS_LABEL = "Profiles' News",
      SEARCH_LABEL = "Searches";


class IndicatorWidget extends React.Component {

  constructor(props){
    super(props);
    this.state = {

    }
  }

  render() {
    return (
      <>
        <button type="button" class="btn shadow col mx-2 mt-3 text-muted fw-light text-start">
          <h4 class={"ms-3 my-0 " + this.props.object.color}>{this.props.object.count}</h4>
          <p class="ms-3 my-0 small">{this.props.object.label}</p>
        </button>
      </>
    );
  }
}


export default class StatIndicatorsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      indicatorData: {
        profileData: {
          label: PROFILE_LABEL,
          count: 0,
          color: "text-warning",
        },
        searchData: {
          label: SEARCH_LABEL,
          count: 0,
          color: "text-success",
        },
        timeSpentData: {
          label: TIME_SPENT_LABEL,
          count: 0,
          color: "text-secondary",
        },
        newsData: {
          label: PROFILES_NEWS_LABEL,
          count: 0,
          color: "text-primary",
        },
      },
      // indicatorStyles: [

      // ],
    };

    this.onProfilesDataReceived = this.onProfilesDataReceived.bind(this);
    this.onSearchesDataReceived = this.onSearchesDataReceived.bind(this);
    this.onTimeDataReceived = this.onTimeDataReceived.bind(this);
    this.onProfileNewsDataReceived = this.onProfileNewsDataReceived.bind(this);

  }

  componentDidMount() {

    this.listenToMessages();

    this.getProfileCount();

    this.getSearchCount();

    this.getProfileNewsCount();

    this.getTimeSpent();

  }

  componentDidUpdate(prevProps, prevState){

  }

  seeMoreVisibilityHandler(){

  }

  componentWillUnmount(){

  }

  getTimeSpent(){

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["timeCount"]);

  }

  getProfileNewsCount(){

    
    
  }

  getProfileCount(){

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_COUNT, dbData.objectStoreNames.PROFILES, null);

  }

  getSearchCount(){

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_COUNT, dbData.objectStoreNames.SEARCHES, null);

  }

  onProfileNewsDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

  }

  onTimeDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    switch(message.data.objectData.property){
      case "timeCount": {
        var timeCount = message.data.objectData.value;
        this.setState(prevState => {
          let indicatorData = Object.assign({}, prevState.indicatorData);
          indicatorData.timeSpentData.count = timeCount.value.toFixed(2) + "s";
          return { indicatorData };
        }); 
        break;
      }         
    }
    
  }

  onProfilesDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    var profileCount = message.data.objectData;

    this.setState(prevState => {
      let indicatorData = Object.assign({}, prevState.indicatorData);
      indicatorData.profileData.count = profileCount;
      return { indicatorData };
    }); 

  }

  onSearchesDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    var searchCount = message.data.objectData;

    this.setState(prevState => {
      let indicatorData = Object.assign({}, prevState.indicatorData);
      indicatorData.searchData.count = searchCount;
      return { indicatorData };
    }); 

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
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.SETTINGS].join(messageParams.separator), 
        callback: this.onTimeDataReceived
      }
    ]);

  }

  render(){
    return (
      <>
        <div class="row mx-4 my-3">

          { Object.keys(this.state.indicatorData).map((key) => 
              <IndicatorWidget object={this.state.indicatorData[key]} />
            )}

        </div>
      </>
    );
  }
}
