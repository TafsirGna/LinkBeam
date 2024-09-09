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

/*import './AllPostsModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { AlertCircleIcon } from "../SVGs";
import PostViewListItemView from "../PostViewListItemView";
import { 
  dbDataSanitizer,
  popularityValue,
  groupPeriodFeedPostViewsByHtmlElId,
} from "../../Local_library";
import { db } from "../../../db";
import SearchInputView from "../SearchInputView";

export default class AllPostsModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    	feedPostViews: null,
      sortByValueIndex: 0,
      searchText: "",
      processing: false,
    };

    this.setSortByValue = this.setSortByValue.bind(this);
    this.containsSearchText = this.containsSearchText.bind(this);
    this.onSearchTextChange = this.onSearchTextChange.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      if (prevProps.objects){
        this.setState({feedPostViews: (this.props.objects ? [...this.props.objects] : null)}, () => {
          this.setSortByValue(this.state.sortByValueIndex);
        });
      }
      else{
        if (!this.state.feedPostViews){
          this.setState({feedPostViews: [...this.props.objects]}, () => {
            this.setSortByValue(0);
          });
        }
        else{
          this.setSortByValue(0);
        }
      }
    }

  }

  componentWillUnmount(){
    
  }

  onSearchTextChange(data){
    this.setState({
      searchText: data.searchText,
      processing: true,
    }, () => {
      setTimeout(() => {
        this.setState({processing: false});
      }, 1000);
    });
  }

  setSortByValue(index){

    if (!this.state.feedPostViews){
      return;
    }

    this.setState({
      sortByValueIndex: index,
      processing: true,
    }, () => {

      var feedPostViews = this.state.feedPostViews;
      switch(index){
        case 0: { // sort by date
          feedPostViews.sort(function(a, b){return new Date(b.date) - new Date(a.date)});
          break;
        }
        case 1:{
          feedPostViews.sort(function(a, b){return b.timeCount - a.timeCount});
          break;
        }
        case 2:{
          feedPostViews.sort(function(a, b){return popularityValue(b) - popularityValue(a)});
          break;
        }
      }
      this.setState({feedPostViews: null}, () => {
        this.setState({
          feedPostViews: feedPostViews,
          processing: false,
        });
      });
    });
  }

  containsSearchText(feedPostView){
    return (feedPostView.profile 
              && feedPostView.profile.name.toLowerCase().includes(this.state.searchText.toLowerCase()))
            || (feedPostView.feedPost.profile.name && feedPostView.feedPost.profile.name.toLowerCase().includes(this.state.searchText.toLowerCase()))
            || feedPostView.feedPost.text.toLowerCase().includes(this.state.searchText.toLowerCase);
  }

  render(){
    return (
      <>
        <Modal 
          show={this.props.objects} 
          onHide={this.props.onHide}
          size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Posts</Modal.Title>
          </Modal.Header>
          <Modal.Body>

          	{ !this.state.feedPostViews 
                && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                  </div>
                </div>}

            { this.state.feedPostViews
        		    && <div>

            				{this.state.feedPostViews.length == 0
    		                  && <div class="text-center m-5">
    		                        <AlertCircleIcon size="100" className="text-muted"/>
    		                        <p><span class="badge text-bg-primary fst-italic shadow">No posts yet</span></p>
    		                      </div>}

            				{ this.state.feedPostViews.length != 0
                        		&& <div>

                                {/*Search input*/}
                                <div class="my-4">
                                  <SearchInputView 
                                    objectStoreName="feed_profiles" 
                                    globalData={this.props.globalData} 
                                    searchTextChanged={data => this.onSearchTextChange(data)}/>
                                    { this.state.searchText 
                                        && <p class="fst-italic small text-muted border rounded p-1 fw-light mx-1">
                                            {`${this.state.feedPostViews.filter(feedPostView => (this.state.searchText && this.containsSearchText(feedPostView))
                                                                                                  || (!this.state.searchText && true))
                                                                        .length} results for '${this.state.searchText}'`}
                                          </p> }
                                </div>

                                {/* sort by widget */}
                                <div class="clearfix">

                                  <div class="float-end d-flex align-items-center gap-2">

                                    <svg title="Sort by" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 text-muted"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>

                                    <div class="dropdown">
                                      <div data-bs-toggle="dropdown" aria-expanded="false" class="float-start py-0 handy-cursor">
                                        <span class="rounded shadow-sm badge border text-primary">Sort by</span>
                                      </div>
                                      <ul class="dropdown-menu shadow-lg border">
                                        {["date (desc)", "duration (desc)", "popularity (desc)"].map((value, index) => (
                                              <li>
                                                <a class={`dropdown-item small ${this.state.sortByValueIndex == index ? "active" : ""}`} href="#" onClick={() => {this.setSortByValue(index)}}>
                                                  {value}
                                                  { this.state.sortByValueIndex == index
                                                      && <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 float-end"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                </a>
                                              </li>  
                                          ))}
                                      </ul>
                                    </div>

                                  </div>

                                </div>

                                { this.state.processing 
                                    && <div class="text-center">
                                        <div class="mb-5 mt-4">
                                          <div class="spinner-border text-primary" role="status">
                                            {/*<span class="visually-hidden">Loading...</span>*/}
                                          </div>
                                          <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                                        </div>
                                      </div> }

      			                    { !this.state.processing
                                    && Object.entries(groupPeriodFeedPostViewsByHtmlElId(this.state.feedPostViews
                                                                                                   .filter(feedPostView => (this.state.searchText && this.containsSearchText(feedPostView))
                                                                                                                              || (!this.state.searchText && true))))
                                                                                          .map((([_, feedPostViews]) => <PostViewListItemView 
                                                                                                                            startDate={this.props.startDate}
                                                                                                                            endDate={this.props.endDate}
                                                                                                                            objects={feedPostViews}
                                                                                                                            globalData={this.props.globalData}/>))}
    			                  	</div>}

            		   </div>}      

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
