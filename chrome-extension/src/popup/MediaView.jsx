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

/*import './MediaView.css'*/
import React from 'react';
import { DateTime as LuxonDateTime } from "luxon";
import { 
  appParams,
  setGlobalDataSettings, 
  periodRange,
  highlightText,
  hexToRgb,
  allUrlCombinationsOf,
} from "./Local_library";
import { db } from "../db";
import eventBus from "./EventBus";
import { AlertCircleIcon } from "./widgets/SVGs";
import Masonry from "react-responsive-masonry";
import app_logo from '../assets/app_logo.png';
import PageTitleView from "./widgets/PageTitleView";
import { liveQuery } from "dexie"; 
import SeeMoreButtonView from "./widgets/SeeMoreButtonView";
import ImageLoader from "./widgets/ImageLoader";
import SearchInputView from "./widgets/SearchInputView";
import Carousel from 'react-bootstrap/Carousel';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import ReactDOM from 'react-dom/client';
import CustomToast from "./widgets/toasts/CustomToast";

var objectsBackup = null;

export default class MediaView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      allObjects: null,
      searchingMedia: false,
      searchText: null,
      toastShow: false,
      toastMessage: "",
      viewIndex: 0,
    };

    this.searchMedia = this.searchMedia.bind(this);
    this.addFeedPostViewSubscription = this.addFeedPostViewSubscription.bind(this);
    this.deleteFeedPostViewSubscription = this.deleteFeedPostViewSubscription.bind(this);
    this.getFeedPosts = this.getFeedPosts.bind(this);
    this.onFeedPostViewSubscriptionTrigger = this.onFeedPostViewSubscriptionTrigger.bind(this);

  }

  componentDidMount() {

    window.addEventListener('offline', (function(e) {
          console.log('offline'); 
          this.toggleToastShow("You're offline", true);
        }).bind(this));

    window.addEventListener('online', (function(e) { 
          console.log('online');
          this.toggleToastShow("You're online", true);
        }).bind(this));

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

    eventBus.on(eventBus.SET_MATCHING_POSTS_DATA, async (data) => {

        if (!data){
          if (!objectsBackup){
            objectsBackup = {
              all: this.state.allObjects
            };
          }
          this.setState({allObjects: null});
          return;
        }

        if (!data.searchText.replaceAll(/\s/g,"").length){

          if (objectsBackup){
            this.setState({
              allObjects: objectsBackup.all, 
              searchText: null,
            }, () => {
              if (!this.feedPostViewSubscription){
                this.addFeedPostViewSubscription();
              }
            });
          }

        }
        else{

          // Stop listening the the database changes for today
          this.deleteFeedPostViewSubscription();

          this.setState({searchText: data.searchText}, async () => {

            var feedPostsByDate = {};

            for (var feedPost of data.results){

              if (!feedPost.media){
                continue;
              }

              feedPost.view = await db.feedPostViews
                                       .where({feedPostId: feedPost.uniqueId})
                                       .last(); 

              if (!feedPost.view){ // if it's a subpost
                const post = await db.feedPosts
                                        .where({linkedPostId: feedPost.uniqueId})
                                        .first();
                // if (!post) { console.error("{{{{{{{{{{{ : ", feedPost); continue; }
                feedPost.view = await db.feedPostViews
                                        .where({feedPostId: post.uniqueId})
                                        .last();
              }

              feedPost.view.profile = feedPost.view.profileId
                                        ? await db.feedProfiles.where({uniqueId: feedPost.view.profileId}).first()
                                        : null;

              feedPost.bookmarked = (await db.bookmarks.where("url")
                                                       .anyOf(allUrlCombinationsOf(feedPost.profile.url))
                                                       .first())
                                      || (feedPost.view.profile
                                            && feedPost.view.profile.url
                                            && await db.bookmarks.where("url")
                                                                 .anyOf(allUrlCombinationsOf(feedPost.view.profile.url))
                                                                 .first());

              const date = feedPost.view.date.split("T")[0];

              if (date in feedPostsByDate){
                feedPostsByDate[date].push(feedPost);
              }
              else{
                feedPostsByDate[date] = [feedPost];
              }

            }

            data.results = {
              all: [], 
            };

            for (const date of periodRange(new Date(this.props.globalData.settings.lastDataResetDate), LuxonDateTime.now().plus({days: 1}).toJSDate(), 1, LuxonDateTime, "days").toReversed()){
              
              data.results.all.push({
                date: date,
                feedPosts: date.toISO().split("T")[0] in feedPostsByDate 
                                ? feedPostsByDate[date.toISO().split("T")[0]] 
                                : [],
              });

            }

            this.setState({
              allObjects: data.results.all,
            });

          });

        }

      }
    );

  }

  componentDidUpdate(prevProps, prevState){

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.SET_MATCHING_POSTS_DATA);

  }

  addFeedPostViewSubscription(){

    this.feedPostViewSubscription = liveQuery(() => db.feedPostViews
                                                      .filter(feedPostView => feedPostView.date.startsWith(LuxonDateTime.now().toISO().split("T")[0]))
                                                      .toArray()).subscribe(
      result => this.onFeedPostViewSubscriptionTrigger(result),
      error => this.setState({error})
    );

  }

  deleteFeedPostViewSubscription(){

    if (this.feedPostViewSubscription) {
      this.feedPostViewSubscription.unsubscribe();
      this.feedPostViewSubscription = null;
    }

  }

  async onFeedPostViewSubscriptionTrigger(feedPostViews){

    var allObjects = this.state.allObjects;
    const index = allObjects.findIndex(o => o.date.toISO().split("T")[0] == LuxonDateTime.now().toISO().split("T")[0]);
    allObjects[index].feedPosts = (await this.getFeedPosts(feedPostViews));

    this.setState({allObjects: allObjects});

  }

  toggleToastShow = (message = "", show = null) => {this.setState((prevState) => ({toastMessage: message, toastShow: (show || !prevState.toastShow)}));};

  searchMedia(){

    this.setState({searchingMedia: true}, async () => {

      var allObjects = null,
          newDate = null;

      if (!this.state.allObjects){
        newDate = LuxonDateTime.now();
        allObjects = [];
      }
      else{
        newDate = this.state.allObjects[this.state.allObjects.length - 1].date.minus({days: 1});
        allObjects = this.state.allObjects;
      }

      const feedPostViews = await db.feedPostViews
                                  .where("date")
                                  .startsWith(newDate.toISO().split("T")[0])
                                  .toArray(); 

      allObjects.push({date: newDate, feedPosts: (await this.getFeedPosts(feedPostViews))});

      this.setState({
        allObjects: allObjects, 
        searchingMedia: false
      }, () => {
        if (!this.feedPostViewSubscription){
          this.addFeedPostViewSubscription();
        }
      });

    })

  }

  async addLinkedPostToList(feedPost, feedPosts){

    const linkedPost = await db.feedPosts.where({uniqueId: feedPost.linkedPostId}).first();
    if (linkedPost 
          && linkedPost.media
          && feedPosts.findIndex(f => f.uniqueId == linkedPost.uniqueId) == -1){

      linkedPost.view = feedPost.view;
      linkedPost.profile = await db.feedProfiles.where({uniqueId: linkedPost.profileId}).first();
      linkedPost.bookmarked = (await db.bookmarks.where("url").anyOf(allUrlCombinationsOf(linkedPost.profile.url)).first());

      feedPosts.push(linkedPost);

    }

  }

  async getFeedPosts(feedPostViews){

    var feedPosts = [];

    for (const feedPostView of feedPostViews){

      if (feedPosts.findIndex(f => f.uniqueId == feedPostView.feedPostId) != -1){
        continue;
      }

      feedPostView.profile = feedPostView.profileId
                                ? await db.feedProfiles.where({uniqueId: feedPostView.profileId}).first()
                                : null;
      var feedPost = await db.feedPosts.where({uniqueId: feedPostView.feedPostId}).first();
      feedPost.view = feedPostView;

      if (feedPost.linkedPostId){
        await this.addLinkedPostToList(feedPost, feedPosts);
      }

      if (!feedPost.media){
        continue;
      }

      feedPost.profile = await db.feedProfiles.where({uniqueId: feedPost.profileId}).first();
      feedPost.bookmarked = (await db.bookmarks.where("url").anyOf(allUrlCombinationsOf(feedPost.profile.url)).first())
                              || (feedPostView.profile
                                    && feedPostView.profile.url
                                    && await db.bookmarks.where("url").anyOf(allUrlCombinationsOf(feedPostView.profile.url)).first());
      feedPosts.push(feedPost);

    }

    return feedPosts;

  }

  setViewIndex = index => this.setState({viewIndex: index})

  render(){
    return (
      <>
        <div class="col-8 offset-2 pb-5 mt-5">

          <div class="text-center">
            <img src={app_logo}  alt="" width="40" height="40"/>
            <PageTitleView pageTitle="Gallery"/>
          </div>

          { !this.state.allObjects 
              && <div class="text-center">
                  <div class="mb-5 mt-5">
                    <div class="spinner-border text-primary" role="status">
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                  </div>
                </div> }

          { this.state.allObjects
              && this.state.allObjects.map(o => o.feedPosts.length).reduce((acc, a) => acc + a, 0) == 0
              && <div class="text-center m-5 border shadow-lg rounded p-5">
                                  <AlertCircleIcon size="100" className="text-muted"/>
                                  <p><span class="badge text-bg-primary fst-italic shadow-sm">No media yet</span></p>
                                </div> }

          { this.state.allObjects
              && this.state.allObjects.map(o => o.feedPosts.length).reduce((acc, a) => acc + a, 0) != 0
              && <div>

                  <div class="my-4">
                    <SearchInputView 
                      objectStoreName="media" 
                      globalData={this.props.globalData} />
                      { this.state.searchText 
                          && <p class="fst-italic small text-muted border rounded p-1 fw-light mx-1">
                              {`${this.state.allObjects ? this.state.allObjects.map(o => o.feedPosts.length).reduce((acc, a) => acc + a, 0) : 0} results for '${this.state.searchText}'`}
                            </p>}
                  </div>

                  <ul class="nav nav-underline small ms-2">
                    <li class="nav-item" onClick={() => {this.setViewIndex(0)}}>
                      <a class={`nav-link ${this.state.viewIndex == 0 ? "active" : ""}`} aria-current="page" href="#">
                        All
                        { this.state.allObjects 
                            && <span class="badge rounded-pill text-bg-secondary ms-2 shadow">
                                {this.state.allObjects.map(o => o.feedPosts.length).reduce((acc, a) => acc + a, 0)}+
                              </span>}
                      </a>
                    </li>
                    <li class="nav-item" onClick={() => {this.setViewIndex(1)}}>
                      <a class={`nav-link ${this.state.viewIndex == 1 ? "active" : ""}`} href="#">
                        Photos
                        { this.state.allObjects 
                            && <span class="badge rounded-pill text-bg-secondary ms-2 shadow">
                                {this.state.allObjects.map(o => o.feedPosts.filter(feedPost => feedPost.media.filter(medium => medium.src).length))
                                                      .reduce((acc, a) => acc.concat(a), [])
                                                      .length}+
                              </span>}
                      </a>
                    </li>
                    <li class="nav-item" onClick={() => {this.setViewIndex(2)}}>
                      <a class={`nav-link ${this.state.viewIndex == 2 ? "active" : ""}`} href="#">
                        Videos
                        { this.state.allObjects 
                            && <span class="badge rounded-pill text-bg-secondary ms-2 shadow">
                                {this.state.allObjects.map(o => o.feedPosts.filter(feedPost => feedPost.media.filter(medium => medium.poster).length))
                                                      .reduce((acc, a) => acc.concat(a), [])
                                                      .length}+
                              </span>}
                      </a>
                    </li>
                    
                  </ul>

                  { this.state.viewIndex == 0 
                      && <MediaGridView
                          objects={this.state.allObjects}
                          globalData={this.props.globalData}/>}

                  { this.state.viewIndex == 1 
                      && <MediaGridView
                          objects={this.state.allObjects.map(o => ({ ...o, feedPosts: o.feedPosts.filter(feedPost => feedPost.media.filter(medium => medium.src).length) }))}
                          globalData={this.props.globalData}/>}

                  { this.state.viewIndex == 2 
                      && <MediaGridView
                          objects={this.state.allObjects.map(o => ({ ...o, feedPosts: o.feedPosts.filter(feedPost => feedPost.media.filter(medium => medium.poster).length) }))}
                          globalData={this.props.globalData}/>}

                </div>

                }

          { this.props.globalData.settings
              && this.props.globalData.settings.lastDataResetDate 
              && <SeeMoreButtonView
                      showSeeMoreButton = { !this.state.searchingMedia 
                                              && (!this.state.allObjects || (this.state.allObjects && this.state.allObjects[this.state.allObjects.length - 1].date.toJSDate() > new Date(this.props.globalData.settings.lastDataResetDate)))
                                              && !this.state.searchText }
                      seeMore={this.searchMedia}
                      showLoadingSpinner={this.state.searchingMedia}
                      onSeeMoreButtonVisibilityChange={(isVisible) => { if (isVisible) { this.searchMedia() } }}/>}

        </div>

        {/*Toasts*/}
        <CustomToast 
          globalData={this.props.globalData} 
          message={this.state.toastMessage} 
          show={this.state.toastShow} 
          onClose={this.toggleToastShow} />
      </>
    );
  }
}







