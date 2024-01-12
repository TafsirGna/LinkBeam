/*import './StatIndicatorsView.css'*/
import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import hourglass_icon from '../../assets/hourglass_icon.png';
import search_icon from '../../assets/search_icon.png';
import news_icon from '../../assets/newspaper_icon.png';
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
      PROFILES_ACTIVITY_LABEL = "Profiles' Activity",
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
        <div type="button" class="btn shadow-sm col mx-2 mt-3 fw-light text-start">
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
        profileActivityData: {
          label: PROFILES_ACTIVITY_LABEL,
          value: 0,
          color: "text-primary",
          icon: news_icon,
        },
      },
      // indicatorStyles: [

      // ],
    };

    this.setSearchData = this.setSearchData.bind(this);
    this.setProfileData = this.setProfileData.bind(this);
    this.setTimeSpentData = this.setTimeSpentData.bind(this);
    this.setProfileActivityData = this.setProfileActivityData.bind(this);

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){

      this.setProfileData();

      this.setSearchData();

      this.setTimeSpentData();

      this.setProfileActivityData();

    }

  }

  setProfileData(){

    if (!this.props.objects){
      return;
    }

    var profiles = [];
    for (var search of this.props.objects){
      var index = profiles.map(e => e.url).indexOf(search.url);
      if (index == -1){
        profiles.push(search.profile);
      }
    }

    this.setState(prevState => {
      let indicatorData = Object.assign({}, prevState.indicatorData);
      indicatorData.profileData.value = profiles.length;
      return { indicatorData };
    });
  }

  setSearchData(){

    if (!this.props.objects){
      return;
    }

    this.setState(prevState => {
      let indicatorData = Object.assign({}, prevState.indicatorData);
      indicatorData.searchData.value = this.props.objects.length;
      return { indicatorData };
    });
  }

  setTimeSpentData(){

    if (!this.props.objects){
      return;
    }

    var time = 0;
    for (var search of this.props.objects){
      time += search.timeCount;
    }

    this.setState(prevState => {
      let indicatorData = Object.assign({}, prevState.indicatorData);
      indicatorData.timeSpentData.value = secondsToHms(time);
      return { indicatorData };
    });
  }

  setProfileActivityData(){

    if (!this.props.objects){
      return;
    }

    var count = 0;
    for (var search of this.props.objects){
      count += (search.profile.activity ? search.profile.activity.length : 0);
    }

    this.setState(prevState => {
      let indicatorData = Object.assign({}, prevState.indicatorData);
      indicatorData.profileActivityData.value = count;
      return { indicatorData };
    });
  }

  componentWillUnmount(){

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
