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
import eventBus from "../../EventBus";

export default class AllPostsModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    	posts: null,
      sortByValueIndex: 0,
    };

    this.setSortByValue = this.setSortByValue.bind(this);
  }

  componentDidMount() {

    eventBus.on(eventBus.POST_REMINDER_ADDED, (data) =>
      {
        const index = this.state.posts.map(p => p.id).indexOf(data.post.id);
        if (index != -1){
          this.state.posts[index].reminder = data.reminder;
        }
        // this.toggleToastShow("Reminder added!");
      }
    );

    eventBus.on(eventBus.POST_REMINDER_DELETED, (data) =>
      {
        const index = this.state.posts.map(p => p.id).indexOf(data);
        if (index != -1){
          this.state.posts[index].reminder = null;
        }
        // this.toggleToastShow("Reminder deleted!");
      }
    );

  }

  componentDidUpdate(prevProps, prevState){
   
    if (prevProps.show != this.props.show){

      if (this.props.show){
        this.setState({sortByValueIndex: 0});
        this.setPosts();
      }

    }

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.POST_REMINDER_ADDED);
    eventBus.remove(eventBus.POST_REMINDER_DELETED);

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

      post.timeCount = 0; post.date = null;
      await db.feedPostViews
              .where({uid: post.uid})
              .filter(postView => dateBetweenRange(this.props.startDate, this.props.endDate, postView.date))
              .each(postView => {
        post.timeCount += (postView.timeCount ? postView.timeCount : 0);
        if (post.date){
          post.date = (new Date(post.date) >= new Date(postView.date)) ? post.date : postView.date;
        }
        else{
          post.date = postView.date;
        }
      });

    }));

    // descending order
    posts.sort(function(a, b){return new Date(b.date) - new Date(a.date)});

  	this.setState({posts: posts});

  }

  setSortByValue(index){
    this.setState({sortByValueIndex: index}, () => {

      var posts = this.state.posts;
      switch(index){
        case 0: { // sort by date
          posts.sort(function(a, b){return new Date(b.date) - new Date(a.date)});
          break;
        }
        case 1:{
          posts.sort(function(a, b){return b.timeCount - a.timeCount});
          break;
        }
        case 2:{
          
          break;
        }
      }
      this.setState({posts: null}, () => {
        this.setState({posts: posts});
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