class MediaGridView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  render(){
    return (
      <>  
        <ul class="timeline mt-4 mx-2 small">
          { this.props.objects.map(object => ( object.feedPosts.length == 0 
                                                ? null
                                                : <li class="timeline-item mb-5">
                                                    { <p class="mb-2 fst-italic">{object.date.toFormat("MMMM dd, yyyy")}</p>}
                                                    { <div class="p-2">

                                                        { object.feedPosts
                                                            && <Masonry columnsCount={3} gutter="10px">

                                                                  { object.feedPosts.toSorted((a, b) => {
                                                                                                if (new Date(a.view.date) < new Date(b.view.date)){
                                                                                                  return 1;
                                                                                                }
                                                                                                else if (new Date(a.view.date) > new Date(b.view.date)){
                                                                                                  return -1;
                                                                                                }
                                                                                                else{
                                                                                                  return 0;
                                                                                                }
                                                                                              }).map(feedPost => (
                                                                                                        <OverlayTrigger 
                                                                                                          trigger="hover" 
                                                                                                          placement="left" 
                                                                                                          overlay={<Popover id="popover-basic">
                                                                                                                      <Popover.Header 
                                                                                                                        as="h3" 
                                                                                                                        dangerouslySetInnerHTML={{__html: `${highlightText(feedPost.profile.name, this.state.searchText)} <span class="shadow-sm  badge bg-secondary-subtle border border-secondary-subtle text-info-emphasis rounded-pill">${feedPost.media[0].src ? "Image" : "Video"}</span>`}}>
                                                                                                                          {/*{feedPost.profile.name}*/}
                                                                                                                      </Popover.Header>
                                                                                                                      {feedPost.innerContentHtml 
                                                                                                                          && <Popover.Body dangerouslySetInnerHTML={{__html: feedPost.innerContentHtml /*highlightText(feedPost.innerContentHtml, this.state.searchText)*/}}>
                                                                                                                              {}
                                                                                                                            </Popover.Body>}
                                                                                                                    </Popover>}
                                                                                                          >
                                                                                                          <a 
                                                                                                            href={`${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${feedPost.uid || feedPost.view.uid}`} 
                                                                                                            target="_blank" 
                                                                                                            title="View on linkedin">
                                                                                                            <div 
                                                                                                              class={`card shadow`} 
                                                                                                              style={feedPost.bookmarked ? {border: `4px solid ${hexToRgb(this.props.globalData.settings.postHighlightColor, "string")}`} : null}>
                                                                                                              { feedPost.media.length == 1
                                                                                                                  && ((feedPost.media[0].src && feedPost.media[0].src.indexOf("data:image/") == -1) || !feedPost.media[0].src)
                                                                                                                  && <ImageLoader
                                                                                                                        imgSrc={feedPost.media[0].src || feedPost.media[0].poster} 
                                                                                                                        imgClass="card-img-top"
                                                                                                                        spinnerSize="small" /> }
                                                                                                              { feedPost.media.length != 1
                                                                                                                  && <Carousel controls={false} indicators={false}>
                                                                                                                        {feedPost.media.map(medium => (<Carousel.Item>
                                                                                                                                                        { ((medium.src && medium.src.indexOf("data:image/") == -1) || !medium.src)  
                                                                                                                                                          && <ImageLoader 
                                                                                                                                                              imgSrc={medium.src || medium.poster} 
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

                                                                </Masonry> }

                                                      </div>}
                                                  </li>

            )) }
        </ul>
      </>
    );
  }
}