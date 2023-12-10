/*import './StatIndicatorsView.css'*/
import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import hourglass_icon from '../../assets/hourglass_icon.png';
import search_icon from '../../assets/search_icon.png';
import news_icon from '../../assets/news_icon.png';
import default_user_icon from '../../assets/user_icons/default.png';
import { 
  sendDatabaseActionMessage,
  ack,
  startMessageListener, 
  messageParams,
  dbData, 
  secondsToHms,
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
        <div type="button" class="btn shadow-sm col mx-2 mt-3 text-muted fw-light text-start border">
          <h6 class={"ms-3 my-0 " + this.props.object.color}>
            <img src={this.props.object.icon} alt="twbs" width="15" height="15" class="me-2 shadow-lg"/>
            {this.props.object.value}
          </h6>
          <p class="ms-3 my-0 small">{this.props.object.label}</p>
        </div>
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
          value: 0,
          color: "text-warning",
          icon: default_user_icon,
        },
        searchData: {
          label: SEARCH_LABEL,
          value: 0,
          color: "text-success",
          icon: search_icon,
        },
        timeSpentData: {
          label: TIME_SPENT_LABEL,
          value: 0,
          color: "text-secondary",
          icon: hourglass_icon,
        },
        newsData: {
          label: PROFILES_NEWS_LABEL,
          value: 0,
          color: "text-primary",
          icon: news_icon,
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
          // indicatorData.timeSpentData.value = timeCount.value.toFixed(2) + "s";
          indicatorData.timeSpentData.value = secondsToHms(timeCount.value);
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
      indicatorData.profileData.value = profileCount;
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
      indicatorData.searchData.value = searchCount;
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
