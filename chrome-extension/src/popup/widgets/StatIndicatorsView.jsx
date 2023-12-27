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

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.indicators != this.props.indicators){

      if (prevProps.indicators.timeSpent != this.props.indicators.timeSpent){
        this.setState(prevState => {
          let indicatorData = Object.assign({}, prevState.indicatorData);
          indicatorData.timeSpentData.value = secondsToHms(this.props.indicators.timeSpent);
          return { indicatorData };
        });
      }

      if (prevProps.indicators.profileCount != this.props.indicators.profileCount){
        this.setState(prevState => {
          let indicatorData = Object.assign({}, prevState.indicatorData);
          indicatorData.profileData.value = this.props.indicators.profileCount;
          return { indicatorData };
        });
      }

      if (prevProps.indicators.searchCount != this.props.indicators.searchCount){
        this.setState(prevState => {
          let indicatorData = Object.assign({}, prevState.indicatorData);
          indicatorData.searchData.value = this.props.indicators.searchCount;
          return { indicatorData };
        });
      }

      if (prevProps.indicators.profileActivityCount != this.props.indicators.profileActivityCount){
        this.setState(prevState => {
          let indicatorData = Object.assign({}, prevState.indicatorData);
          indicatorData.profileActivityData.value = this.props.indicators.profileActivityCount;
          return { indicatorData };
        });
      }

    }

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
