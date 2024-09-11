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

/*import './FeedVisitDataView.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import beaver_icon from '../assets/beaver_icon.png';
import { 
  GridIcon,
  DuplicateIcon,
  BoltIcon,
} from "./widgets/SVGs";
import { OverlayTrigger, Tooltip as ReactTooltip,  } from "react-bootstrap";
import {  
  appParams,
  secondsToHms,
  getVisitsTotalTime,
  getHashtagText,
  isReferenceHashtag,
  allUrlCombinationsOf,
  extractHashtags,
  hashtagFeedPosts,
  extractFeedPosts,
} from "./Local_library";
import PageTitleView from "./widgets/PageTitleView";
import eventBus from "./EventBus";
import linkedin_icon from '../assets/linkedin_icon.png';
import { DateTime as LuxonDateTime } from "luxon";
import { db } from "../db";
import Popover from 'react-bootstrap/Popover';
import ImageLoader from "./widgets/ImageLoader";
import Masonry from "react-responsive-masonry";
import Carousel from 'react-bootstrap/Carousel';
import ActivityListView from "./widgets/Lists/ActivityListView";

export default class FeedVisitDataView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      viewIndex: 0,
      visit: {
        feedPostViews: [],
      },
      feedPosts: null,
      hashtags: null,
    };

    this.setVisit = this.setVisit.bind(this);
    this.setFeedPosts = this.setFeedPosts.bind(this);
  }

  componentDidMount(){

    if (this.props.context == "modal"){
      (async () => {
        this.setVisit(this.props.object);
      }).bind(this)();
      return;
    }

    // const urlParams = new URLSearchParams(window.location.search);
    const visitId = (new URLSearchParams(window.location.search)).get("visitId");

    if (!visitId){
      return;
    }

    (async () => {
      this.setVisit({
        ...(await db.visits.where({uniqueId: visitId}).first()),
        feedPostViews: (await db.feedPostViews.where({visitId: visitId}).toArray()),
      });
    }).bind(this)();

  }

  componentDidUpdate(prevProps, prevState){
    if (prevProps.object != this.props.object){
      (async () => {
        this.setVisit(this.props.object);
      }).bind(this)();
    }
  }

  setViewIndex = index => this.setState({viewIndex: index})

  setVisit(visit){
    this.setState({
        visit: visit,
      },() => {
        this.setFeedPosts();
      }
    );
  }

  async setFeedPosts(){

    const feedPosts = await extractFeedPosts(this.state.visit.feedPostViews, db);

    this.setState({
      feedPosts: feedPosts,
      hashtags: extractHashtags(this.state.visit.feedPostViews).map(hashtag => {
                                                                  hashtag.feedPosts = hashtagFeedPosts(hashtag, this.state.visit.feedPostViews);
                                                                  return hashtag;
                                                                })
                                                               .toSorted((a, b) => b.feedPosts.length - a.feedPosts.length),
    });

  }

  render(){
    return (
      <>
        <div class={this.props.context != "modal" ? "mt-5 pb-5 pt-3" : ""}>

            { this.props.context != "modal"
                && <div class="text-center">
                    <img src={app_logo}  alt="" width="40" height="40"/>
                    <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.FEED_VISIT}/>
                  </div>}

          <div class={this.props.context != "modal" ? "offset-2 col-8 mt-4" : ""}>
            
            <div class="d-flex gap-5 p-4 border rounded shadow-sm">
              <img src={ linkedin_icon } alt="twbs" width="100" height="100" class="shadow rounded flex-shrink-0"/>
              <div class="d-flex align-items-center">
                <div>
                  { this.state.visit.uniqueId
                      && <div>
                          <div>
                            { LuxonDateTime.fromISO(this.state.visit.date).toFormat('MMMM dd yyyy, hh:mm a') } 
                            {" - "} 
                            {LuxonDateTime.fromMillis(Math.max(
                                                                (LuxonDateTime.fromISO(this.state.visit.date).toMillis() + (getVisitsTotalTime(this.state.visit.feedPostViews.filter(view => view.visitId == this.state.visit.uniqueId)) * 60000)), 
                                                                LuxonDateTime.fromISO(this.state.visit.feedPostViews[this.state.visit.feedPostViews.length - 1].date)
                                                                             .toMillis()
                                                              ))
                                          .toFormat('MMMM dd yyyy, hh:mm a')}
                          </div> 
                          <div class="text-muted">{secondsToHms(getVisitsTotalTime(this.state.visit.feedPostViews.filter(view => view.visitId == this.state.visit.uniqueId)) * 60)}</div>
                        </div>}
                  <div class="text-muted fst-italic">{this.state.visit.feedPostViews.length} posts</div>
                  { this.state.visit.automated
                      && <div class="mt-2">
                            <span class="badge bg-success-subtle border border-success-subtle text-success-emphasis rounded-pill">
                              Browsed for me
                              <span class="mx-2">
                                <BoltIcon
                                  size="12"
                                  className=""/>
                              </span>
                            </span>
                          </div>}
                </div>
              </div>
            </div>

            <ul class="nav nav-underline small ms-2 mt-4">
              <li class="nav-item" onClick={() => {this.setViewIndex(0)}}>
                <a class={`nav-link ${this.state.viewIndex == 0 ? "active" : ""}`} aria-current="page" href="#">
                  Posts
                  <span class="badge rounded-pill text-bg-secondary ms-2 shadow">
                    {this.state.visit.feedPostViews.length}+
                  </span>
                </a>
              </li>
              <li class="nav-item" onClick={() => {this.setViewIndex(1)}}>
                <a class={`nav-link ${this.state.viewIndex == 1 ? "active" : ""}`} href="#">
                  Media
                  <span class="badge rounded-pill text-bg-secondary ms-2 shadow">
                    {this.state.feedPosts?.filter(feedPost => feedPost.media)
                                         .reduce((acc, a) => acc.concat(a), [])
                                         .length}+
                  </span>
                </a>
              </li>
              <li class="nav-item" onClick={() => {this.setViewIndex(2)}}>
                <a class={`nav-link ${this.state.viewIndex == 2 ? "active" : ""}`} href="#">
                  Hashtags
                  <span class="badge rounded-pill text-bg-secondary ms-2 shadow">
                    {this.state.hashtags ? this.state.hashtags.length : 0}+
                  </span>
                </a>
              </li>
              
            </ul>

            { this.state.viewIndex == 0 
                && <FeedVisitPostsView
                    objects={this.state.feedPosts}
                    globalData={this.props.globalData}/>}

            { this.state.viewIndex == 1 
                && <FeedVisitMediaView
                    objects={this.state.feedPosts}
                    globalData={this.props.globalData}/>}

            { this.state.viewIndex == 2 
                && <FeedVisitHashtagsView
                    objects={this.state.hashtags}/>}

          </div>

      </div>
    </>
    );
  }
}

function FeedVisitPostsView(props){
  return <>

      { !props.objects 
          && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                  {/*<span class="visually-hidden">Loading...</span>*/}
                </div>
                <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
              </div>
            </div>}

      { props.objects 
          && <div class="mt-4">
                {<ActivityListView 
                  objects={props.objects.map(feedPost => ({
                    author: feedPost.profile,
                    url: `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${feedPost.view.htmlElId}`,
                    // date: views.length ? views[0].date : null,
                    text: feedPost.innerContentHtml,
                    media: feedPost.media,
                    category: feedPost.view.category,
                    initiator: feedPost.view.profile,
                    htmlElId: feedPost.view.htmlElId,
                  }))}
                  variant="stacking"
                  context="feed visit"/>}
            </div>}

    </>;
}

