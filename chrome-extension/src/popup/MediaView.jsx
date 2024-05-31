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
  insertHtmlTagsIntoEl,
  breakHtmlElTextContentByKeywords,
} from "./Local_library";
import { db } from "../db";
import eventBus from "./EventBus";
import { AlertCircleIcon } from "./widgets/SVGs";
import Masonry from "react-responsive-masonry";
import app_logo from '../assets/app_logo.png';
import PageTitleView from "./widgets/PageTitleView";
import { liveQuery } from "dexie"; 
import SeeMoreButtonView from "./widgets/SeeMoreButtonView";
import SearchInputView from "./widgets/SearchInputView";
import Carousel from 'react-bootstrap/Carousel';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import ReactDOM from 'react-dom/client';

var objectsBackup = null;

export default class MediaView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      objects: null,
      searchingMedia: false,
      searchText: null,
    };

    this.searchMedia = this.searchMedia.bind(this);

  }

  componentDidMount() {

    window.addEventListener('offline', function(e) {
      console.log('offline'); 
    });

    window.addEventListener('online', function(e) { 
      console.log('online');
    });

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

    eventBus.on(eventBus.SET_MATCHING_POSTS_DATA, async (data) => {

        if (!data){
          if (!objectsBackup){
            objectsBackup = this.state.objects;
          }
          this.setState({objects: null});
          return;
        }

        if (!data.searchText.replaceAll(/\s/g,"").length){

          if (objectsBackup){
            this.setState({objects: objectsBackup, searchText: null});
          }

        }
        else{

          this.setState({searchText: data.searchText});

          var feedPostsByDate = {};
          for (var feedPost of data.results){

            if (!feedPost.media){
              continue;
            }

            feedPost.view = await db.feedPostViews
                                     .where({feedPostId: feedPost.id})
                                     .last(); 

            if (!feedPost.view){
              continue;
            }

            if (feedPost.view.date.split("T")[0] in feedPostsByDate){
              feedPostsByDate[feedPost.view.date.split("T")[0]].push(feedPost);
            }
            else{
              feedPostsByDate[feedPost.view.date.split("T")[0]] = [feedPost];
            }

          }

          data.results = periodRange(new Date(this.props.globalData.settings.lastDataResetDate), new Date(), 1, LuxonDateTime, "days").map(date => {
            return {
              date: date,
              feedPosts: date.toISO().split("T")[0] in feedPostsByDate ? feedPostsByDate[date.toISO().split("T")[0]] : [],
            }
          });
          data.results.reverse();

          this.setState({objects: data.results});

        }

      }
    );

  }

  componentDidUpdate(prevProps, prevState){

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.SET_MATCHING_POSTS_DATA);

  }

  searchMedia(){

    this.setState({searchingMedia: true}, async () => {

      var objects = null,
          newDate = null;

      if (!this.state.objects){

        newDate = LuxonDateTime.now();
        objects = [];

      }
      else{

        newDate = this.state.objects[this.state.objects.length - 1].date.minus({days: 1});
        objects = this.state.objects;

      }

      var feedPosts = [];
      var feedPostViews = await db.feedPostViews
                                  .where("date")
                                  .startsWith(newDate.toISO().split("T")[0])
                                  .toArray();

      for (var feedPostView of feedPostViews){

        if (feedPosts.map(f => f.id).indexOf(feedPostView.feedPostId) != -1){
          continue;
        }

        var feedPost = await db.feedPosts.where({id: feedPostView.feedPostId}).first();
        if (!feedPost.media){
          continue;
        }

        feedPost.view = feedPostView;
        feedPosts.push(feedPost);

      }

      objects.push({date: newDate, feedPosts: feedPosts});
      this.setState({objects: objects, searchingMedia: false});

    })

  }

  highlightSearchText(textContent){

    if (!this.state.searchText || (this.state.searchText && !this.state.searchText.replaceAll(/\s/g,"").length)){
      return textContent;
    }

    var newNode = document.createElement('span');
    const keywords = [this.state.searchText];

    newNode = insertHtmlTagsIntoEl(
      newNode, 
      breakHtmlElTextContentByKeywords(textContent, keywords), 
      keywords, 
      ["text-bg-warning"], 
      {},
      (newDivTag, textItem, order, color) => {
        newDivTag.innerHTML = `<span class='border rounded shadow-sm bg-info-subtle text-muted border-primary' title='#${order}'>${textItem}</span>`;
      }
    );

    return newNode.innerHTML;

  }

  render(){
    return (
      <>
        <div class="col-8 offset-2 pb-5 mt-5">

          <div class="text-center">
            <img src={app_logo}  alt="" width="40" height="40"/>
            <PageTitleView pageTitle="Gallery"/>
          </div>

          { !this.state.objects 
              && <div class="text-center"><div class="mb-5 mt-5"><div class="spinner-border text-primary" role="status">
                            </div>
                            <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                          </div>
                        </div> }

          { this.state.objects
              && this.state.objects.map(o => o.feedPosts.length).reduce((acc, a) => acc + a, 0) == 0
              && <div class="text-center m-5 border shadow-lg rounded p-5">
                                  <AlertCircleIcon size="100" className="text-muted"/>
                                  <p><span class="badge text-bg-primary fst-italic shadow">No media yet</span></p>
                                </div> }

          { this.state.objects
              && this.state.objects.map(o => o.feedPosts.length).reduce((acc, a) => acc + a, 0) != 0
              && <div>

                  <div class="my-4">
                    <SearchInputView 
                      objectStoreName="media" 
                      globalData={this.props.globalData} />
                      { this.state.searchText 
                          && <p class="fst-italic small text-muted border rounded p-1 fw-light mx-1">
                              {`${this.state.objects ? this.state.objects.map(o => o.feedPosts.length).reduce((acc, a) => acc + a, 0) : 0} results for '${this.state.searchText}'`}
                            </p>}
                  </div>

                  <ul class="timeline mt-4 mx-2 small">
                    { this.state.objects.map(object => ( object.feedPosts.length == 0 
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
                                                                                                                                <Popover.Header as="h3" dangerouslySetInnerHTML={{__html: this.highlightSearchText(feedPost.author.name)}}>{/*{feedPost.author.name}*/}</Popover.Header>
                                                                                                                                {feedPost.text 
                                                                                                                                    && <Popover.Body dangerouslySetInnerHTML={{__html: this.highlightSearchText(feedPost.text)}}>
                                                                                                                                        {/*{feedPost.text}*/}
                                                                                                                                      </Popover.Body>}
                                                                                                                              </Popover>}
                                                                                                                    >
                                                                                                                    <a 
                                                                                                                      href={`${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${feedPost.view.uid}`} 
                                                                                                                      target="_blank" 
                                                                                                                      title="View on linkedin">
                                                                                                                      <div class="card shadow">
                                                                                                                        { feedPost.media.length == 1
                                                                                                                            && ((feedPost.media[0].src && feedPost.media[0].src.indexOf("data:image/") == -1) || !feedPost.media[0].src)
                                                                                                                            && <img 
                                                                                                                                src={feedPost.media[0].src ? feedPost.media[0].src : feedPost.media[0].poster} 
                                                                                                                                class="card-img-top" 
                                                                                                                                alt="..."/> }
                                                                                                                        { feedPost.media.length != 1
                                                                                                                            && <Carousel controls={false} indicators={false}>
                                                                                                                                  {feedPost.media.map(medium => (<Carousel.Item>
                                                                                                                                                                  { ((medium.src && medium.src.indexOf("data:image/") == -1) || !medium.src)  
                                                                                                                                                                    && <img 
                                                                                                                                                                    src={medium.src ? medium.src : medium.poster} 
                                                                                                                                                                    class="card-img-top" 
                                                                                                                                                                    alt="..."/>}
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
                </div>

                }

          { this.props.globalData.settings
              && this.props.globalData.settings.lastDataResetDate 
              && <SeeMoreButtonView
                      showSeeMoreButton = { !this.state.searchingMedia 
                                              && (!this.state.objects || (this.state.objects && this.state.objects[this.state.objects.length - 1].date.toJSDate() > new Date(this.props.globalData.settings.lastDataResetDate)))
                                              && !this.state.searchText }
                      seeMore={this.searchMedia}
                      showLoadingSpinner={this.state.searchingMedia}
                      onSeeMoreButtonVisibilityChange={(isVisible) => { if (isVisible) { this.searchMedia() } }}/>}

        </div>
      </>
    );
  }
}