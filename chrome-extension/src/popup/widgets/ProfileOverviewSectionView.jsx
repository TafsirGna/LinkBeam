/*import './HomeMenu.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { computeExperienceTime } from "../Local_library";
import LanguageListModal from "./modals/LanguageListModal";
import SunBurstOverviewChart from "./charts/SunBurstOverviewChart";
import moment from 'moment';

export default class ProfileOverviewSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      languageListModalShow: false,
      experienceTime: 0,
    };
  }

  handleLanguageListModalClose = () => this.setState({languageListModalShow: false});
  handleLanguageListModalShow = () => this.setState({languageListModalShow: true});

  componentDidMount() {

    var experienceTime = computeExperienceTime(this.props.profile.experience, {moment: moment});
    experienceTime = Math.ceil(experienceTime / (1000 * 60 * 60 * 24)) // diff days

    var y = Math.floor(experienceTime / 365);
    var m = Math.floor(experienceTime % 365 / 30);
    var d = Math.floor(experienceTime % 365 % 30);

    var yDisplay = y > 0 ? y + (y == 1 ? " year, " : " years, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " month, " : " months, ") : "";
    var dDisplay = d > 0 ? d + (d == 1 ? " day" : " days") : "";

    this.setState({experienceTime: yDisplay + mDisplay/* + dDisplay*/});

  }

  render(){
    return (
      <>
        <div class="row mx-2 mt-3">
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {}}>
            <div class="card-body">
              <h6 class="card-title">{this.state.experienceTime}</h6>
              <p class="card-text">Experience length</p>
            </div>
          </div>
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {}}>
            <div class="card-body">
              <h5 class="card-title">0</h5>
              <p class="card-text">Education length</p>
            </div>
          </div>
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {this.handleLanguageListModalShow()}}>
            <div class="card-body">
              <h5 class="card-title">0</h5>
              <p class="card-text">Languages</p>
            </div>
          </div>
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {}}>
            <div class="card-body">
              <h5 class="card-title">0</h5>
              <p class="card-text">Projects</p>
            </div>
          </div>
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {}}>
            <div class="card-body">
              <h5 class="card-title">0</h5>
              <p class="card-text">Certifications</p>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <SunBurstOverviewChart objects={[]} />
        </div>

        <LanguageListModal profile={this.props.profile} show={this.state.languageListModalShow} onHide={this.handleLanguageListModalClose}/>
      </>
    );
  }
}
