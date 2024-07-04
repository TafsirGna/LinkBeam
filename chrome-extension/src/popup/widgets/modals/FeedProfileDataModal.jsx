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
import FeedMetricsLineChart from "../charts/FeedMetricsLineChart";
import FeedPostCategoryDonutChart from "../charts/FeedPostCategoryDonutChart";
import HashtagWordCloudChart from "../charts/HashtagWordCloudChart";
import FeedProfileReactionsSubjectsBarChart from "../charts/FeedProfileReactionsSubjectsBarChart";
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
} from "../SVGs";
import { db } from "../../../db";

export default class FeedProfileDataModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      feedPostViews: null,
    };

    this.setFeedPostViews = this.setFeedPostViews.bind(this);

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.show != this.props.show){
      if (this.props.show){
        this.setFeedPostViews();
      }
    }

  }

  async setFeedPostViews(){

    var feedPostViews = await db.feedPostViews
                                .filter(feedPostView => feedPostView.initiator 
                                                          && feedPostView.initiator.url 
                                                          && feedPostView.initiator.url == this.props.object.url)
                                .toArray();

    const feedPosts = await db.feedPosts
                              .filter(feedPost => feedPost.author.url == this.props.object.url)
                              .toArray();

    for (const feedPost of feedPosts){
      await db.feedPostViews
              .where({feedPostId: feedPost.id})
              .each(feedPostView => {
                if (feedPostViews.findIndex(view => view.date == feedPostView.date) == -1){
                  feedPostViews.push(feedPostView);
                }
              });
    }

    this.setState({feedPostViews: feedPostViews});

  }

  render(){
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.onHide} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {this.props.object 
                && <span>
                    <img 
                      src={this.props.object.picture}
                      class="shadow rounded-circle"
                      width="50" height="50"/>
                    <span class="ms-2">{this.props.object.name}</span>
                    <a 
                      href={this.props.object.url} 
                      target="_blank" 
                      title="Open profile in a new tab"
                      class="ms-3">
                      <DuplicateIcon
                          size="20"/>
                    </a>
                </span>}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { !this.props.object 
                && <div class="text-center">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                    </div> }

            { this.props.object 
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
                            { `${this.state.feedPostViews.length} feed occurrences` }
                          </span>
                        </div>
                      </div>
                    </div>
                  
                    <div class="row">

                      <div class="col">
                        <div class="rounded shadow-sm">
                          <FeedProfileReactionsSubjectsBarChart
                            objects={this.state.feedPostViews}
                            profile={this.props.object}
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
                            objects={this.state.feedPostViews}/>
                        </div>
                      </div>

                    </div>

                </div>}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
