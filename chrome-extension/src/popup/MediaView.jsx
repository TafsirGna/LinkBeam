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

function separateVideoAndImage(feedPost){

  var videoFeedPost = null,
      imageFeedPost = null;
      
  for (const medium of feedPost.media){

    if (medium.src){ // the medium is an image
      if (!imageFeedPost){
        imageFeedPost = {...feedPost};
        imageFeedPost.media = [medium];
      }
      else{
        imageFeedPost.media.push(medium);
      }
    }
    else{ // it's a video
      if (!videoFeedPost){
        videoFeedPost = {...feedPost};
        videoFeedPost.media = [medium];
      }
      else{
        videoFeedPost.media.push(medium);
      }
    }

  }
  return {videoFeedPost: videoFeedPost, imageFeedPost: imageFeedPost};
}

export default class MediaView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      allObjects: null,
      searchingMedia: false,
      searchText: null,
      toastShow: false,
      toastMessage: "",
      videoObjects: null,
      imageObjects: null, 
      viewIndex: 0,
    };

    this.searchMedia = this.searchMedia.bind(this);

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
              all: this.state.allObjects,
              video: this.state.videoObjects,
              image: this.state.imageObjects,
            };
          }
          this.setState({allObjects: null});
          return;
        }

        if (!data.searchText.replaceAll(/\s/g,"").length){

          if (objectsBackup){
            this.setState({
              allObjects: objectsBackup.all, 
              videoObjects: objectsBackup.video,
              imageObjects: objectsBackup.image,
              searchText: null,
            });
          }

        }
        else{

          this.setState({searchText: data.searchText}, async () => {

            var feedPostsByDate = {},
                videoFeedPostsByDate = {},
                imageFeedPostsByDate = {};

            for (var feedPost of data.results){

              if (!feedPost.media){
                continue;
              }

              feedPost.view = await db.feedPostViews
                                       .where({feedPostId: feedPost.id})
                                       .last(); 
              feedPost.bookmarked = (await db.bookmarks.where("url").anyOf([feedPost.author.url, encodeURI(feedPost.author.url), decodeURI(feedPost.author.url)]).first())
                                      || (feedPost.view.initiator
                                            && feedPostView.view.initiator.url
                                            && await db.bookmarks.where("url").anyOf([feedPost.view.initiator.url, encodeURI(feedPost.view.initiator.url), decodeURI(feedPost.view.initiator.url)]).first());

              if (!feedPost.view){
                continue;
              }

              var imgVideo = separateVideoAndImage(feedPost),
                  date = feedPost.view.date.split("T")[0];

              if (date in feedPostsByDate){
                feedPostsByDate[date].push(feedPost);
              }
              else{
                feedPostsByDate[date] = [feedPost];
              }

              // push a new feedPost object with a video
              if (imgVideo.videoFeedPost){
                if (date in videoFeedPostsByDate){
                  videoFeedPostsByDate[date].push(imgVideo.videoFeedPost);
                }
                else{
                  videoFeedPostsByDate[date] = [imgVideo.videoFeedPost];
                }
              }

              // push a new feedPost object with an image
              if (imgVideo.imageFeedPost){
                if (date in imageFeedPostsByDate){
                  imageFeedPostsByDate[date].push(imgVideo.imageFeedPost);
                }
                else{
                  imageFeedPostsByDate[date] = [imgVideo.imageFeedPost];
                }
              }

            }

            data.results = {
              all: [], 
              video: [],
              image: [],
            };

            for (const date of periodRange(new Date(this.props.globalData.settings.lastDataResetDate), LuxonDateTime.now().plus({days: 1}).toJSDate(), 1, LuxonDateTime, "days").toReversed()){
              
              data.results.all.push({
                date: date,
                feedPosts: date.toISO().split("T")[0] in feedPostsByDate 
                                ? feedPostsByDate[date.toISO().split("T")[0]] 
                                : [],
              });

              data.results.video.push({
                date: date,
                feedPosts: date.toISO().split("T")[0] in videoFeedPostsByDate 
                                        ? videoFeedPostsByDate[date.toISO().split("T")[0]] 
                                        : [],
              });

              data.results.image.push({
                date: date,
                feedPosts: date.toISO().split("T")[0] in imageFeedPostsByDate 
                                        ? imageFeedPostsByDate[date.toISO().split("T")[0]] 
                                        : [],
              });

            }

            this.setState({
              allObjects: data.results.all,
              videoObjects: data.results.video,
              imageObjects: data.results.image,
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

  toggleToastShow = (message = "", show = null) => {this.setState((prevState) => ({toastMessage: message, toastShow: (show || !prevState.toastShow)}));};

  searchMedia(){

    this.setState({searchingMedia: true}, async () => {

      var allObjects = null,
          imageObjects = null,
          videoObjects = null,
          newDate = null;

      if (!this.state.allObjects){

        newDate = LuxonDateTime.now();
        allObjects = [];
        imageObjects = [];
        videoObjects = [];

      }
      else{

        newDate = this.state.allObjects[this.state.allObjects.length - 1].date.minus({days: 1});
        allObjects = this.state.allObjects;
        videoObjects = this.state.videoObjects;
        imageObjects = this.state.imageObjects;

      }

      var feedPosts = [],
          videoFeedPosts = [],
          imageFeedPosts = [],
          feedPostViews = await db.feedPostViews
                                  .where("date")
                                  .startsWith(newDate.toISO().split("T")[0])
                                  .toArray();

      for (var feedPostView of feedPostViews){

        if (feedPosts.findIndex(f => f.id == feedPostView.feedPostId) != -1){
          continue;
        }

        var feedPost = await db.feedPosts.where({id: feedPostView.feedPostId}).first();

        if (feedPost.linkedPostId){
          const linkedPost = await db.feedPosts.where({id: feedPost.linkedPostId}).first();
          if (linkedPost 
                && linkedPost.media
                && feedPosts.findIndex(f => f.id == linkedPost.id) == -1){

            linkedPost.view = feedPostView;
            linkedPost.bookmarked = (await db.bookmarks.where("url").anyOf([linkedPost.author.url, encodeURI(linkedPost.author.url), decodeURI(linkedPost.author.url)]).first());

            feedPosts.push(linkedPost);

            var imgVideo = separateVideoAndImage(linkedPost);

            // push a new feedPost object with a video
            if (imgVideo.videoFeedPost){
              videoFeedPosts.push(imgVideo.videoFeedPost);
            }

            // push a new feedPost object with an image
            if (imgVideo.imageFeedPost){
              imageFeedPosts.push(imgVideo.imageFeedPost);
            }

          }
        }

        if (!feedPost.media){
          continue;
        }

        feedPost.view = feedPostView;
        feedPost.bookmarked = (await db.bookmarks.where("url").anyOf([feedPost.author.url, encodeURI(feedPost.author.url), decodeURI(feedPost.author.url)]).first())
                                || (feedPostView.initiator
                                      && feedPostView.initiator.url
                                      && await db.bookmarks.where("url").anyOf([feedPostView.initiator.url, encodeURI(feedPostView.initiator.url), decodeURI(feedPostView.initiator.url)]).first());
        feedPosts.push(feedPost);

        var imgVideo = separateVideoAndImage(feedPost);

        // push a new feedPost object with a video
        if (imgVideo.videoFeedPost){
          videoFeedPosts.push(imgVideo.videoFeedPost);
        }

        // push a new feedPost object with an image
        if (imgVideo.imageFeedPost){
          imageFeedPosts.push(imgVideo.imageFeedPost);
        }

      }

      allObjects.push({date: newDate, feedPosts: feedPosts});
      videoObjects.push({date: newDate, feedPosts: videoFeedPosts});
      imageObjects.push({date: newDate, feedPosts: imageFeedPosts});

      this.setState({
        allObjects: allObjects, 
        imageObjects: imageObjects,
        videoObjects: videoObjects,
        searchingMedia: false
      });

    })

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
              && <div class="text-center"><div class="mb-5 mt-5"><div class="spinner-border text-primary" role="status">
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
                        { this.state.allObjects && <span class="badge rounded-pill text-bg-secondary ms-2 shadow">{this.state.allObjects.map(o => o.feedPosts.length).reduce((acc, a) => acc + a, 0)}+</span>}
                      </a>
                    </li>
                    <li class="nav-item" onClick={() => {this.setViewIndex(1)}}>
                      <a class={`nav-link ${this.state.viewIndex == 1 ? "active" : ""}`} href="#">
                        Photos
                        { this.state.imageObjects && <span class="badge rounded-pill text-bg-secondary ms-2 shadow">{this.state.imageObjects.map(o => o.feedPosts.length).reduce((acc, a) => acc + a, 0)}+</span>}
                      </a>
                    </li>
                    <li class="nav-item" onClick={() => {this.setViewIndex(2)}}>
                      <a class={`nav-link ${this.state.viewIndex == 2 ? "active" : ""}`} href="#">
                        Videos
                        { this.state.videoObjects && <span class="badge rounded-pill text-bg-secondary ms-2 shadow">{this.state.videoObjects.map(o => o.feedPosts.length).reduce((acc, a) => acc + a, 0)}+</span>}
                      </a>
                    </li>
                    
                  </ul>

                  { this.state.viewIndex == 0 
                      && <MediaGridView
                          objects={this.state.allObjects}
                          globalData={this.props.globalData}/>}

                  { this.state.viewIndex == 1 
                      && <MediaGridView
                          objects={this.state.imageObjects}
                          globalData={this.props.globalData}/>}

                  { this.state.viewIndex == 2 
                      && <MediaGridView
                          objects={this.state.videoObjects}
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
                                                                                                                      <Popover.Header as="h3" dangerouslySetInnerHTML={{__html: highlightText(feedPost.author.name, this.state.searchText)}}>{/*{feedPost.author.name}*/}</Popover.Header>
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