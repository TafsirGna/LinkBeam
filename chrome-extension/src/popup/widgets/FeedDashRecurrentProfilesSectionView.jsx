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

/*import './FeedDashRecurrentProfilesSectionView.css'*/
import React from 'react';
import eventBus from "../EventBus";
import { 
  appParams,
  categoryVerbMap
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
import FeedRecurrentProfileListItemView, { totalInteractions } from "./FeedRecurrentProfileListItemView";

export default class FeedDashRecurrentProfilesSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profiles: null,
    };

    this.setMostActiveUsers = this.setMostActiveUsers.bind(this);

  }

  componentDidMount() {
    this.setMostActiveUsers();
  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.setMostActiveUsers();
    }

  }

  componentWillUnmount() {

  }

  async setMostActiveUsers(){

    if (!this.props.objects){
      return;
    }

    var mostActiveUsers = [];

    function feedItemsMetrics(viewCategory){
      var result = {};
      for (const category of Object.keys(categoryVerbMap).concat(["publications"])) {
        result[category] = Number(category == viewCategory);
      }
      return result;
    }

    for (var feedPostView of this.props.objects){

      if (!feedPostView.initiator){
        continue;
      }

      if (feedPostView.initiator.url){
        const index = mostActiveUsers.map(a => a.url).indexOf(feedPostView.initiator.url);
        if (index == -1){
          mostActiveUsers.push({
            name: feedPostView.initiator.name,
            url: feedPostView.initiator.url,
            picture: feedPostView.initiator.picture,
            feedItemsMetrics: feedItemsMetrics(feedPostView.category),
          });
        }
        else{
          for (const category of Object.keys(categoryVerbMap)) {
            if (category == feedPostView.category){
              mostActiveUsers[index].feedItemsMetrics[category]++;
            }
          }
        }
      }
      else{
        if (!feedPostView.category){
          var feedPost = await db.feedPosts
                                 .where({id: feedPostView.feedPostId})
                                 .first();
          const index = mostActiveUsers.map(a => a.url).indexOf(feedPost.author.url);
          if (index == -1){
            mostActiveUsers.push({
              name: feedPost.author.name,
              url: feedPost.author.url,
              picture: feedPost.author.picture,
              feedItemsMetrics: feedItemsMetrics("publications"),
            });
          }
          else{
            for (const category of Object.keys(categoryVerbMap)) {
              if (category == "publications"){
                mostActiveUsers[index].feedItemsMetrics["publications"]++;
              }
            }
          }
        }
      }
    }    

    mostActiveUsers.sort((a, b) => totalInteractions(b) - totalInteractions(a));
    mostActiveUsers = mostActiveUsers.slice(0, 10);

    this.setState({profiles: mostActiveUsers});

  }

  render(){
    return (
      <>
        
        <div class="my-2 p-3 bg-body rounded shadow border mx-3">
          <h6 class="border-bottom pb-2 mb-0">
            Most active profiles

            <OverlayTrigger
              placement="top"
              overlay={<ReactTooltip id="tooltip1">Profiles with most large number of interactions on Linkedin</ReactTooltip>}
            >
              <span class="ms-1">
                <AlertCircleIcon size="14" className=""/>
              </span>
            </OverlayTrigger>

            {/*<div class="dropdown float-end bd-gray">
              <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
                <LayersIcon 
                  size="18" 
                  className="text-muted"/>
              </div>
              <ul class="dropdown-menu shadow-lg">
                <li>
                  <a class="dropdown-item small" href="#" onClick={null}>
                    <BarChartIcon
                      size="15"
                      className="me-2 text-muted"/>
                    Bar chart race
                    <span class="badge text-bg-danger rounded-pill ms-1 px-1 shadow-sm">In test</span>
                  </a>
                </li>
              </ul>
            </div>*/}
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
                     { this.state.profiles.map((object, index) => <FeedRecurrentProfileListItemView  
                                                                            object={object}/>)}
                    </div>}
              </>}

        </div>

      </>
    );
  }
}
