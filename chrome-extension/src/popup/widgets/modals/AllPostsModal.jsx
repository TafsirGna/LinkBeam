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
import PostListItemView from "../PostListItemView";
import { 
  dbDataSanitizer,
  dateBetweenRange,
} from "../../Local_library";
import { db } from "../../../db";

export default class AllPostsModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    	posts: null,
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){
   
    if (prevProps.show != this.props.show){

    	this.setPosts();

    }

  }

  async setPosts(){

    var uids = [];
  	await db.feedPostViews
            .filter(postView => dateBetweenRange(this.props.startDate, this.props.endDate, postView.date))
            .each(postView => {
              if (uids.indexOf(postView.uid) == -1){
                uids.push(postView.uid);
              }
            });   

    var posts = await db.feedPosts
                          .where("uid")
                          .anyOf(uids)
                          .toArray(); 

    await Promise.all (posts.map (async post => {
      [post.reminder] = await Promise.all([
         db.reminders.where('objectId').equals(post.uid).first()
       ]);
    }));

    posts.reverse();

  	this.setState({posts: posts});

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
                    {["date (desc)", "duration (desc)"].map((value) => (
                          <li>
                            <a class="dropdown-item small" href="#" onClick={null}>
                              {value}
                            </a>
                          </li>  
                      ))}
                  </ul>
                </div>

              </div>

            </div>

          	{ !this.state.posts 
                && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                  </div>
                </div>}

            { this.state.posts
        		    && <div>

            				{this.state.posts.length == 0
    		                  && <div class="text-center m-5">
    		                        <AlertCircleIcon size="100" className="text-muted"/>
    		                        <p><span class="badge text-bg-primary fst-italic shadow">No posts yet</span></p>
    		                      </div>}

            				{ this.state.posts.length != 0
                        		&& <div>
    			                    { this.state.posts.map(((post, index) => <PostListItemView 
                                                                          startDate={this.props.startDate}
                                                                          endDate={this.props.endDate}
                                                                          object={post}
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
