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
} from "./Local_library";
import { db } from "../db";
import eventBus from "./EventBus";
import { AlertCircleIcon } from "./widgets/SVGs";
import Masonry from "react-responsive-masonry";
import app_logo from '../assets/app_logo.png';
import PageTitleView from "./widgets/PageTitleView";
import { liveQuery } from "dexie"; 
import SeeMoreButtonView from "./widgets/SeeMoreButtonView";

export default class MediaView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      objects: null,
      searchingMedia: false,
    };

    this.searchMedia = this.searchMedia.bind(this);

  }

  componentDidMount() {

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

  }

  componentDidUpdate(prevProps, prevState){

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
        if (!feedPost.media || (feedPost.media && !feedPost.media.length)){
          continue;
        }
        feedPosts.push(feedPost);

      }

      objects.push({date: newDate, feedPosts: feedPosts});
      console.log("eeeeeeeeeeeeeeeeeeeeeeeeeee : ", {date: newDate.toISO().split("T")[0], feedPosts: feedPosts});
      this.setState({objects: objects, searchingMedia: false});

    })

  }

  componentWillUnmount(){

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
              && this.state.objects.length == 0
              && <div class="text-center m-5">
                                  <AlertCircleIcon size="100" className="text-muted"/>
                                  <p><span class="badge text-bg-primary fst-italic shadow">No media yet</span></p>
                                </div> }

          { this.state.objects
              && this.state.objects.length != 0
              && <ul class="timeline mt-4 mx-2 small">
                    { this.state.objects.map(object => ( object.feedPosts.length == 0 
                                                          ? null
                                                          : <li class="timeline-item mb-5 small">
                                                              { <p class="text-muted mb-2 fw-light">{object.date.toFormat("MMMM dd, yyyy")}</p>}
                                                              { <div class="p-2">

                                                                  { object.feedPosts
                                                                      && <Masonry columnsCount={3} gutter="10px">

                                                                            { object.feedPosts.map(feedPost => (/*<div class="col">*/
                                                                                                                  <div class="card shadow">
                                                                                                                    <img 
                                                                                                                      src={feedPost.media[0].src ? feedPost.media[0].src : feedPost.media[0].poster} 
                                                                                                                      class="card-img-top" 
                                                                                                                      alt="..."/>
                                                                                                                    {/*<div class="card-body">
                                                                                                                      <h5 class="card-title">Card title</h5>
                                                                                                                      <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                                                                                                                    </div>
                                                                                                                    <div class="card-footer">
                                                                                                                      <small class="text-body-secondary">Last updated 3 mins ago</small>
                                                                                                                    </div>*/}
                                                                                                                  </div>
                                                                                                                /*</div>*/)) }

                                                                          </Masonry> }

                                                                </div>}
                                                            </li>

                      )) }
                  </ul> 

                }

          { this.props.globalData.settings
              && this.props.globalData.settings.lastDataResetDate 
              && <SeeMoreButtonView
                      showSeeMoreButton = { !this.state.searchingMedia 
                                              && (!this.state.objects || (this.state.objects && this.state.objects[this.state.objects.length - 1].date.toJSDate() > new Date(this.props.globalData.settings.lastDataResetDate)))}
                      seeMore={this.searchMedia}
                      showLoadingSpinner={this.state.searchingMedia}
                      onSeeMoreButtonVisibilityChange={(isVisible) => { if (isVisible) { this.searchMedia() } }}/>}

        </div>
      </>
    );
  }
}