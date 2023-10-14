/*import './WebUiCommentModal.css'*/
import React, { useState } from 'react';
import { appParams, logInParseUser, registerParseUser } from "../../react_components/Local_library";
import { Spinner } from 'flowbite-react';
import Parse from 'parse/dist/parse.min.js';
import WebUiNotificationToast from "./WebUiNotificationToast";
import eventBus from "./EventBus";
import { genPassword } from "../../.private_library";


export default class WebUiCommentModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      commentText: "",
      sending: false,
      toastShow: false,
      toastText: "",
    };
    this.onCommentTextInputChange = this.onCommentTextInputChange.bind(this);
    this.handleToastClose = this.handleToastClose.bind(this);
    this.handleToastShow = this.handleToastShow.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

  }

  sendComment(){

    if (Parse.User.current() == null){
      console.log("No user available with these credentials ! ");

      // log in to the parse
      logInParseUser(
        Parse,
        this.props.appSettingsData.productID,
        genPassword(this.props.appSettingsData.productID),
        (parseUser) => {

          this.sendComment();

        },
        () => {

          // if (error 404)

          registerParseUser(
            Parse, 
            this.props.appSettingsData.productID,
            genPassword(this.props.appSettingsData.productID),
            (parseUser) => {

              this.sendComment();

            },
            () => {
              alert("An error ocurred when registering parse user. Try again later!");
            },
          );
        }
      );

      return;
    }

    if (this.state.commentText == "" || this.state.sending){
      return;
    }

    const response = confirm("LinkBeam expects your contribution to be thoughtful and relevant. Confirm the comment ?");
    if (!response){
      return;
    }

    this.setState({sending: true});

    (async () => {
      const comment = new Parse.Object('Comment');
      comment.set('text', this.state.commentText);
      comment.set('createdBy', Parse.User.current());
      comment.set('pageProfile', this.props.pageProfile);
      comment.set('pageSection', this.props.pageSection);
      try {
        const result = await comment.save();
        // Access the Parse Object attributes using the .GET method
        console.log('ParseObject created', result);

        this.setState({sending: false});

        // Making the modal disappear
        this.props.handleClose();

        // notifying the change to the rest of the app
        eventBus.dispatch("commentAdded", null);

        // notifiying the success to the user
        this.handleToastShow("Comment sent successfully ! ", () => {
          setTimeout(() => {
            this.handleToastClose();
          }, appParams.TIMER_VALUE);
        });

      } catch (error) {
        this.setState({sending: false});
        console.error('Error while creating ParseObject: ', error);
      }
    })();

  }

  onCommentTextInputChange = (event) => {this.setState({commentText: event.target.value});}

  handleToastShow = (toastText, callback = null) => {
    this.setState({toastShow: true, toastText: toastText}, callback);
  };
  handleToastClose = () => {this.setState({toastShow: false, toastText: ""});};

  render(){
    return (
      <>

          <div class={"modal-container-ac84bbb3728 " + (this.props.show ? "" : "hidden")} id={appParams.commentModalContainerID}>
            <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
            <form class="p-4">
      				<label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your comment</label>
      				<textarea value={this.state.commentText} onChange={this.onCommentTextInputChange} id="message" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Leave a comment..."></textarea>
            </form>
      			<div class="p-4">
      				<div onClick={() => {this.sendComment()}} class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
      					{this.state.sending && <div class="inline-flex items-center">
                            <Spinner
                              aria-label="Extra small spinner example"
                              size="sm"
                            />
                          </div>}
                {!this.state.sending && <div class="inline-flex items-center">
                                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                  <span>Send</span>
                                </div>}
      				</div>
      			</div>
            </div>
          </div>  

          <WebUiNotificationToast show={this.state.toastShow} handleClose={this.handleToastClose} text={this.state.toastText} />    

      </>
    );
  }
}
