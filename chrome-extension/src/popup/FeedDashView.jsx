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
import {   
  LayersIcon ,
  BarChartIcon,
} from "./widgets/SVGs";
import PostViewListItemView from "./widgets/ListItems/PostViewListItemView";
import { 
  appParams,
  setGlobalDataSettings,
  dateBetweenRange,
  getVisitCount,
  getVisitMeanTime,
  getVisitsTotalTime,
  getFeedDashMetricValue,
  groupPeriodFeedPostViewsByHtmlElId,
  getMeanTimeBetweenVisits,
  secondsToHms,
} from "./Local_library";
import { DateTime as LuxonDateTime } from "luxon";
import PageTitleView from "./widgets/PageTitleView";
import Form from 'react-bootstrap/Form';
import { db } from "../db";
import eventBus from "./EventBus";
import { AlertCircleIcon } from "./widgets/SVGs";
import AllPostsModal from "./widgets/Modals/AllPostsModal";
import FeedPostCategoryDonutChart from "./widgets/Charts/FeedPostCategoryDonutChart";
import FeedPostCreatOccurStackedBarChart from "./widgets/Charts/FeedPostCreatOccurStackedBarChart";
import FeedNewPostMeasurementBarChart from "./widgets/Charts/FeedNewPostMeasurementBarChart";
import FeedDashRecurrentProfilesSectionView from "./widgets/FeedDashRecurrentProfilesSectionView";
import FeedDashHashtagsSectionView from "./widgets/FeedDashHashtagsSectionView";
import FeedDashAttentionGrabbersSectionView from "./widgets/FeedDashAttentionGrabbersSectionView";
import FeedMetricsLineChart from "./widgets/Charts/FeedMetricsLineChart";
import FeedVisitsScatterPlot from "./widgets/Charts/FeedVisitsScatterPlot";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { liveQuery } from "dexie"; 
import CustomToast from "./widgets/Toasts/CustomToast";

const subMenuColorsVariants = [
    "secondary",
    "info",
    "success",
    "warning",
  ];

