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

/*import './FeedDashHashtagsSectionView.css'*/
import React from 'react';
import eventBus from "../EventBus";
import { 
  appParams,
  highlightText,
  extractHashtags,
  hashtagFeedPosts,
} from "../Local_library";
import { DateTime as LuxonDateTime } from "luxon";
import { 
  AlertCircleIcon, 
  LayersIcon,
  BarChartIcon,
  GridIcon,
  DuplicateIcon,
} from "./SVGs";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ActivityListView from "./Lists/ActivityListView";
import { 
  OverlayTrigger, 
  Tooltip as ReactTooltip, 
  // Popover, 
} from "react-bootstrap";
import HashtagTimelineChart from "./Charts/HashtagTimelineChart";
import HashtagNetworkGraphChart from "./Charts/HashtagNetworkGraphChart";
import HashtagTangledTreeChart from "./Charts/HashtagTangledTreeChart";
import HashtagAnimatedTreeMapChart from "./Charts/HashtagAnimatedTreeMapChart";
import { db } from "../../db";

export default class FeedDashHashtagsSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      hashtagInfosModalShow: false,
      animatedTreeMapChartModalShow: false,
      selectedReference: null,
      hashtagInfosModalSelectedView: 0,
      hashtags: null,
      graphChartModalShow: false,
    };

    this.setHashtags = this.setHashtags.bind(this);
  }

  componentDidMount() {

    this.setHashtags();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.setHashtags();
    }

  }

  componentWillUnmount() {

  }

  setHashtagInfosModalSelectedView(view){
    this.setState({hashtagInfosModalSelectedView: view});
  }

  handleHashtagInfosModalClose = () => {this.setState({hashtagInfosModalShow: false})};
  handleHashtagInfosModalShow = (reference) => {this.setState({selectedReference: reference, hashtagInfosModalShow: true})};

  handleAnimatedTreeMapChartModalClose = () => {this.setState({animatedTreeMapChartModalShow: false})};
  handleAnimatedTreeMapChartModalShow = () => {this.setState({animatedTreeMapChartModalShow: true})};

  handleGraphChartModalClose = () => {this.setState({graphChartModalShow: false})};
  handleGraphChartModalShow = () => {this.setState({graphChartModalShow: true})};

  async setHashtags(){

    if (!this.props.objects){
      return;
    }

    this.setState({hashtags: extractHashtags(this.props.objects).map(hashtag => {
                                                                  hashtag.feedPosts = hashtagFeedPosts(hashtag, this.props.objects);
                                                                  return hashtag;
                                                                })
                                                                .toSorted((a, b) => b.feedPosts.length - a.feedPosts.length)
    }, () => {
      this.props.setCount(this.state.hashtags.length);
    });

  }

  render(){
    return (
      <>
        
        <div class="my-2 p-3 bg-body rounded shadow border mx-3">
          <h6 class="border-bottom pb-2 mb-0">
            Hashtags
            <div class="dropdown float-end bd-gray">
              <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
                <LayersIcon 
                  size="18" 
                  className="text-muted"/>
              </div>
              <ul class="dropdown-menu shadow-lg">
                <li>
                  <a class="dropdown-item small" href="#" onClick={this.handleGraphChartModalShow}>
                    <BarChartIcon 
                      size="15" 
                      className="me-2 text-muted"/>
                    Graph chart
                  </a>
                  <a class="dropdown-item small" href="#" onClick={this.handleAnimatedTreeMapChartModalShow}>
                    <BarChartIcon 
                      size="15" 
                      className="me-2 text-muted"/>
                    Treemap chart
                  </a>
                </li>
              </ul>
            </div>
          </h6>

          { !this.state.hashtags 
              && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                    {/*<span class="visually-hidden">Loading...</span>*/}
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                </div>
              </div>}

          { this.state.hashtags
            && <>
              {Object.keys(this.state.hashtags).length == 0
                && <div class="text-center m-5">
                      <AlertCircleIcon size="100" className="text-muted"/>
                      <p><span class="badge text-bg-primary fst-italic shadow">No recorded references yet</span></p>
                    </div>}

              { Object.keys(this.state.hashtags).length != 0
                  && <div class="mt-2">
                     { this.state.hashtags.map(object => (<span class="dropdown bd-gray">
                                                            <div class="handy-cursor d-inline" data-bs-toggle="dropdown" aria-expanded="false">
                                                              <OverlayTrigger
                                                                placement="top"
                                                                overlay={<ReactTooltip id="tooltip1">{`${object.feedPosts.length} post${object.feedPosts.length > 1 ? "s" : ""} associated`}</ReactTooltip>}
                                                              >
                                                              <span 
                                                                class={/*handy-cursor */`mx-2 badge bg-secondary-subtle border-secondary-subtle text-secondary-emphasis border rounded-pill`}>
                                                                {`${object.text} (${object.feedPosts.length})`}
                                                              </span>
                                                              </OverlayTrigger>
                                                            </div>
                                                            <ul class="dropdown-menu shadow-lg">
                                                              <li>
                                                                <a class="dropdown-item small" href="#" onClick={() => {this.handleHashtagInfosModalShow(object)}}>
                                                                  <GridIcon 
                                                                    size="15"
                                                                    className="me-2 text-muted"/>
                                                                  Show more
                                                                </a>
                                                              </li>
                                                              <li>
                                                                <a class="dropdown-item small" href={object.url} target="_blank">
                                                                  <DuplicateIcon 
                                                                    size="15"
                                                                    className="me-2 text-muted"/>
                                                                  View on Linkedin
                                                                </a>
                                                              </li>
                                                            </ul>
                                                          </span>))}
                    </div>}
              </>}

        </div>


        {/*Modals */}
        <Modal show={this.state.hashtagInfosModalShow} onHide={this.handleHashtagInfosModalClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{`Hashtag: ${this.state.selectedReference ? this.state.selectedReference.text : null}`}</Modal.Title>
          </Modal.Header>
          <Modal.Body>

              <div class="text-center">
                <div class="btn-group btn-group-sm mb-2 shadow" role="group" aria-label="Small button group">
                  <button type="button" class={`btn btn-primary badge ${this.state.hashtagInfosModalSelectedView == 0 ? " active " : ""}`} onClick={() => {this.setHashtagInfosModalSelectedView(0)}} >
                    Tree Chart
                  </button>
                  <button type="button" class={`btn btn-secondary badge ${this.state.hashtagInfosModalSelectedView == 1 ? " active " : ""}`} onClick={() => {this.setHashtagInfosModalSelectedView(1)}}>
                    Posts
                  </button>
                  <button type="button" class={`btn btn-outline-link badge text-secondary ${this.state.hashtagInfosModalSelectedView == 2 ? " active " : ""}`} onClick={() => {this.setHashtagInfosModalSelectedView(2)}}>
                    Timeline
                  </button>
                </div>
              </div>

              { this.state.hashtagInfosModalSelectedView == 0
                  && <div>
                      <HashtagTangledTreeChart
                        object={this.state.selectedReference}/>
                    </div> }

              { this.state.hashtagInfosModalSelectedView == 1
                  && <div>
                      <ActivityListView 
                        objects={this.state.selectedReference.feedPosts.map(post => { 
                          const view = this.props.objects.filter(view => view.feedPostId == post.uniqueId).toReversed()[0]; 
                          return {
                            author: post.profile,
                            url: `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${view.htmlElId}`,
                            // date: views.length ? views[0].date : null,
                            category: view.category,
                            initiator: view.profile,
                            text: highlightText(post.innerContentHtml, this.state.selectedReference.text),
                          }})}
                        variant="list"/>
                  </div> }

              { this.state.hashtagInfosModalSelectedView == 2
                  && <div>
                      <HashtagTimelineChart
                        object={this.state.selectedReference}
                        feedPostViews={this.props.objects}/>
                  </div> }

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleHashtagInfosModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>


        <Modal show={this.state.animatedTreeMapChartModalShow} onHide={this.handleAnimatedTreeMapChartModalClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Hashtags Treemap chart</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <HashtagAnimatedTreeMapChart
              objects={this.props.objects}
              hashtags={this.state.hashtags}/>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleAnimatedTreeMapChartModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.graphChartModalShow} onHide={this.handleGraphChartModalClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Hashtags network graph chart</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <HashtagNetworkGraphChart
              hashtags={this.state.hashtags}/>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleGraphChartModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </>
    );
  }
}
