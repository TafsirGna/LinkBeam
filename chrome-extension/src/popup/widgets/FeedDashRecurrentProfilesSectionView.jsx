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
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import FeedProfilesNetworkGraphChart from "./charts/FeedProfilesNetworkGraphChart";

export default class FeedDashRecurrentProfilesSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profiles: null,
      profilesNetworkChartModalShow: false,
    };

    this.setMostRecurrentProfiles = this.setMostRecurrentProfiles.bind(this);

  }

  componentDidMount() {
    this.setMostRecurrentProfiles();
  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.setMostRecurrentProfiles();
    }

  }

  componentWillUnmount() {

  }

  handleProfilesNetworkChartModalClose = () => this.setState({profilesNetworkChartModalShow: false});
  handleProfilesNetworkChartModalShow = () => this.setState({profilesNetworkChartModalShow: true});

  async setMostRecurrentProfiles(){

    if (!this.props.objects){
      return;
    }

    var mostRecurrentProfiles = [];

    function feedPostViewsByCategory(feedPostView){
      var result = {};
      for (const category of Object.keys(categoryVerbMap).concat(["publications"])) {
        result[category] = (category == feedPostView.category) 
                              ? [feedPostView] 
                              : (!feedPostView.category 
                                  ? (category == "publications" ? [feedPostView] : []) 
                                  : []); // Number(category == feedPostView.category);
      }
      return result;
    }

    var uids = [];
    for (const feedPostView of this.props.objects){

      if (uids.indexOf(feedPostView.uid) != -1){
        continue;
      }

      uids.push(feedPostView.uid);

      if (feedPostView.initiator){

        if (!feedPostView.initiator.url){ // suggested post
          continue;
        }

        const index = mostRecurrentProfiles.findIndex(a => a.url == feedPostView.initiator.url);
        if (index == -1){
          mostRecurrentProfiles.push({
            ...feedPostView.initiator,
            feedPostViewsByCategory: feedPostViewsByCategory(feedPostView),
          });
        }
        else{
          for (const category of Object.keys(categoryVerbMap)) {
            if (category == feedPostView.category){
              // mostRecurrentProfiles[index].feedItemsMetrics[category]++;
              mostRecurrentProfiles[index].feedPostViewsByCategory[category].push(feedPostView);
            }
          }
        }
      }
      else{
        if (!feedPostView.category){
          const feedPost = await db.feedPosts
                                   .where({id: feedPostView.feedPostId})
                                   .first();
          const index = mostRecurrentProfiles.findIndex(a => a.url == feedPost.author.url);
          if (index == -1){
            mostRecurrentProfiles.push({
              ...feedPost.author,
              feedPostViewsByCategory: feedPostViewsByCategory(feedPostView),
            });
          }
          else{
            for (const category of Object.keys(categoryVerbMap)) {
              if (category == "publications"){
                mostRecurrentProfiles[index].feedPostViewsByCategory["publications"].push(feedPostView);
              }
            }
          }
        }
      }
    }    

    mostRecurrentProfiles = mostRecurrentProfiles.toSorted((a, b) => totalInteractions(b) - totalInteractions(a)).slice(0, 10);

    this.setState({profiles: mostRecurrentProfiles});

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

            <div class="dropdown float-end bd-gray">
              <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
                <LayersIcon 
                  size="18" 
                  className="text-muted"/>
              </div>
              <ul class="dropdown-menu shadow-lg">
                <li>
                  <a class="dropdown-item small" href="#" onClick={this.handleProfilesNetworkChartModalShow}>
                    <BarChartIcon
                      size="15"
                      className="me-2 text-muted"/>
                    {/*Bar chart race*/}
                    Profiles Network Graph
                    {/*<span class="badge text-bg-danger rounded-pill ms-1 px-1 shadow-sm">In test</span>*/}
                  </a>
                </li>
              </ul>
            </div>
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
                     { this.state.profiles.map(object => <FeedRecurrentProfileListItemView  
                                                            object={object}                            
                                                            globalData={this.props.globalData}/>)}
                    </div>}
              </>}

        </div>


        <Modal 
          show={this.state.profilesNetworkChartModalShow} 
          onHide={this.handleProfilesNetworkChartModalClose}
          size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Feed profiles network graph</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <FeedProfilesNetworkGraphChart
              objects={this.props.objects}/>

          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={this.handleProfilesNetworkChartModalClose} 
              className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </>
    );
  }
}
