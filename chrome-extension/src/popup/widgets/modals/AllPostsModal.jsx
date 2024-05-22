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
  dateBetweenRange,
} from "../../Local_library";
import { db } from "../../../db";
import eventBus from "../../EventBus";

export default class AllPostsModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    	feedPostViews: null,
      sortByValueIndex: 0,
    };

    this.setSortByValue = this.setSortByValue.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){
   
    if (prevProps.show != this.props.show){

      if (this.props.show){
        if (!this.state.feedPostViews){
          this.setState({feedPostViews: this.props.objects}, () => {
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

  setSortByValue(index){
    this.setState({sortByValueIndex: index}, () => {

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
          const popularityValue = p => (p.commentsCount + p.repostsCount + p.reactions);
          feedPostViews.sort(function(a, b){return popularityValue(b) - popularityValue(a)});
          break;
        }
      }
      this.setState({feedPostViews: null}, () => {
        this.setState({feedPostViews: feedPostViews});
      });
    });
  }

  render(){
    return (
      <>
        <Modal 
          show={this.props.show} 
          onHide={this.props.onHide}
          size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Posts</Modal.Title>
          </Modal.Header>
          <Modal.Body>

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
    			                    { this.state.feedPostViews.map(((feedPostView, index) => <PostViewListItemView 
                                                                          startDate={this.props.startDate}
                                                                          endDate={this.props.endDate}
                                                                          object={feedPostView}
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
