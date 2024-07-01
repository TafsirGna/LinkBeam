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
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  dbDataSanitizer, 
  groupVisitsByProfile,
} from "../Local_library";
import ProfileVisitListItemView from "./ProfileVisitListItemView";
import FeedVisitListItemView from "./FeedVisitListItemView";
import SeeMoreButtonView from "./SeeMoreButtonView";
import sorry_icon from '../../assets/sorry_icon.png';

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
                                      <img 
                                        src={sorry_icon} 
                                        width="80" />
                                      <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No data to show</span></p>
                                    </div> }

                              {this.props.object.list.length != 0 
                                && <div class="list-group m-1 shadow-sm small">
                                      {
                                        groupVisitsByProfile(this.props.object.list).map((visit) => (<>
                                            { Object.hasOwn(visit, "feedItemsMetrics") 
                                              && <FeedVisitListItemView 
                                                    object={visit} 
                                                    parentList="aggregated" />}
                                            { Object.hasOwn(visit, "profileData")
                                              && <ProfileVisitListItemView 
                                                    object={visit} 
                                                    parentList="aggregated"/> }
                                          </>))
                                      }
                                  </div>}

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
