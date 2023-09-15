/*import './WebUiCommentModal.css'*/
import React, { useState } from 'react';
import { appParams } from "../../react_components/Local_library";
import { Spinner } from 'flowbite-react';
import Parse from 'parse/dist/parse.min.js';


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

    // When the user clicks anywhere outside of the modal, close it
    /*window.onclick = (function(event) {
          const $targetEl = document.getElementById(appParams.extShadowHostId).shadowRoot.getElementById(appParams.commentModalContainerID);
          if (event.composedPath()[0] == $targetEl) {
            $targetEl.classList.add("hidden");
          }
        });*/

  }

  componentDidUpdate(prevProps, prevState){

  }

  sendComment(){

    if (this.state.commentText == ""){
      return;
    }

    this.setState({sending: true});

    (async () => {
      const comment = new Parse.Object('Comment');
      comment.set('text', this.state.commentText);
      comment.set('createdBy', 'test');
      comment.set('profileId', 'test');
      comment.set('sectionId', 'test');
      try {
        const result = await comment.save();
        // Access the Parse Object attributes using the .GET method
        console.log('ParseObject created', result);

        this.setState({sending: false});

        // Making the modal disappear
        const $targetEl = document.getElementById(appParams.extShadowHostId).shadowRoot.getElementById(appParams.commentModalContainerID);
        $targetEl.classList.add("hidden");

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

          <div class={"modal-container-ac84bbb3728 hidden"} id={appParams.commentModalContainerID}>
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

          <CommentModalToast show={this.state.toastShow} handleClose={this.handleToastClose} text={this.state.toastText} />    

      </>
    );
  }
}

const CommentModalToast = (props) => {
  // const [show, setShow] = useState(false);

  return (
    <>
      {props.show && <div id="toast-success" class="fixed bottom-5 right-5 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                  <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                  </svg>
                  <span class="sr-only">Check icon</span>
                </div>
                <div class="ml-3 text-sm font-normal">{props.text}</div>
                <button onClick={() => {props.handleClose()}} type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-success" aria-label="Close">
                  <span class="sr-only">Close</span>
                  <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                  </svg>
                </button>
            </div>}
    </>
  );
};
