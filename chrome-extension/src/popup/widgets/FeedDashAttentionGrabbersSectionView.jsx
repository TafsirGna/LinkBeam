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

/*import './FeedDashAttentionGrabbersSectionView.css'*/
import React from 'react';
import eventBus from "../EventBus";
import { 
  appParams,
  secondsToHms,
} from "../Local_library";
import { DateTime as LuxonDateTime } from "luxon";
import { 
  AlertCircleIcon, 
  LayersIcon,
  BarChartIcon, 
} from "./SVGs";
import { 
  OverlayTrigger, 
  Tooltip as ReactTooltip, 
  // Popover, 
} from "react-bootstrap";
import { db } from "../../db";
import AttentionGrabbersAnimatedTreeMapChart from "./charts/AttentionGrabbersAnimatedTreeMapChart";
import FeedProfileDataModal from "./modals/FeedProfileDataModal";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ActivityListView from "./ActivityListView";

export default class FeedDashAttentionGrabbersSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profiles: null,
      animatedTreeMapChartModalShow: false,
      selectedFeedProfile: null,
      selectedProfile: null,
    };

    this.setAttentionGrabbers = this.setAttentionGrabbers.bind(this);

  }

  componentDidMount() {
    this.setAttentionGrabbers();
  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.setAttentionGrabbers();
    }

  }

  componentWillUnmount() {

  }

  handleFeedProfileDataModalClose = () => this.setState({selectedFeedProfile: null});
  handleFeedProfileDataModalShow = (profile) => this.setState({selectedFeedProfile: profile});

  handlePostListModalClose = () => this.setState({selectedProfile: null});
  handlePostListModalShow = (profile) => this.setState({selectedProfile: profile});

  async setAttentionGrabbers(){

    if (!this.props.objects){
      return;
    }

    var attentionGrabbers = [];

    for (var feedPostView of this.props.objects){

      var profileIndex = null;

      // checking first for the initiator of the postView
      if (feedPostView.profile){
        profileIndex = attentionGrabbers.findIndex(g => g.uniqueId == feedPostView.profileId);
        if (profileIndex == -1){
          attentionGrabbers.push({
            ...feedPostView.profile,
            feedPostViews: [feedPostView],
          });
        }
        else{
          attentionGrabbers[profileIndex].feedPostViews.push(feedPostView);
        }
      }

      // Then doing the same for the author
      profileIndex = attentionGrabbers.findIndex(g => g.uniqueId == feedPostView.feedPost.profileId);
      if (profileIndex == -1){
        attentionGrabbers.push({
          ...feedPostView.feedPost.profile,
          feedPostViews: [feedPostView],
        });
      }
      else{
        attentionGrabbers[profileIndex].feedPostViews.push(feedPostView);
      }

    }    

    attentionGrabbers.sort((a, b) => b.feedPostViews.map(view => view.timeCount).reduce((acc, a) => acc + a, 0) - a.feedPostViews.map(view => view.timeCount).reduce((acc, a) => acc + a, 0));

    this.setState({profiles: attentionGrabbers});

  }

  handleAnimatedTreeMapChartModalClose = () => {this.setState({animatedTreeMapChartModalShow: false})};
  handleAnimatedTreeMapChartModalShow = () => {this.setState({animatedTreeMapChartModalShow: true})};

  render(){
    return (
      <>
        
        <div class="my-2 p-3 bg-body rounded shadow border mx-3">
          <h6 class="border-bottom pb-2 mb-0">
            Top attention grabbers
            <OverlayTrigger
              placement="top"
              overlay={<ReactTooltip id="tooltip1">Profiles whose interactions have caught your interest (time) the most</ReactTooltip>}
            >
              <span class="ms-1">
                <AlertCircleIcon size="14" className=""/>
              </span>
            </OverlayTrigger>

            <div class="dropdown float-end bd-gray">
              <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
                <LayersIcon 
                  size="18" 
                  className="text-muted"/>
              </div>
              <ul class="dropdown-menu shadow-lg">
                <li>
                  <a 
                    class="dropdown-item small" 
                    href="#" 
                    onClick={this.handleAnimatedTreeMapChartModalShow}>
                    <BarChartIcon 
                      size="15" 
                      className="me-2 text-muted"/>
                    Treemap chart
                    {/*<span class="badge text-bg-danger rounded-pill ms-1 px-1 shadow-sm">In test</span>*/}
                  </a>
                </li>
              </ul>
            </div>
          </h6>

          { !this.state.profiles 
              && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                    {/*<span class="visually-hidden">Loading...</span>*/}
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                </div>
              </div>}

          { this.state.profiles 
            && <>
              {this.state.profiles.length == 0
                && <div class="text-center m-5">
                      <AlertCircleIcon size="100" className="text-muted"/>
                      <p><span class="badge text-bg-primary fst-italic shadow">No recorded users yet</span></p>
                    </div>}

              { this.state.profiles.length  != 0
                  && <div>
                     { this.state.profiles.map((object, index) => index < 10 ? <div class="d-flex text-body-secondary pt-3 border-bottom">
                                                                          <img 
                                                                            src={ object.picture } 
                                                                            alt="twbs" 
                                                                            width="40" 
                                                                            height="40" 
                                                                            class="shadow rounded-circle flex-shrink-0 me-2"/>
                                                                          <p class="pb-3 mb-0 small lh-sm w-100">
                                                                            
                                                                              <div class="mb-2">
                                                                                <a 
                                                                                  class=/*d-block*/"handy-cursor text-gray-dark text-decoration-none text-secondary fst-italic mb-2 fw-bold" 
                                                                                  href={null}
                                                                                  onClick={() => {this.handleFeedProfileDataModalShow(object);}}
                                                                                  title="Click to show more infos">
                                                                                  { object.name } 
                                                                                </a>
                                                                              </div>
                                                                              <div class="w-100 p-1">
                                                                                
                                                                                <div class="progress-stacked shadow border" style={{height: ".5em"}}>

                                                                                      <OverlayTrigger overlay={<ReactTooltip id={null}>{`${secondsToHms(object.feedPostViews.map(view => view.timeCount).reduce((acc, a) => acc + a, 0))}`}</ReactTooltip>}>
                                                                                        <div 
                                                                                          class="progress handy-cursor" 
                                                                                          role="progressbar" 
                                                                                          aria-label="Segment one" 
                                                                                          aria-valuenow={((object.feedPostViews.map(view => view.timeCount).reduce((acc, a) => acc + a, 0) * 100) / this.state.profiles[0].feedPostViews.map(view => view.timeCount).reduce((acc, a) => acc + a, 0)).toFixed(1)} 
                                                                                          aria-valuemin="0" 
                                                                                          onClick={() => this.handlePostListModalShow(object)}
                                                                                          title="Click to see more"
                                                                                          aria-valuemax="100" style={{width: `${((object.feedPostViews.map(view => view.timeCount).reduce((acc, a) => acc + a, 0) * 100) / this.state.profiles[0].feedPostViews.map(view => view.timeCount).reduce((acc, a) => acc + a, 0)).toFixed(1)}%`}}>
                                                                                          <div class={`progress-bar bg-secondary`}></div>
                                                                                        </div>
                                                                                      </OverlayTrigger>

                                                                                </div>


                                                                              </div>

                                                                          </p>
                                                                        </div>
                                                                        : null)}
                    </div>}
              </>}

        </div>

        <Modal show={this.state.animatedTreeMapChartModalShow} onHide={this.handleAnimatedTreeMapChartModalClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Attention Grabbers Treemap chart</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <AttentionGrabbersAnimatedTreeMapChart
              objects={this.props.objects}
              profiles={this.state.profiles}/>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleAnimatedTreeMapChartModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <FeedProfileDataModal
          profile={this.state.selectedFeedProfile}
          objects={this.props.objects}
          onHide={this.handleFeedProfileDataModalClose}
          globalData={this.props.globalData}/>


        <Modal 
          show={this.state.selectedProfile != null} 
          onHide={this.handlePostListModalClose}
          size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Post List: {this.state.selectedProfile ? this.state.selectedProfile.name : null}</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { !this.state.selectedProfile 
                && <div class="text-center">
                    <div class="mb-5 mt-4">
                      <div class="spinner-border text-primary" role="status">
                        {/*<span class="visually-hidden">Loading...</span>*/}
                      </div>
                      <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                    </div>
                  </div>}

            { this.state.selectedProfile
                && <ActivityListView 
                      objects={this.state.selectedProfile
                                         .feedPostViews
                                         .filter((value, index, self) => self.findIndex(v => v.htmlElId == value.htmlElId) === index)
                                         .map(v => {
                                            v.feedPost.view = v;
                                            return v.feedPost;
                                         })
                                         .map(feedPost => ({
                                            author: feedPost.profile,
                                            url: `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${feedPost.view.htmlElId}`,
                                            // date: views.length ? views[0].date : null,
                                            text: feedPost.innerContentHtml,
                                            media: feedPost.media,
                                            category: feedPost.view.category,
                                            initiator: feedPost.view.profile,
                                          }))}
                      variant="list"/> }

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handlePostListModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </>
    );
  }
}
