/*import './WebUiCommentRepliesListModal.css'*/
import React, { useState } from 'react';
import { appParams, messageParams, expandToTab, logInParseUser, registerParseUser } from "../../react_components/Local_library";
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
      commentText: "",
      upVoting: false,
      downVoting: false,
      sendingState: null,
    };

    this.fetchCommentRepliesList = this.fetchCommentRepliesList.bind(this);
    this.onCommentTextInputChange = this.onCommentTextInputChange.bind(this);
  }

  componentDidMount() {



  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.commentObject != this.props.commentObject){
      if (this.props.commentObject != null){
        // Fetching the comment's replies
        this.fetchCommentRepliesList();
      }
    }

    if (prevProps.show != this.props.show){
      if (!this.props.show){
        this.setState({
          commentRepliesList: null,
          commentText: "",
        });
      }
    }

  }

  async fetchCommentRepliesList(){

    const query = new Parse.Query('Comment');
    // You can also query by using a parameter of an object
    query.equalTo('parentObject', this.props.commentObject);
    const results = await query.find();
    try {
      console.log("--- ", results);
      this.setState({commentRepliesList: results});
    } catch (error) {
      console.error('Error while fetching Comment', error);
    }

  }

  onCommentTextInputChange = (event) => {this.setState({commentText: event.target.value});}

  updateCommentItemVote = (property) => {

    /*if ((props.object.get("upvotes") != null && props.object.get("upvotes").indexOf(props.appSettingsData.productID) != -1)
          || (props.object.get("downvotes") != null && props.object.get("downvotes").indexOf(props.appSettingsData.productID) != -1)){
      return;
    }

    (async () => {
      // const query = new Parse.Query('Comment');
      showSpinner(property);

      // here you put the objectId that you want to update
      // const object = await query.get(objectId);
      // object.set(property, value);

      var votes = props.object.get(property);

      if (votes == null){
        props.object.set(property, [props.appSettingsData.productID]);
      }
      else{
        votes.push(props.appSettingsData.productID);
        props.object.set(property, votes);
      }

      try {
        // const response = await object.save();
        const response = await props.object.save();

        console.log('CommentItem updated', response);
        hideSpinner(property)

      } catch (error) {
        console.error('Error while updating ', error);
      }

    })();*/

  }

  sendComment(currentParseUser = null){

    var currentParseUser = (currentParseUser ? currentParseUser : this.props.currentParseUser);

    if (currentParseUser == null){
      console.log("Product not registered in parse DB ! ");

      // log in to the parse
      logInParseUser(
        Parse,
        this.props.appSettingsData.productID,
        this.props.appSettingsData.productID,
        (parseUser) => {

          this.props.setCurrentParseUser(parseUser);
          this.sendComment(parseUser);

        },
        () => {

          // if (error 404)

          registerParseUser(
            Parse, 
            this.props.appSettingsData.productID,
            this.props.appSettingsData.productID,
            (parseUser) => {

              this.props.setCurrentParseUser(parseUser);
              this.sendComment(parseUser);

            },
            () => {
              alert("An error ocurred when registering parse user. Try again later!");
            },
          );
        }
      );

      return;
    }

    if (this.state.commentText == "" || this.state.sendingState == "sending"){
      return;
    }

    const response = confirm("LinkBeam expects your contribution to be thoughtful and relevant. Confirm the comment ?");
    if (!response){
      return;
    }

    this.setState({sendingState: "sending"});

    (async () => {
      const comment = new Parse.Object('Comment');
      comment.set('text', this.state.commentText);
      comment.set('createdBy', currentParseUser);
      comment.set('pageProfile', this.props.pageProfile);
      comment.set('sectionId', 'test');
      comment.set('parentObject', this.props.commentObject);
      try {
        const result = await comment.save();
        // Access the Parse Object attributes using the .GET method
        console.log('ParseObject created', result);

        this.setState({commentText: ""});

        this.fetchCommentRepliesList();

        // notifiying the success to the user
        this.setState({sendingState: "sent"});
        setTimeout(() => {
          this.setState({sendingState: null});
        }, appParams.TIMER_VALUE);

      } catch (error) {
        this.setState({sendingState: null});
        console.error('Error while creating ParseObject: ', error);
      }
    })();

  }

  render(){
    return (
      <>
        <div class={"modal-container-ac84bbb3728 " + ((this.props.show) ? "" : " hidden ")} id={appParams.commentRepliesListModalContainerID}>
          <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
            {!this.props.show && <div class="p-4">
                                    <div onClick={() => {expandToTab()}} class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                                      <span class="inline-flex">
                                        Expand to tab 
                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 ml-2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                      </span>
                                    </div>
                                  </div> }

            {this.props.commentObject && <div id="alert-additional-content-5" class="p-4 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-800" role="alert">
                            <div class="flex items-center">
                              {/*<svg class="flex-shrink-0 w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                                                                      </svg>
                                                                                      <span class="sr-only">Info</span>*/}
                              <h3 class="text-lg font-medium text-gray-800 dark:text-gray-300 flex items-center">
                                <span class="mr-2 flex items-center">
                                  {this.props.commentObject.get("createdBy").getUsername()} 
                                  <span>
                                    <Tooltip
                                          content="Verified user"
                                        >
                                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="#198754" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 ml-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    </Tooltip>
                                  </span>
                                </span>
                                · 
                                <span class="font-light text-xs ml-2">{LuxonDateTime.fromISO(this.props.commentObject.get("createdAt").toISOString()).toRelative()}</span>
                              </h3>
                            </div>
                            <div class="mt-2 mb-4 text-sm text-gray-800 dark:text-gray-300">
                              {this.props.commentObject.get("text")}
                            </div>
                            <div class="mt-2">                                                     
                              <span onClick={() => {this.updateCommentItemVote("upvotes")}} class="handy-cursor rounded-full bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-500">
                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-1"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                { !this.state.upVoting && <span>{ this.props.commentObject.get("upvotes") == null ? "0" : this.props.commentObject.get("upvotes").length }</span>}
                                { this.state.upVoting && <Spinner
                                                  aria-label="Extra small spinner example"
                                                  className="ml-1"
                                                  size="xs"
                                                />}
                              </span>
                              
                              <span class="inline-flex">
                                <Tooltip
                                    content={ !this.state.downVoting ? "You and 3 users" : "" }
                                  >
                                  <span onClick={() => {this.updateCommentItemVote("downvotes")}} class="handy-cursor rounded-full bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-400">
                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-1"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    { 
                                      !this.state.downVoting &&  
                                                        <span>
                                                          { this.props.commentObject.get("downvotes") == null ? "0" : this.props.commentObject.get("downvotes").length }
                                                        </span>
                                    }
                                    { 
                                      this.state.downVoting && <Spinner
                                                      aria-label="Extra small spinner example"
                                                      className="ml-1"
                                                      size="xs"
                                                    />
                                    }
                                  </span>
                                </Tooltip>
                              </span>
                              <span class="rounded-full bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-400">
                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-1"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                                {this.state.commentRepliesList == null && <Spinner
                                                            aria-label="Extra small spinner example"
                                                            className="ml-1"
                                                            size="xs"
                                                          />}
                                {this.state.commentRepliesList != null && <span>{this.state.commentRepliesList.length}</span>}
                              </span>
            
                            </div>
                          </div>}
              <form class="p-4">
                {/*<label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your comment</label>*/}
                <div>
                  <textarea value={this.state.commentText} onChange={this.onCommentTextInputChange} id="message" rows="2" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Leave a reply..."></textarea>
                </div>
                <div class="flex">
                  <button onClick={() => {this.sendComment()}} type="button" class="ml-auto mt-2 flex items-center py-1 px-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                    {this.state.sendingState == "sending" && <div class="inline-flex items-center">
                            <Spinner
                              aria-label="Extra small spinner example"
                              size="sm"
                            />
                          </div>}
                    {this.state.sendingState == null && <span class="flex">
                                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                          Send
                                        </span>}

                    {this.state.sendingState == "sent" && <span class="flex text-green-500 items-center">
                                          Sent
                                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 ml-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </span>}
                  </button>
                </div >
              </form>
              { this.state.commentRepliesList == null &&  <div class="py-20 flex"><span class="mx-auto"><Spinner
                      aria-label="Extra small spinner example"
                      size="lg"
                    /></span></div>}
              { this.state.commentRepliesList != null && this.state.commentRepliesList.map((commentItem, index) => <WebUiCommentItemView object={commentItem} currentParseUser={this.props.currentParseUser}/> )}
              <div class="p-4">
                <div class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                  View more
                </div>
              </div>     
            
          </div>
        </div>

      </>
    );
  }
}