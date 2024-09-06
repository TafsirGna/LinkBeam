/*import './PostViewListItemView.css'*/
import React, { useEffect, useState } from 'react';
import { 
  BarChartIcon,
  LayersIcon,
  CheckIcon,
  PlusIcon,
  DeletionIcon,
} from "./SVGs";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FeedPostTrendLineChart from "./charts/FeedPostTrendLineChart";
import ReminderModal from "./modals/ReminderModal";
import FeedProfileDataModal from "./modals/FeedProfileDataModal";
import eventBus from "../EventBus";
import { db } from "../../db";
import { 
  categoryVerbMap,
  appParams,
  secondsToHms,
  getPostMetricValue,
} from "../Local_library";
import default_user_icon from '../../assets/user_icons/default.png';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import share_icon from '../../assets/share_icon.png';
import heart_icon from '../../assets/heart_icon.png';
import party_popper_icon from '../../assets/party-popper_icon.png';
import linkedin_icon from '../../assets/linkedin_icon.png';
import like_icon from '../../assets/like_icon.png';
import support_icon from '../../assets/support_icon.png';
import contribution_icon from '../../assets/contribution_icon.png';
import comment_icon from '../../assets/comment_icon.png';
import insightful_icon from '../../assets/insightful_icon.png';
import repost_icon from '../../assets/repost_icon.png';
import suggestion_icon from '../../assets/suggestion_icon.png';
import fun_icon from '../../assets/fun_icon.png';
import { Tooltip } from "react-bootstrap";
import Spinner from 'react-bootstrap/Spinner';
import { liveQuery } from "dexie"; 

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

const categoryIconMap = {
  loves: heart_icon,
  celebrations: party_popper_icon,
  likes: like_icon,
  supports: support_icon,
  contributions: contribution_icon,
  comments: comment_icon,
  insights: insightful_icon,
  reposts: repost_icon,
  suggestions: suggestion_icon,
  funs: fun_icon,
};

