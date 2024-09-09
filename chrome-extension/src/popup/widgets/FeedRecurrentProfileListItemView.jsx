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

/*import './FeedRecurrentProfileListItemView.css'*/
import React, { useEffect, useState } from 'react';
import default_user_icon from '../../assets/user_icons/default.png';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { Tooltip } from "react-bootstrap";
import Spinner from 'react-bootstrap/Spinner';
import FeedProfileDataModal from "./modals/FeedProfileDataModal";
import Modal from 'react-bootstrap/Modal';
import ActivityListView from "./ActivityListView";
import Button from 'react-bootstrap/Button';
import { 
  appParams,
} from "../Local_library";

const bgColors = [
  "bg-primary",
  "bg-secondary",
  "bg-info",
  "bg-danger",
  "bg-warning",
  "bg-success",
  "bg-primary-subtle",
  "bg-secondary-subtle",
  "bg-info-subtle",
  "bg-danger-subtle",
  "bg-warning-subtle",
  "bg-success-subtle",
];


const UpdatingPopover = React.forwardRef(
  ({ popper, children, show: _, ...props }, ref) => {
    useEffect(() => {
      console.log('updating!');
      popper.scheduleUpdate();
    }, [children, popper]);

    return (
      <Popover ref={ref} body {...props}>
        {children}
      </Popover>
    );
  },
);

export const totalInteractions = object => Object.keys(object.feedPostViewsByCategory).map(key => object.feedPostViewsByCategory[key].length)
                                                                                      .reduce((acc, a) => acc + a, 0);


export default class FeedRecurrentProfileListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      totalInteractions: null,
      feedProfileDataModalShow: false,
      selectedPostListCategory: null,
      userTooltipContent: <Spinner 
                            animation="border" 
                            size="sm"
                            variant="secondary" />,
    };

    this.onEnteringUserTooltip = this.onEnteringUserTooltip.bind(this);
    this.onExitingUserTooltip = this.onExitingUserTooltip.bind(this);
  }

  componentDidMount() {

    this.setState({totalInteractions: totalInteractions(this.props.object)});

  }

  componentDidUpdate(prevProps, prevState){

  }

  componentWillUnmount(){

  }

  handleFeedProfileDataModalClose = () => this.setState({feedProfileDataModalShow: false, selectedFeedProfile: null});
  handleFeedProfileDataModalShow = () => this.setState({feedProfileDataModalShow: true});

  handlePostListModalClose = () => this.setState({selectedPostListCategory: null});
  handlePostListModalShow = (category) => this.setState({selectedPostListCategory: category});

  onEnteringUserTooltip = async () => {

    this.setState({userTooltipContent: <span class="fw-light">{`${totalInteractions(this.props.object)} deed${totalInteractions(this.props.object) > 1 ? "s" : ""}`} so far</span>});

  }

  onExitingUserTooltip = async () => {

    this.setState({userTooltipContent: <Spinner 
                            animation="border" 
                            size="sm"
                            variant="secondary" />});

  }

  render(){
    return (
      <>
        <div class="d-flex text-body-secondary pt-3 border-bottom">
          <img 
            src={ this.props.object.picture} 
            alt="twbs" 
            width="40" 
            height="40" 
            class="shadow rounded-circle flex-shrink-0 me-2"/>
          <p class="pb-3 mb-0 small lh-sm w-100">
            
              <div class="mb-2">
                <a 
                  class=/*d-block*/" text-gray-dark text-decoration-none text-secondary fst-italic mb-2 fw-bold" 
                  href=/*{this.props.object.url}*/"#"
                  onClick={this.handleFeedProfileDataModalShow}
                  title="Click to show more infos">
                  <OverlayTrigger 
                    trigger="hover" 
                    placement="top" 
                    onEntering={this.onEnteringUserTooltip}
                    onExiting={this.onExitingUserTooltip}
                    overlay={<UpdatingPopover id="popover-contained">{this.state.userTooltipContent}</UpdatingPopover>}>
                    <span>
                      { this.props.object.name } 
                    </span>
                  </OverlayTrigger>
                </a>
              </div>
              <div class="w-100 p-1">
                
                <div class="progress-stacked shadow border" style={{height: ".5em"}}>
                  { Object.keys(this.props.object.feedPostViewsByCategory).map((category, index) => (

                      <OverlayTrigger overlay={<Tooltip id={null}>{`${this.props.object.feedPostViewsByCategory[category].length} ${this.props.object.feedPostViewsByCategory[category].length <= 1 ? (category.endsWith("s") ? category.slice(0, category.length - 1) : category) : category}`}</Tooltip>}>
                        <div 
                          class="progress handy-cursor" 
                          role="progressbar" 
                          aria-label="Segment one" 
                          onClick={() => {this.handlePostListModalShow(category)}}
                          title="Click to see more"
                          aria-valuenow={((this.props.object.feedPostViewsByCategory[category].length * 100) / this.state.totalInteractions).toFixed(1)} aria-valuemin="0" aria-valuemax="100" style={{width: `${((this.props.object.feedPostViewsByCategory[category].length * 100) / this.state.totalInteractions).toFixed(1)}%`}}>
                          <div class={`progress-bar ${bgColors[index % bgColors.length]}`}></div>
                        </div>
                      </OverlayTrigger>

                    )) }
                </div>


              </div>

          </p>
        </div>

        <FeedProfileDataModal
          profile={this.state.feedProfileDataModalShow ? this.props.object : null}
          objects={this.props.objects}
          onHide={this.handleFeedProfileDataModalClose}
          globalData={this.props.globalData}/>


        <Modal 
          show={this.state.selectedPostListCategory != null} 
          onHide={this.handlePostListModalClose}
          size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Post List: {this.state.selectedPostListCategory} </Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { !this.state.selectedPostListCategory 
                && <div class="text-center">
                    <div class="mb-5 mt-4">
                      <div class="spinner-border text-primary" role="status">
                        {/*<span class="visually-hidden">Loading...</span>*/}
                      </div>
                      <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                    </div>
                  </div>}

            { this.state.selectedPostListCategory
                && <ActivityListView 
                    objects={this.props.object.feedPostViewsByCategory[this.state.selectedPostListCategory].map(feedPostView => { 
                                                                                                                                  var feedPost = feedPostView.feedPost;
                                                                                                                                  feedPost.view = feedPostView; 
                                                                                                                                  return feedPost;
                                                                                                                                })
                                                                                                           .filter((value, index, self) => self.findIndex(post => post.uniqueId == value.uniqueId) === index)
                                                                                                           .map(feedPost => ({
                                                                                                              author: feedPost.profile,
                                                                                                              url: `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${feedPost.view.htmlElId}`,
                                                                                                              // date: views.length ? views[0].date : null,
                                                                                                              text: feedPost.innerContentHtml,
                                                                                                              media: feedPost.media,
                                                                                                              category: feedPost.view.category,
                                                                                                              initiator: feedPost.view.profile,
                                                                                                            }))}
                    variant="list"/>
                }

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
