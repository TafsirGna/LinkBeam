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

/*import './AggregatedVisitListView.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  dbDataSanitizer, 
  groupVisitsByProfile,
} from "../Local_library";
import ProfileVisitListItemView from "./ProfileVisitListItemView";
import FeedVisitListItemView from "./FeedVisitListItemView";
import SeeMoreButtonView from "./SeeMoreButtonView";

export default class AggregatedVisitListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      showLoadingSpinner: false,
      seeMore: true,
    };

    this.onSeeMoreButtonVisibilityChange = this.onSeeMoreButtonVisibilityChange.bind(this);

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.object != this.props.object){
      if (this.props.object && this.props.object.action == "display_all"){
        var seeMore = true;
        if (prevProps.object){
          if (prevProps.object.action == "display_all"){
            if (prevProps.object.list.length == this.props.object.list.length){
              seeMore = false;
            }
          }
        }
        this.setState({showLoadingSpinner: false, seeMore: seeMore});
      }
    }

  }

  componentWillUnmount(){

  }

  onSeeMoreButtonVisibilityChange = (isVisible) => {
    if (isVisible){
      if (this.state.seeMore){
        this.setState({showLoadingSpinner: true}, () => {
          this.props.seeMore();
        });
      }
    }
  }

  render(){
    return (
      <>
        { !this.props.object && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div> }

        { this.props.object && <>

                              { this.props.object.list.length == 0 
                                  && <div class="text-center m-5 mt-2">
                                      <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                      <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No data to show</span></p>
                                      {/*<p><span class="badge text-bg-light fst-italic shadow text-muted border border-warning">Get started by visiting a linkedin profile</span></p>*/}
                                    </div> }

                              {this.props.object.list.length != 0 
                                && <div class="list-group m-1 shadow-sm small">
                                      {
                                        groupVisitsByProfile(this.props.object.list).map((visit) => (<>
                                            { visit.url.indexOf("/feed") != -1 
                                              && <FeedVisitListItemView 
                                                object={visit} 
                                                parentList="aggregated" />}
                                            { visit.url.indexOf("/feed") == -1 
                                              && <ProfileVisitListItemView 
                                                object={visit} 
                                                parentList="aggregated"/> }
                                          </>))
                                      }
                                  </div>}

                              {/*<div class="text-center my-2 ">
                                      
                                                              { () 
                                                                  && <VisibilitySensor
                                                                      onChange={this.onSeeMoreButtonVisibilityChange}
                                                                    >
                                                                      <button class="btn btn-light rounded-pill btn-sm fst-italic text-muted border badge shadow-sm mb-3 " onClick={this.props.seeMore} type="button">
                                                                        See more
                                                                      </button>
                                                                    </VisibilitySensor>}
                                                              { this.state.showLoadingSpinner 
                                                                && <div class="spinner-border spinner-border-sm text-secondary " role="status">
                                                                                    <span class="visually-hidden">Loading...</span>
                                                                                    </div>}
                                                            </div>*/}

                                <SeeMoreButtonView
                                  showSeeMoreButton = {this.props.object.action == "display_all" 
                                                                    && !this.state.showLoadingSpinner 
                                                                    && this.state.seeMore}
                                  seeMore={this.props.seeMore}
                                  showLoadingSpinner={this.state.showLoadingSpinner}
                                  onSeeMoreButtonVisibilityChange={this.onSeeMoreButtonVisibilityChange}/>

                              </> }

      </>
    );
  }
}