export default class PostViewListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      postTrendChartModalShow: false,
      reminderModalShow: false,
      updated: false,
      feedPostViews: null,
      selectedFeedProfile: null,
      reminder: null,
      userTooltipContent: <Spinner 
                            animation="border" 
                            size="sm"
                            variant="secondary"/>,
    };

    this.onEnteringUserTooltip = this.onEnteringUserTooltip.bind(this);
    this.onExitingUserTooltip = this.onExitingUserTooltip.bind(this);
    this.onReminderActionClick = this.onReminderActionClick.bind(this);
    this.registerUpdateEvent = this.registerUpdateEvent.bind(this);
  }

  componentDidMount() {

    this.setState({feedPostViews: this.props.objects}, () => {

      this.reminderSubscription = liveQuery(() => db.reminders
                                                    .where({objectId: this.state.feedPostViews[0].feedPost.uniqueId})
                                                    .first()).subscribe(
        result => this.setState({reminder: result}),
        error => this.setState({error})
      );

    });

  }

  componentDidUpdate(prevProps, prevState){

    if (prevState.reminder != this.state.reminder){
      this.registerUpdateEvent();
      if (!prevState.reminder){
        this.handleReminderModalClose();
      }
    }

  }

  componentWillUnmount(){

    if (this.reminderSubscription) {
      this.reminderSubscription.unsubscribe();
      this.reminderSubscription = null;
    }

  }

  registerUpdateEvent = () => {
    this.setState({updated: true}, () => {
      setTimeout(() => {
        this.setState({updated: false});
      }, appParams.TIMER_VALUE_1)
    });
  }

  handleReminderModalClose = () => this.setState({reminderModalShow: false});
  handleReminderModalShow = () => this.setState({reminderModalShow: true});

  handleFeedProfileDataModalClose = () => this.setState({selectedFeedProfile: null});
  handleFeedProfileDataModalShow = (profile) => this.setState({selectedFeedProfile: profile});

  handlePostTrendChartModalClose = () => this.setState({postTrendChartModalShow: false});
  handlePostTrendChartModalShow = () => this.setState({postTrendChartModalShow: true});

  onEnteringUserTooltip = async () => {

    var count = 0;
    if (this.state.feedPostViews[0].category){
      count = (await db.feedPostViews
                       .filter(feedPostView => feedPostView.category
                                              && feedPostView.category == this.state.feedPostViews[0].category
                                              && ((this.state.feedPostViews[0].profile && feedPostView.profileId == this.state.feedPostViews[0].profileId)
                                                    || !this.state.feedPostViews[0].profile))
                       .toArray())
                .filter((value, index, self) => self.findIndex(post => post.id == value.id) === index)
                .length;
    }
    else{
      count = await db.feedPosts
                      .filter(feedPost => feedPost.profileId == this.state.feedPostViews[0].feedPost.profileId)
                      .count();
    }

    this.setState({userTooltipContent: <span class="fw-light">
                                        {`${count} ${this.state.feedPostViews[0].category 
                                                      ? (count > 1 
                                                          ? this.state.feedPostViews[0].category 
                                                          : this.state.feedPostViews[0].category.slice(0, (this.state.feedPostViews[0].category.length - 1))) 
                                                      : `publication${count > 1 ? "s" : ""}`}`} so far
                                      </span>});

  }

  onExitingUserTooltip = async () => {

    this.setState({userTooltipContent: <Spinner 
                            animation="border" 
                            size="sm"
                            variant="secondary" />});

  }

  async onReminderActionClick(){

    if (this.state.reminder){
      // deleting the reminder
      if (confirm("Do you confirm the deletion of the reminder ?")){
        await db.reminders
                .delete(this.state.reminder.id);
      }
    }
    else{
      this.handleReminderModalShow();
    }

  }

  render(){
    return (
      <>
        { this.state.feedPostViews 
            && <div class="d-flex text-body-secondary pt-3 border-bottom">
                  <img 
                    src={ (this.state.feedPostViews[0].category 
                            ? (this.state.feedPostViews[0].profile ? this.state.feedPostViews[0].profile.picture : linkedin_icon) 
                            : (this.state.feedPostViews[0].feedPost.profile.picture || default_user_icon)) } 
                    alt="twbs" 
                    width="40" 
                    height="40" 
                    class="shadow rounded-circle flex-shrink-0 me-2"/>
                  <p class="pb-3 mb-0 small lh-sm w-100">
                    
                      <div class="mb-2">
                        <a 
                          class=/*d-block*/"text-decoration-none shadow-sm fst-italic mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-info"
                          href="#"
                          title="Click to show more infos"
                          onClick={() => { 
                            if (this.state.feedPostViews[0].category 
                                  && !this.state.feedPostViews[0].profile){ // it's a suggested post
                              return;
                            }
                            this.handleFeedProfileDataModalShow((this.state.feedPostViews[0].category && this.state.feedPostViews[0].profile) ? this.state.feedPostViews[0].profile : this.state.feedPostViews[0].feedPost.profile);
                          }}>
                          <OverlayTrigger 
                            trigger="hover" 
                            placement="top" 
                            onEntering={this.onEnteringUserTooltip}
                            onExiting={this.onExitingUserTooltip}
                            overlay={<UpdatingPopover id="popover-contained">{this.state.userTooltipContent}</UpdatingPopover>}>
                            <span>
                              { this.state.feedPostViews[0].category 
                                  ? (this.state.feedPostViews[0].profile ? this.state.feedPostViews[0].profile.name : "Linkedin")
                                  : this.state.feedPostViews[0].feedPost.profile.name } 
                            </span>
                          </OverlayTrigger>
                        </a>
                        { this.state.updated && <div class="d-inline ms-2">
                                          <span class="badge text-bg-success fst-italic shadow-sm pb-0">
                                            <CheckIcon size="16"/>
                                            Updated
                                          </span>
                                        </div>}
                      </div>
                    <div class="w-100 p-1 py-3 rounded shadow-sm border">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="tooltip1">{this.state.feedPostViews[0].category ? categoryVerbMap[this.state.feedPostViews[0].category]["en"] : "shared"}</Tooltip>}
                      >
                        <span class="mx-1">
                          <img class="mx-1" width="16" height="16" src={this.state.feedPostViews[0].category ? categoryIconMap[this.state.feedPostViews[0].category] : share_icon} alt=""/>
                        </span>
                      </OverlayTrigger>
                      this 
                      <OverlayTrigger 
                        trigger="hover" 
                        placement="left" 
                        overlay={<Popover id="popover-basic">
                                  <Popover.Header 
                                    as="h3">
                                    Post
                                  </Popover.Header>
                                  <Popover.Body dangerouslySetInnerHTML={{__html: this.state.feedPostViews[0].feedPost.innerContentHtml}}>
                                    {}
                                  </Popover.Body>
                                </Popover>}
                        >
                        <a 
                          href={`${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${this.state.feedPostViews[0].htmlElId}`} 
                          target="_blank" 
                          class="fst-italic mx-1" 
                          title="Click to open in a new tab">
                          post
                        </a>
                      </OverlayTrigger>
                      { this.state.feedPostViews[0].category 
                          && <span class="ms-1"> 
                              of
        
                              <span 
                                class="badge align-items-center p-2 pe-2 text-secondary-emphasis border rounded-pill ms-1 py-1 shadow-sm">
                                <img 
                                  class="rounded-circle me-1" 
                                  width="14" 
                                  height="14" 
                                  src={this.state.feedPostViews[0].feedPost.profile.picture || default_user_icon} 
                                  alt=""/>
                                <a 
                                  class="text-decoration-none text-muted"
                                  href="#"
                                  title="Click to show more infos"
                                  onClick={() => { this.handleFeedProfileDataModalShow(this.state.feedPostViews[0].feedPost.profile) }}>
                                  {this.state.feedPostViews[0].feedPost.profile.name}
                                </a>
                              </span>
        
                            </span>}
        
                    </div>
                    <div class="mt-3">
                      <span class="border shadow-sm rounded p-1 text-muted">
                        <span 
                          onClick={this.handlePostTrendChartModalShow} 
                          class="handy-cursor mx-1 text-primary small"
                          title={`${this.state.feedPostViews ? `${this.state.feedPostViews.length} impression${this.state.feedPostViews.length > 1 ? "s" : ""} |` : ""} see metrics`}>
                          {this.state.feedPostViews ? `(${this.state.feedPostViews.length})` : null}
                          <BarChartIcon size="14" className="ms-1"/>
                        </span>
                      </span>
        
                      <div class="dropdown d-inline mx-2">
                        <span 
                          class="border shadow-sm rounded p-1 text-muted dropdown-toggle"
                          data-bs-toggle="dropdown" 
                          aria-expanded="false">
                          <span  
                            class="handy-cursor mx-1 text-primary">
                            <LayersIcon size="14"/>
                          </span>
                        </span>
                        <ul class="dropdown-menu shadow">
                          <li>
                            <a 
                              class={"dropdown-item small handy-cursor " + (this.state.reminder ? "text-danger" : "text-muted")} 
                              onClick={this.onReminderActionClick}>
                              { this.state.reminder 
                                && <DeletionIcon size="15" className="me-2"/> }
                              { !this.state.reminder 
                                  && <PlusIcon size="15" className="me-2 text-muted"/> }
                              { this.state.reminder ? "Delete " : "Add "} reminder
                            </a>
                            </li>
                        </ul>
                      </div>
        
                      { this.state.feedPostViews
                          && <span class="badge bg-light-subtle border border-light-subtle text-light-emphasis rounded-pill">
                              {secondsToHms(this.state.feedPostViews.map(v => v.timeCount).reduce((acc, a) => acc + a, 0), false)}
                            </span>}
                    </div>
                  </p>
                </div>}

        {/*Modal*/}
        <Modal 
          show={this.state.postTrendChartModalShow} 
          onHide={this.handlePostModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>

              { this.state.postTrendChartModalShow 
                  && <FeedPostTrendLineChart
                      objects={this.state.feedPostViews}
                      globalData={this.props.globalData}
                      metricValueFunction={getPostMetricValue}/> }

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handlePostModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        { this.state.feedPostViews 
            && <ReminderModal 
                  object={this.state.feedPostViews[0].feedPost} 
                  show={this.state.reminderModalShow} 
                  onHide={this.handleReminderModalClose} />}

        <FeedProfileDataModal
          object={this.state.selectedFeedProfile}
          onHide={this.handleFeedProfileDataModalClose}
          globalData={this.props.globalData}/>

      </>
    );
  }
}
