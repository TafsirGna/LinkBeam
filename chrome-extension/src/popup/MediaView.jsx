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
import { appParams } from "./Local_library";
import { db } from "../db";
import eventBus from "./EventBus";
import { AlertCircleIcon } from "./widgets/SVGs";
import Masonry from "react-responsive-masonry";
import app_logo from '../assets/app_logo.png';
import PageTitleView from "./widgets/PageTitleView";

export default class MediaView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      objects: null,
    };

    this.searchMedia = this.searchMedia.bind(this);

  }

  componentDidMount() {

    this.searchMedia();

  }

  async searchMedia(){

    var objects = null;
    if (!this.state.objects){
      objects = [{date: new Date().toISOString().split("T")[0], feedPosts: null}];
    }
    else{
      const newDate = LuxonDateTime.fromISO(this.state.objects[this.state.objects.length - 1].date).minus({days: 1}).toJSDate().toISOString().split("T")[0];
      objects = this.state.objects.concat([{date: newDate, feedPosts: null}]);
    }

    var feedPosts = [];
    var feedPostViews = await db.feedPostViews
                                .where("date")
                                .startsWith(objects[objects.length - 1].date)
                                .toArray();

    for (var feedPostView of feedPostViews){

      if (feedPosts.map(f => f.id).indexOf() != -1){
        continue;
      }

      var feedPost = await db.feedPosts.where({id: feedPostView.feedPostId}).first();
      if (!feedPost.media || (feedPost.media && !feedPost.media.length)){
        continue;
      }
      feedPosts.push(feedPost);

    }

    objects[objects.length - 1].feedPosts = feedPosts;
    this.setState({objects: objects});

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
              && <ul class="timeline mt-4 mx-2 small">
                    { this.state.objects.map(object => (
                                                        <li class="timeline-item mb-5 small">
                                                          { <p class="text-muted mb-2 fw-light">{LuxonDateTime.fromISO(object.date).toFormat("MMMM dd, yyyy")}</p>}
                                                          { <div class="p-2">

                                                              { !object.feedPosts
                                                                  && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                                                                        </div>
                                                                        <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                                                                      </div>
                                                                    </div> }

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
                  </ul> }

        </div>
      </>
    );
  }
}