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

/*import './FeedProfileDataModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import FeedMetricsLineChart from "../Charts/FeedMetricsLineChart";
import FeedPostCategoryDonutChart from "../Charts/FeedPostCategoryDonutChart";
import HashtagWordCloudChart from "../Charts/HashtagWordCloudChart";
import FeedProfileReactionsSubjectsBarChart from "../Charts/FeedProfileReactionsSubjectsBarChart";
import { v4 as uuidv4 } from 'uuid';
import { 
  getFeedDashMetricValue,
  getPostCount,
  secondsToHms,
  getVisitsTotalTime,
} from "../../Local_library";
import { 
  OverlayTrigger, 
  Tooltip as ReactTooltip, 
  Popover, 
} from "react-bootstrap";
import { 
  PostIcon,
  ClockIcon,
  FeedIcon,
  DuplicateIcon,
  BookmarkIcon,
} from "../SVGs";
import { db } from "../../../db";
import { liveQuery } from "dexie";

export default class FeedProfileDataModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      feedPostViews: null,
      bookmark: null,
    };

    this.setFeedPostViews = this.setFeedPostViews.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.bookmarkProfile = this.bookmarkProfile.bind(this);

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.profile != this.props.profile){
      this.setFeedPostViews();
    }

  }

  async setFeedPostViews(){

    if (!this.props.profile){
      return null;
    }

    this.setState({feedPostViews: this.props.objects.filter(feedPostView => (feedPostView.profile && feedPostView.profile.uniqueId == this.props.profile.uniqueId)
                                                                              || feedPostView.feedPost.profile.uniqueId == this.props.profile.uniqueId)});

    // setting bookmark property value
    const profileBookmarkStatusObservable = liveQuery(() => db.bookmarks.where({url: this.props.profile.url}).first());

    this.profileBookmarkStatusSubscription = profileBookmarkStatusObservable.subscribe(
      result => this.setState({bookmark: result}),
      error => this.setState({error})
    );

  }

  handleModalClose(){

    if (this.profileBookmarkStatusSubscription) {
      this.profileBookmarkStatusSubscription.unsubscribe();
      this.profileBookmarkStatusSubscription = null;
    }

    this.props.onHide();

  }

  async bookmarkProfile(){

    if (this.state.bookmark){
      await db.bookmarks.delete(this.state.bookmark.id);
    }
    else{
      await db.bookmarks.add({
        url: this.props.profile.url,
        createdOn: new Date().toISOString(),
        uniqueId: uuidv4(),
      })
    }

  }

  getIndividualFeedPostViews = () => this.state.feedPostViews.filter((value, index, self) => self.findIndex(view => view.htmlElId == value.htmlElId) === index);

  render(){
    return (
      <>
        <Modal show={this.props.profile} onHide={this.handleModalClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {this.props.profile 
                && <span>
                    <span>
                      <img 
                        src={this.props.profile.picture}
                        class="shadow rounded-circle"
                        width="50" height="50"/>
                      <span class="ms-2">{this.props.profile.name}</span>
                      <a 
                        href={this.props.profile.url} 
                        target="_blank" 
                        title="Open profile in a new tab"
                        class="ms-3">
                        <DuplicateIcon
                            size="20"/>
                      </a>
                    </span>
                    <span 
                      class={`handy-cursor mx-2 ${this.state.bookmark ? "text-success" : "text-muted"}`}
                      onClick={this.bookmarkProfile}>
                      <OverlayTrigger
                        placement="top"
                        overlay={<ReactTooltip id="tooltip1">{this.state.bookmark ? "Bookmarked" : "Not bookmarked"}</ReactTooltip>}
                      >
                        <span>
                          <BookmarkIcon
                            size="20"
                            className="ms-2"
                            strokeWidth={3}/>
                        </span>
                      </OverlayTrigger>
                    </span>
                </span>}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { !this.props.profile 
                && <div class="text-center">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                    </div> }

            { this.props.profile 
                && this.state.feedPostViews
                && <div>

                    <div class="row text-center">
                      <div class="col">
                        <div class="alert alert-info py-1 shadow-sm small text-muted mt-2" role="alert">
                          <PostIcon
                            size="18"/>
                          <span class="ms-2">
                            { `${getPostCount(this.state.feedPostViews)} reactions/posts` }
                          </span>
                        </div>
                      </div>
                      <div class="col">
                        <div class="alert alert-warning py-1 shadow-sm small text-muted mt-2" role="alert">
                          <ClockIcon
                            size="18"/>
                          <span class="ms-2">
                            { secondsToHms(getVisitsTotalTime(this.state.feedPostViews) * 60) }
                          </span>
                        </div>
                      </div>
                      <div class="col">
                        <div class="alert alert-success py-1 shadow-sm small text-muted mt-2" role="alert">
                          <FeedIcon
                            size="18"/>
                          <span class="ms-2">
                            { `${this.state.feedPostViews.length} feed occurrence${this.state.feedPostViews.length > 1 ? "s" : ""}` }
                          </span>
                        </div>
                      </div>
                    </div>
                  
                    <div class="row">

                      <div class="col">
                        <div class="rounded shadow-sm">
                          <FeedProfileReactionsSubjectsBarChart
                            objects={this.getIndividualFeedPostViews()}
                            profile={this.props.profile}
                          />
                        </div>
                      </div>

                      <div class="col">
                        <div class="rounded shadow-sm">
                          <FeedMetricsLineChart
                            rangeDates={{
                              start: this.props.globalData.settings.lastDataResetDate,
                              end: new Date().toISOString(),
                            }}
                            objects={this.state.feedPostViews}
                            metric="Post Count"
                            metricValueFunction={getFeedDashMetricValue}/>
                        </div>
                      </div>

                    </div>

                    <div class="row mt-4">

                      <div class="col">
                        <div class="shadow-sm rounded py-2">
                          <FeedPostCategoryDonutChart 
                            objects={this.state.feedPostViews}
                            rangeDates={{
                              start: this.props.globalData.settings.lastDataResetDate,
                              end: new Date().toISOString(),
                            }}
                            />
                        </div>
                      </div>

                      <div class="col">
                        <div class="shadow-sm rounded py-2 h-100">
                          <HashtagWordCloudChart
                            objects={this.getIndividualFeedPostViews()}/>
                        </div>
                      </div>

                    </div>

                </div>}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
