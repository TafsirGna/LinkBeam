/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import { LockIcon, GithubIcon, SendIcon, TagIcon } from "./widgets/SVGs";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  appParams,
  setGlobalDataSettings,
  getChartColors,
  getVisitsPostCount,
  getVisitsTotalTime,
} from "./Local_library";
import PageTitleView from "./widgets/PageTitleView";
import Form from 'react-bootstrap/Form';
import moment from 'moment';
import { db } from "../db";
import eventBus from "./EventBus";
import { AlertCircleIcon } from "./widgets/SVGs";
import AllPostsModal from "./widgets/modals/AllPostsModal";
import FeedItemCategoryDonutChart from "./widgets/charts/FeedItemCategoryDonutChart";
import FeedMetricsLineChart from "./widgets/charts/FeedMetricsLineChart";
import FeedScatterPlot from "./widgets/charts/FeedScatterPlot";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { liveQuery } from "dexie"; 

function betweenRange(lower, upper, date){
  return (new Date(lower) <= new Date(date) && new Date(date) <= new Date(upper));
}

export default class FeedDashView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      startDate: (new Date()).toISOString().split('T')[0],
      endDate: (new Date()).toISOString().split('T')[0],
      visits: null,
      feedPosts: null,
      allPostsModalShow: false,
      chartModalShow: false,
      chartModalTitle: "",
    };

    this.handleStartDateInputChange = this.handleStartDateInputChange.bind(this);
    this.handleEndDateInputChange = this.handleEndDateInputChange.bind(this);
    this.setVisits = this.setVisits.bind(this);
    this.setFeedPosts = this.setFeedPosts.bind(this);

  }

  componentDidMount() {

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

    const urlParams = new URLSearchParams(window.location.search);
    var date = urlParams.get("data");

    if (date){

      try {
        date = JSON.parse(date);
        this.setState({startDate: date.from.split("T")[0], endDate: date.to.split("T")[0]});
      } catch (error) {
        console.error('Error while retrieving date: ', error);
      }

    }
    else{

      this.setVisits();

      this.setFeedPosts();

    }

  }

  handleAllPostsModalClose = () => this.setState({allPostsModalShow: false});
  handleAllPostsModalShow = () => this.setState({allPostsModalShow: true});

  handleChartModalClose = () => this.setState({chartModalShow: false});
  handleChartModalShow = (chartModalTitle) => this.setState({chartModalShow: true, chartModalTitle: chartModalTitle});

  componentDidUpdate(prevProps, prevState){
   
    if ((prevState.startDate != this.state.startDate) || (prevState.endDate != this.state.endDate)){

      this.setVisits();

      this.setFeedPosts();

    }

  }

  async setVisits(){

    const visits = await db.visits
                           .filter(visit => betweenRange(this.state.startDate, this.state.endDate, visit.date)
                                            && visit.url.indexOf("/feed") != -1)
                           .toArray();

    this.setState({ visits: visits });

  }

  async setFeedPosts(){

    const feedPosts = await db.feedPosts
                              .filter(post => betweenRange(this.state.startDate, this.state.endDate, post.replicas[post.dates.length - 1]))
                              .offset(0)
                              .limit(5)
                              .toArray(); 

    this.setState({feedPosts: feedPosts});

  }

  handleStartDateInputChange(event){

    this.setState({startDate: event.target.value});

  }

  handleEndDateInputChange(event){

    this.setState({endDate: event.target.value});

  }

  render(){
    return (
      <>
        <div class="mt-5 pb-5 pt-3">

          	<div class="text-center">
	            <img src={app_logo}  alt="" width="40" height="40"/>
	            <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.FEED_DASHBOARD}/>
          	</div>

  			<div class="offset-2 col-8 mt-4">

          <div class="clearfix m-3 small my-4">
            <div class="d-flex flex-row-reverse align-items-center ">
              <Form.Control
                type="date"
                autoFocus
                min={this.state.startDate}
                max={new Date().toISOString().slice(0, 10)}
                value={this.state.endDate}
                onChange={this.handleEndDateInputChange}
                className="shadow-sm w-25 mx-2 d-inline"
                size="sm"
              />
              to
              <Form.Control
                type="date"
                autoFocus
                min={this.props.globalData.settings ? this.props.globalData.settings.lastDataResetDate.split("T")[0] : new Date().toISOString().split("T")[0]}
                max={this.state.endDate}
                value={this.state.startDate}
                onChange={this.handleStartDateInputChange}
                className="shadow-sm w-25 mx-2 d-inline"
                size="sm"
              />
              From              
            </div>
          </div>

          <div class="row mx-2 mt-1">
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {this.handleChartModalShow("Total time")}}>
              <div class="card-body">
                {this.state.visits && <h6 class="card-title text-primary-emphasis">~{`${getVisitsTotalTime(this.state.visits)} mins`}</h6>}
                <p class="card-text mb-1">Total time spent</p>
                <div><span class="badge text-bg-secondary fst-italic shadow-sm">Show</span></div>
              </div>
            </div>
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {this.handleChartModalShow("Visit Count")}}>
              <div class="card-body">
                {this.state.visits && <h6 class="card-title text-danger-emphasis">{this.state.visits.length}</h6>}
                <p class="card-text mb-1">Visits</p>
                <div><span class="badge text-bg-secondary fst-italic shadow-sm">Show</span></div>
              </div>
            </div>
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {this.handleChartModalShow("Post Count")}}>
              <div class="card-body">
                {this.state.visits && <h6 class="card-title text-warning-emphasis">~{getVisitsPostCount(this.state.visits)}</h6>}
                <p class="card-text mb-1">Posts</p>
                <div><span class="badge text-bg-secondary fst-italic shadow-sm">Show</span></div>
              </div>
            </div>
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {this.handleChartModalShow("Mean time")}}>
              <div class="card-body">
                {this.state.visits && <h6 class="card-title text-info-emphasis">~{this.state.visits.length ? `${(getVisitsTotalTime(this.state.visits)/this.state.visits.length).toFixed(2)} mins` : "0 mins"}</h6>}
                <p class="card-text mb-1">Mean time per visit</p>
                <div><span class="badge text-bg-secondary fst-italic shadow-sm">Show</span></div>
              </div>
            </div>
          </div>

          <div class="row mx-3 gap-2 d-flex">
            <div class="col p-0">
              <div class="border rounded shadow">
                <FeedScatterPlot
                  objects={this.state.visits}/>
              </div>
            </div>
            <div class="col border rounded shadow py-3">
              <FeedItemCategoryDonutChart 
                objects={this.state.visits}/>
            </div>
          </div>

          <div class="my-3 p-3 bg-body rounded shadow border mx-3">
            <h6 class="border-bottom pb-2 mb-0">Posts</h6>

            { !this.state.feedPosts && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                  </div>
                </div>}

            { this.state.feedPosts 
              && <>
                {this.state.feedPosts.length == 0
                  && <div class="text-center m-5">
                        <AlertCircleIcon size="100" className="text-muted"/>
                        <p><span class="badge text-bg-primary fst-italic shadow">No posts yet</span></p>
                      </div>}

                { this.state.feedPosts.length  != 0
                    && <div>
                        { this.state.feedPosts.map(((post, index) => <div class="d-flex text-body-secondary pt-3">
                                                                          <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#007bff"></rect><text x="50%" y="50%" fill="#007bff" dy=".3em">32x32</text></svg>
                                                                          <p class="pb-3 mb-0 small lh-sm border-bottom">
                                                                            <strong class="d-block text-gray-dark">@username</strong>
                                                                            Some representative placeholder content, with some information about this user. Imagine this being some sort of status update, perhaps?
                                                                          </p>
                                                                        </div>))}
                        <small class="d-block text-end mt-3 fst-italic">
                          <a href="#" onClick={this.handleAllPostsModalShow}>All posts</a>
                        </small>
                      </div>}
                </>}

          </div>

  			</div>

  		</div>


      {/*Modals*/}

      <AllPostsModal 
        startDdate={this.state.startDate}
        endDate={this.state.endDate}
        show={this.state.allPostsModalShow}
        onHide={this.handleAllPostsModalClose}/>


      <Modal show={this.state.chartModalShow} onHide={this.handleChartModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>{this.state.chartModalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <FeedMetricsLineChart
              objects={this.state.visits}
              metric={this.state.chartModalTitle}/>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleChartModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </>
    );
  }
}