function FeedVisitMediaView(props){
  return <>

          { !props.objects 
              && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                  </div>
                </div>}

          { props.objects
              && <Masonry columnsCount={3} gutter="10px" className="mt-4">
          
                      { props.objects.filter(feedPost => feedPost.media)
                                     .toSorted((a, b) => {
                                                    if (new Date(a.view.date) < new Date(b.view.date)){
                                                      return 1;
                                                    }
                                                    else if (new Date(a.view.date) > new Date(b.view.date)){
                                                      return -1;
                                                    }
                                                    else{
                                                      return 0;
                                                    }
                                                  })
                                     .map(feedPost => (<OverlayTrigger 
                                                        trigger="hover" 
                                                        placement="left" 
                                                        overlay={<Popover id="popover-basic">
                                                                    <Popover.Header 
                                                                      as="h3">
                                                                      {feedPost.profile.name}
                                                                      <span class="shadow-sm mx-2 badge bg-secondary-subtle border border-secondary-subtle text-info-emphasis rounded-pill">{feedPost.media[0].src ? "Image" : "Video"}</span>
                                                                    </Popover.Header>
                                                                    {feedPost.innerContentHtml 
                                                                        && <Popover.Body dangerouslySetInnerHTML={{__html: feedPost.innerContentHtml}}>
                                                                            {}
                                                                          </Popover.Body>}
                                                                  </Popover>}
                                                        >
                                                        <a 
                                                          href={`${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${feedPost.htmlElId || feedPost.view.htmlElId}`} 
                                                          target="_blank" 
                                                          title="View on linkedin">
                                                          <div 
                                                            class={`card shadow`} 
                                                            style={feedPost.bookmarked ? {border: `4px solid ${hexToRgb(this.props.globalData.settings.postHighlightColor, "string")}`} : null}>
                                                            { feedPost.media.length == 1
                                                                && ((feedPost.media[0].src && feedPost.media[0].src.indexOf("data:image/") == -1) || !feedPost.media[0].src)
                                                                && <ImageLoader
                                                                      imgSrc={feedPost.media[0].src ? feedPost.media[0].src : feedPost.media[0].poster} 
                                                                      imgClass="card-img-top"
                                                                      spinnerSize="small" /> }
                                                            { feedPost.media.length != 1
                                                                && <Carousel controls={false} indicators={false}>
                                                                      {feedPost.media.map(medium => (<Carousel.Item>
                                                                                                      { ((medium.src && medium.src.indexOf("data:image/") == -1) || !medium.src)  
                                                                                                        && <ImageLoader 
                                                                                                            imgSrc={medium.src ? medium.src : medium.poster} 
                                                                                                            imgClass="card-img-top"
                                                                                                            spinnerSize="small"/>}
                                                                                                    </Carousel.Item>))}
                                                                  </Carousel>}
                                                            {/*<div class="card-body">
                                                              <h5 class="card-title">Card title</h5>
                                                              <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                                                            </div>
                                                            <div class="card-footer">
                                                              <small class="text-body-secondary">Last updated 3 mins ago</small>
                                                            </div>*/}
                                                          </div>
                                                        </a>
                                                      </OverlayTrigger>
                                                    )) }
          
                    </Masonry>}

    </>;
}

function FeedVisitHashtagsView(props){
  return <>
            <div class="mt-4">

              { !props.objects 
                && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                        {/*<span class="visually-hidden">Loading...</span>*/}
                      </div>
                      <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                    </div>
                  </div>}

              { props.objects 
                  && props.objects
                          .map(object => <OverlayTrigger
                                          placement="top"
                                          overlay={<ReactTooltip id="tooltip1">{`${object.feedPosts.length} post${object.feedPosts.length > 1 ? "s" : ""} associated`}</ReactTooltip>}
                                        >
                                        <span 
                                          class={/*handy-cursor */`mx-2 badge bg-secondary-subtle border-secondary-subtle text-secondary-emphasis border rounded-pill`}>
                                          {`${getHashtagText(object.text)} (${object.feedPosts.length})`}
                                        </span>
                                        </OverlayTrigger>) }

          </div>

    </>;
}