export default class FeedDashView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      startDate: null,
      endDate: null,
      allPeriodFeedPostViews: null,
      allPostsModalShow: false,
      metricLineChartModalTitle: null,
      toastMessage: "",
      toastShow: false,
      activeListIndex: 0,
      hashtagCount: null,
      postStackedBarChartModalShow: false,
    };

    this.handleStartDateInputChange = this.handleStartDateInputChange.bind(this);
    this.handleEndDateInputChange = this.handleEndDateInputChange.bind(this);
    this.addFeedPostViewSubscription = this.addFeedPostViewSubscription.bind(this);
    this.deleteFeedPostViewSubscription = this.deleteFeedPostViewSubscription.bind(this);
    this.setPeriodFeedPostViews = this.setPeriodFeedPostViews.bind(this);
    this.setActiveListIndex = this.setActiveListIndex.bind(this);
    this.setHashtagCount = this.setHashtagCount.bind(this);

  }

  componentDidMount() {

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

    var date = (new URLSearchParams(window.location.search)).get("data"),
        startDate = null,
        endDate = null;

    if (date){

      try {
        date = JSON.parse(date);
        startDate = date.from.split("T")[0];
        endDate = date.to.split("T")[0];
      } catch (error) {
        console.error('Error while retrieving date: ', error);
      }

    }
    else{
        date = new Date().toISOString().split("T")[0];
        startDate = date;
        endDate = date;
    }

    this.setState({startDate: startDate, endDate: endDate});

  }

  componentWillUnmount(){

    this.deleteFeedPostViewSubscription();

  }

  deleteFeedPostViewSubscription(){

    if (this.feedPostViewSubscription) {
      this.feedPostViewSubscription.unsubscribe();
      this.feedPostViewSubscription = null;
    }

  }

  handleAllPostsModalClose = () => this.setState({allPostsModalShow: false});
  handleAllPostsModalShow = () => this.setState({allPostsModalShow: true});

  handleMetricLineChartModalClose = () => this.setState({metricLineChartModalTitle: null});
  handleMetricLineChartModalShow = (metricLineChartModalTitle) => this.setState({metricLineChartModalTitle: metricLineChartModalTitle});

  setHashtagCount(count){
    this.setState({hashtagCount: count});
  }

  componentDidUpdate(prevProps, prevState){
   
    if ((prevState.startDate != this.state.startDate) 
        || (prevState.endDate != this.state.endDate)){

      this.deleteFeedPostViewSubscription();
      this.addFeedPostViewSubscription();

    }

  }

  addFeedPostViewSubscription(){

    this.feedPostViewSubscription = liveQuery(() => db.feedPostViews
                                                      .filter(feedPostView => dateBetweenRange(this.state.startDate, this.state.endDate, feedPostView.date))
                                                      .toArray()).subscribe(
      result => this.setPeriodFeedPostViews(result),
      error => this.setState({error})
    );

  }

  async setPeriodFeedPostViews(feedPostViews){

    var allPeriodFeedPostViews = [],
        visits = [],
        profiles = [],
        feedPosts = [];

    for (var feedPostView of feedPostViews){

      feedPostView.profile = feedPostView.profileId 
                              ? profiles.filter(p => p.uniqueId == feedPostView.profileId)[0] || await db.feedProfiles.where({uniqueId: feedPostView.profileId}).first()
                              : null;

      feedPostView.feedPost = feedPosts.filter(p => p.uniqueId == feedPostView.feedPostId)[0] || await db.feedPosts.where({uniqueId: feedPostView.feedPostId}).first();
      feedPostView.feedPost.profile = profiles.filter(p => p.uniqueId == feedPostView.feedPost.profileId)[0] || await db.feedProfiles.where({uniqueId: feedPostView.feedPost.profileId}).first();
      feedPostView.visit = visits.filter(v => v.uniqueId == feedPostView.visitId)[0] || await db.visits.where({uniqueId: feedPostView.visitId}).first();

      allPeriodFeedPostViews.push({...feedPostView}); // IMPORTANT to duplicate the object

    }

    console.log("cccccccccccc : ", allPeriodFeedPostViews);

    this.setState({allPeriodFeedPostViews: allPeriodFeedPostViews});

  }

  handleStartDateInputChange = (event) => this.setState({startDate: event.target.value});
  handleEndDateInputChange = (event) => this.setState({endDate: event.target.value});

  toggleToastShow = (message = "") => {this.setState((prevState) => ({toastMessage: message, toastShow: !prevState.toastShow}));};

  setActiveListIndex(index){
    this.setState({activeListIndex: index});
  }

  handlePostStackedBarChartModalClose = () => this.setState({postStackedBarChartModalShow: false});
  handlePostStackedBarChartModalShow = () => this.setState({postStackedBarChartModalShow: true})

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
            {/*<div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {this.handleMetricLineChartModalShow("Total time")}}>
              <div class="card-body">
                {this.state.allPeriodFeedPostViews && <h6 class="card-title text-primary-emphasis">~{`${getVisitsTotalTime(this.state.allPeriodFeedPostViews)} mins`}</h6>}
                <p class="card-text mb-1">Total time spent</p>
                <div><span class="badge text-bg-secondary fst-italic shadow-sm">Show</span></div>
              </div>
            </div>*/}
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {this.handleMetricLineChartModalShow("Visit Count")}}>
              <div class="card-body">
                {this.state.allPeriodFeedPostViews && <h6 class="card-title text-danger-emphasis">{getVisitCount(this.state.allPeriodFeedPostViews)}</h6>}
                <p class="card-text mb-1">Visits</p>
                <div><span class="badge text-bg-secondary fst-italic shadow-sm">Show</span></div>
              </div>
            </div>
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {this.handleMetricLineChartModalShow("Post Count")}}>
              <div class="card-body">
                {this.state.allPeriodFeedPostViews && <h6 class="card-title text-warning-emphasis">~{Object.keys(groupPeriodFeedPostViewsByHtmlElId(this.state.allPeriodFeedPostViews)).length}</h6>}
                <p class="card-text mb-1">Posts</p>
                <div><span class="badge text-bg-secondary fst-italic shadow-sm">Show</span></div>
              </div>
            </div>
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {this.handleMetricLineChartModalShow("Mean time")}}>
              <div class="card-body">
                {this.state.allPeriodFeedPostViews && <h6 class="card-title text-info-emphasis">~{`${getVisitMeanTime(this.state.allPeriodFeedPostViews)} mins`}</h6>}
                <p class="card-text mb-1">Mean time per visit</p>
                <div><span class="badge text-bg-secondary fst-italic shadow-sm">Show</span></div>
              </div>
            </div>
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {this.handleMetricLineChartModalShow("Mean time off")}}>
              <div class="card-body">
                {this.state.allPeriodFeedPostViews && <h6 class="card-title text-info-emphasis">~{(() => {
                  const meanTimeBetween = getMeanTimeBetweenVisits(this.state.allPeriodFeedPostViews, LuxonDateTime);
                  return meanTimeBetween == undefined ? "undefined" : /*`${meanTimeBetween} mins`*/ secondsToHms(meanTimeBetween * 60);
                })()}</h6>}
                <p class="card-text mb-1">Mean time between visits</p>
                <div><span class="badge text-bg-secondary fst-italic shadow-sm">Show</span></div>
              </div>
            </div>
          </div>

          <div class="row mx-3 gap-2 d-flex">
            <div class="col p-0">
              <div class="border rounded shadow">
                <FeedVisitsScatterPlot
                  objects={this.state.allPeriodFeedPostViews}
                  globalData={this.props.globalData}/>
              </div>
              <div class="border rounded shadow mt-3">
                <FeedNewPostMeasurementBarChart
                  objects={this.state.allPeriodFeedPostViews}
                  rangeDates={{
                    start: this.state.startDate,
                    end: this.state.endDate,
                  }}/>
              </div>
            </div>
            <div class="col border rounded shadow py-3">
              <FeedPostCategoryDonutChart 
                objects={this.state.allPeriodFeedPostViews}
                rangeDates={{
                  start: this.state.startDate,
                  end: this.state.endDate,
                }}
                  />
            </div>
          </div>

          <div class="mt-4 ms-3">
            {["Posts", 
              "Most recurrent profiles", 
              "Top attention grabbers", 
              "Hashtags"].map((item, index) => (<span 
                                                  class={`me-2 handy-cursor badge bg-${subMenuColorsVariants[index]}-subtle border border-${subMenuColorsVariants[index]}-subtle text-${subMenuColorsVariants[index]}-emphasis ${this.state.activeListIndex == index ? "shadow" : "shadow-sm"}`}
                                                  onClick={() => {this.setActiveListIndex(index)}}>
                                                  {item}

                                                  {/*Display the count*/}
                                                  { index == 3 
                                                    ? (this.state.hashtagCount ? ` (${this.state.hashtagCount})` : null)
                                                    : null}
                                                </span>))}
          </div>

          { this.state.activeListIndex == 0 
              && <div class="my-2 p-3 bg-body rounded shadow border mx-3">
                      <h6 class="border-bottom pb-2 mb-0">
                        Posts
                        <div class="dropdown float-end bd-gray">
                          <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
                            <LayersIcon 
                              size="18" 
                              className="text-muted"/>
                          </div>
                          <ul class="dropdown-menu shadow-lg">
                            <li>
                              <a class="dropdown-item small" href="#" onClick={this.handlePostStackedBarChartModalShow}>
                                <BarChartIcon
                                  size="15"
                                  className="me-2 text-muted"/>
                                Post Creat/Occur bar chart
                                {/*<span class="badge text-bg-danger rounded-pill ms-1 px-1 shadow-sm">In test</span>*/}
                              </a>
                            </li>
                          </ul>
                        </div>

                      </h6>
          
                      { !this.state.allPeriodFeedPostViews && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                                {/*<span class="visually-hidden">Loading...</span>*/}
                              </div>
                              <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                            </div>
                          </div>}
          
                      { this.state.allPeriodFeedPostViews 
                        && <>
                          {this.state.allPeriodFeedPostViews.length == 0
                            && <div class="text-center m-5">
                                  <AlertCircleIcon size="100" className="text-muted"/>
                                  <p><span class="badge text-bg-primary fst-italic shadow">No posts yet</span></p>
                                </div>}
          
                          { this.state.allPeriodFeedPostViews.length != 0
                              && <div>
                                  { Object.entries(groupPeriodFeedPostViewsByHtmlElId(this.state.allPeriodFeedPostViews)).map((([_, feedPostViews], index) => {
                                    return index < 3 
                                            ? <PostViewListItemView  
                                                startDate={this.state.startDate}
                                                endDate={this.state.endDate}
                                                objects={feedPostViews}
                                                globalData={this.props.globalData}/>
                                            : null;
                                  }))}
                                  <small class="d-block text-end mt-3 fst-italic">
                                    <a href="#" onClick={this.handleAllPostsModalShow}>All posts</a>
                                  </small>
                                </div>}
                          </>}
          
                    </div>}


          { this.state.activeListIndex == 1
              && <FeedDashRecurrentProfilesSectionView
                    objects={this.state.allPeriodFeedPostViews}
                    globalData={this.props.globalData}/>}

          { this.state.activeListIndex == 2
              && <FeedDashAttentionGrabbersSectionView
                  objects={this.state.allPeriodFeedPostViews}
                  globalData={this.props.globalData}/>}

          { this.state.activeListIndex == 3
              && <FeedDashHashtagsSectionView
                    objects={this.state.allPeriodFeedPostViews}
                    setCount={this.setHashtagCount}/>}

  			</div>

  		</div>


      {/*Modals*/}

      <AllPostsModal 
        startDate={this.state.startDate}
        endDate={this.state.endDate}
        onHide={this.handleAllPostsModalClose}
        globalData={this.props.globalData}
        objects={this.state.allPostsModalShow ? this.state.allPeriodFeedPostViews : null}/>


      <Modal 
        show={this.state.metricLineChartModalTitle} 
        onHide={this.handleMetricLineChartModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{this.state.metricLineChartModalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          { this.state.metricLineChartModalTitle 
              && <FeedMetricsLineChart
                    rangeDates={{
                      start: this.state.startDate,
                      end: this.state.endDate,
                    }}
                    objects={this.state.allPeriodFeedPostViews}
                    metric={this.state.metricLineChartModalTitle}
                    metricValueFunction={getFeedDashMetricValue}/>}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={this.handleMetricLineChartModalClose} className="shadow">
            Close
          </Button>
        </Modal.Footer>
      </Modal>



      <Modal 
        show={this.state.postStackedBarChartModalShow} 
        onHide={this.handlePostStackedBarChartModalClose}
        size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Post creation and first feed occurence dates chart</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <FeedPostCreatOccurStackedBarChart
            rangeDates={{
              start: this.state.startDate,
              end: this.state.endDate,
            }}
            objects={this.state.allPeriodFeedPostViews?.filter((value, index, self) => self.findIndex(v => v.htmlElId == value.htmlElId) === index)}/>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={this.handlePostStackedBarChartModalClose} className="shadow">
            Close
          </Button>
        </Modal.Footer>
      </Modal>



      {/*Toasts*/}
      <CustomToast 
        globalData={this.props.globalData} 
        message={this.state.toastMessage} 
        show={this.state.toastShow} 
        onClose={this.toggleToastShow}/>

      </>
    );
  }
}
