/*import './PostViewListItemView.css'*/
import React, { useEffect, useState } from 'react';
import { 
  BarChartIcon,
  LayersIcon,
  CheckIcon,
} from "./SVGs";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FeedPostTrendLineChart from "./charts/FeedPostTrendLineChart";
import ReminderModal from "./modals/ReminderModal";
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
import { Tooltip } from "react-bootstrap";
import Spinner from 'react-bootstrap/Spinner';


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
}

export default class PostViewListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      postViewOccurences: null,
      postModalShow: false,
      reminderModalShow: false,
      updated: false,
      userTooltipContent: <Spinner 
                            animation="border" 
                            size="sm"
                            variant="secondary" />,
    };

    this.onEnteringUserTooltip = this.onEnteringUserTooltip.bind(this);
    this.onExitingUserTooltip = this.onExitingUserTooltip.bind(this);
    this.onReminderActionClick = this.onReminderActionClick.bind(this);
    this.registerUpdateEvent = this.registerUpdateEvent.bind(this);
    this.setAllPostViewOccurences = this.setAllPostViewOccurences.bind(this);
    // this.getPostTimeCount = this.getPostTimeCount.bind(this);
  }

  componentDidMount() {

    eventBus.on(eventBus.POST_REMINDER_ADDED, (data) =>
      {
        if (data.post.id == this.props.object.feedPostId){
          this.handleReminderModalClose();
          this.registerUpdateEvent();
        }
      }
    );

  }

  componentDidUpdate(prevProps, prevState){

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.POST_REMINDER_ADDED);
    eventBus.remove(eventBus.POST_REMINDER_DELETED);

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

  handlePostModalClose = () => this.setState({postModalShow: false});
  handlePostModalShow = () => this.setState({postModalShow: true}, () => {
    if (this.state.postViewOccurences){
      return;
    }

    this.setAllPostViewOccurences();

  });

  async setAllPostViewOccurences(callback = null){

    const occurences = await db.feedPostViews
                          .where({uid: this.props.object.uid})
                          .sortBy("date");

    this.setState({postViewOccurences: occurences}, () => {
      if (callback){
        callback();
      }
    });

  }

  onEnteringUserTooltip = async () => {

    var count = 0;
    if (this.props.object.category){
      count = await db.feedPostViews
                      .filter(feedPostView => feedPostView.category
                                                && feedPostView.category == this.props.object.category
                                                && feedPostView.initiator.url == this.props.object.initiator.url)
                      .count();
    }
    else{
      count = await db.feedPosts
                      .filter(feedPost => feedPost.author.url == this.props.object.feedPost.author.url)
                      .count();
    }

    this.setState({userTooltipContent: <span class="fw-light">{`${count} ${this.props.object.category ? this.props.object.category : "publications"}`} so far</span>});

  }

  onExitingUserTooltip = async () => {

    this.setState({userTooltipContent: <Spinner 
                            animation="border" 
                            size="sm"
                            variant="secondary" />});

  }

  async onReminderActionClick(){

    if (this.props.object.feedPost.reminder){

      // deleting the reminder
      await db.reminders
              .delete(this.props.object.feedPost.reminder.id);

      eventBus.dispatch(eventBus.POST_REMINDER_DELETED, this.props.object.id);

      this.registerUpdateEvent();

    }
    else{
      this.handleReminderModalShow();
    }

  }

  render(){
    return (
      <>
        <div class="d-flex text-body-secondary pt-3 border-bottom">
          <img 
            src={ (this.props.object.category 
                    ? (this.props.object.initiator.picture ? this.props.object.initiator.picture : linkedin_icon) 
                    : (this.props.object.feedPost.author.picture ? this.props.object.feedPost.author.picture : default_user_icon)) } 
            alt="twbs" 
            width="40" 
            height="40" 
            class="shadow rounded-circle flex-shrink-0 me-2"/>
          <p class="pb-3 mb-0 small lh-sm w-100">
            
              <div class="mb-2">
                <a 
                  class=/*d-block*/" text-gray-dark text-decoration-none text-secondary fst-italic mb-2 fw-bold" 
                  href={this.props.object.category 
                          ? (this.props.object.initiator.url ? this.props.object.initiator.url : appParams.LINKEDIN_FEED_URL())
                          : this.props.object.feedPost.author.url}>
                  <OverlayTrigger 
                    trigger="hover" 
                    placement="top" 
                    onEntering={this.onEnteringUserTooltip}
                    onExiting={this.onExitingUserTooltip}
                    overlay={<UpdatingPopover id="popover-contained">{this.state.userTooltipContent}</UpdatingPopover>}>
                    <span>
                      { this.props.object.category 
                          ? (this.props.object.initiator.name ? this.props.object.initiator.name : "Linkedin")
                          : this.props.object.feedPost.author.name } 
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
                overlay={<Tooltip id="tooltip1">{this.props.object.category ? categoryVerbMap[this.props.object.category]["en"] : "shared"}</Tooltip>}
              >
                <span class="mx-1">
                  <img class="mx-1" width="16" height="16" src={this.props.object.category ? categoryIconMap[this.props.object.category] : share_icon} alt=""/>
                </span>
              </OverlayTrigger>
              this <a href={`${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${this.props.object.uid}`} class="fst-italic">post</a>
              { this.props.object.category 
                  && <span class="ms-1"> 
                      of

                      <span 
                        class="badge align-items-center p-2 pe-2 text-secondary-emphasis border rounded-pill ms-1 py-1 shadow-sm">
                        <img 
                          class="rounded-circle me-1" 
                          width="14" 
                          height="14" 
                          src={this.props.object.feedPost.author.picture ? this.props.object.feedPost.author.picture : default_user_icon} 
                          alt=""/>
                        <a 
                          class="text-decoration-none text-muted"
                          href={this.props.object.feedPost.author.url}>
                          {this.props.object.feedPost.author.name}
                        </a>
                      </span>

                    </span>}

            </div>
            <div class="mt-3">
              <span class="border shadow-sm rounded p-1 text-muted">
                <span 
                  onClick={this.handlePostModalShow} 
                  class="handy-cursor mx-1 text-primary small"
                  title={`${this.state.postViewOccurences ? `${this.state.postViewOccurences.length} impression${this.state.postViewOccurences.length > 1 ? "s" : ""} |` : ""} see metrics`}>
                  {this.state.postViewOccurences ? `(${this.state.postViewOccurences.length})` : null}
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
                      class={"dropdown-item small handy-cursor " + (this.props.object.feedPost.reminder ? "text-danger" : "text-muted")} 
                      onClick={this.onReminderActionClick}>
                      { this.props.object.feedPost.reminder ? "Delete " : "Add "} reminder
                    </a>
                    </li>
                </ul>
              </div>

              { Object.hasOwn(this.props.object, "timeCount")
                  && <span class="badge bg-light-subtle border border-light-subtle text-light-emphasis rounded-pill">
                      {secondsToHms(this.props.object.timeCount, false)}
                    </span>}
            </div>
          </p>
        </div>

        {/*Modal*/}
        <Modal 
          show={this.state.postModalShow} 
          onHide={this.handlePostModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>

              { this.state.postModalShow 
                  && <FeedPostTrendLineChart
                      objects={this.state.postViewOccurences}
                      globalData={this.props.globalData}
                      metricValueFunction={getPostMetricValue}/> }

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handlePostModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <ReminderModal 
          object={this.props.object.feedPost} 
          show={this.state.reminderModalShow} 
          onHide={this.handleReminderModalClose} />

      </>
    );
  }
}
