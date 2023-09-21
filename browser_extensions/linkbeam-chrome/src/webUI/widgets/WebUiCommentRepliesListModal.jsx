/*import './WebUiCommentRepliesListModal.css'*/
import React, { useState } from 'react';
import { appParams, messageParams, expandToTab } from "../../react_components/Local_library";
// import { Drawer } from 'flowbite';
import user_icon from '../../assets/user_icon.png';
import { DateTime as LuxonDateTime } from "luxon";
import { Spinner, Tooltip } from 'flowbite-react';
import Parse from 'parse/dist/parse.min.js';
import WebUiCommentItemView from "./WebUiCommentItemView";

export default class WebUiCommentRepliesListModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      // drawer: null,
      commentRepliesList: null,
      commentText: null,
    };

    this.fetchCommentRepliesList = this.fetchCommentRepliesList.bind(this);
    this.onCommentTextInputChange = this.onCommentTextInputChange.bind(this);
  }

  componentDidMount() {

    this.fetchCommentRepliesList();

  }

  componentDidUpdate(prevProps, prevState){

  }

  async fetchCommentRepliesList(){

    const query = new Parse.Query('Comment');
    // You can also query by using a parameter of an object
    // query.equalTo('objectId', 'xKue915KBG');
    const results = await query.find();
    try {
      console.log("--- ", results);
      this.setState({commentRepliesList: results});
    } catch (error) {
      console.error('Error while fetching Comment', error);
    }

  }

  onCommentTextInputChange = (event) => {this.setState({commentText: event.target.value});}

  render(){
    return (
      <>
        <div class={"modal-container-ac84bbb3728 " + ((this.props.show) ? "" : " hidden ")} id={appParams.commentListModalContainerID}>
          <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
            {!this.props.show && <div class="p-4">
                                    <div onClick={() => {expandToTab()}} class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                                      <span class="inline-flex">
                                        Expand to tab 
                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 ml-2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                      </span>
                                    </div>
                                  </div> }

            { this.state.commentRepliesList == null &&  <div class="py-20 flex"><span class="mx-auto"><Spinner
                      aria-label="Extra small spinner example"
                      size="lg"
                    /></span></div>}

            { this.state.commentRepliesList != null &&  <>
                                                    <div id="alert-additional-content-5" class="p-4 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-800" role="alert">
                                                      <div class="flex items-center">
                                                        <svg class="flex-shrink-0 w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                                        </svg>
                                                        <span class="sr-only">Info</span>
                                                        <h3 class="text-lg font-medium text-gray-800 dark:text-gray-300">This is a dark alert</h3>
                                                      </div>
                                                      <div class="mt-2 mb-4 text-sm text-gray-800 dark:text-gray-300">
                                                        More info about this info dark goes here. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.
                                                      </div>
                                                      <div class="flex">
                                                        <button type="button" class="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-800">
                                                          <svg class="-ml-0.5 mr-2 h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
                                                            <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
                                                          </svg>
                                                          View more
                                                        </button>
                                                        <button type="button" class="text-gray-800 bg-transparent border border-gray-700 hover:bg-gray-800 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:border-gray-600 dark:hover:bg-gray-600 dark:focus:ring-gray-800 dark:text-gray-300 dark:hover:text-white" data-dismiss-target="#alert-additional-content-5" aria-label="Close">
                                                          Dismiss
                                                        </button>
                                                      </div>
                                                    </div>
                                                    <form class="p-4">
                                                      {/*<label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your comment</label>*/}
                                                      <textarea value={this.state.commentText} onChange={this.onCommentTextInputChange} id="message" rows="2" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Leave a reply..."></textarea>
                                                    </form>
                                                    { this.state.commentRepliesList.map((commentItem, index) => <WebUiCommentItemView object={commentItem} appSettingsData={this.props.appSettingsData}/> )}
                                                    <div class="p-4">
                                                      <div class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                                                        View more
                                                      </div>
                                                    </div>
                                                </> } 
            
            
          </div>
        </div>

      </>
    );
  }
}