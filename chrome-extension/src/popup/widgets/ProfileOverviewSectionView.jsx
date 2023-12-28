/*import './HomeMenu.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { computeExperienceTime } from "../Local_library";
import LanguageListModal from "./modals/LanguageListModal";
import SunBurstOverviewChart from "./charts/SunBurstOverviewChart";

export default class ProfileOverviewSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      languageListModalShow: false,
    };
  }

  handleLanguageListModalClose = () => this.setState({languageListModalShow: false});
  handleLanguageListModalShow = () => this.setState({languageListModalShow: true});

  componentDidMount() {

    var experienceTime = computeExperienceTime(this.props.profile.experience);

  }

  render(){
    return (
      <>
        <div class="row mx-2 mt-3">
          <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {}}>
            <div class="card-body">
              <h5 class="card-title">0</h5>
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
