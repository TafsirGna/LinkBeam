/*import './WebUiCommentModal.css'*/
import React from 'react';
import { appParams } from "../../react_components/Local_library";
// import { Modal } from 'flowbite-react';
// import { Drawer } from 'flowbite';


export default class WebUiCommentModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = (function(event) {
          const $targetEl = document.getElementById(appParams.extShadowHostId).shadowRoot.getElementById(appParams.commentModalContainerID);
          if (event.composedPath()[0] == $targetEl) {
            $targetEl.classList.add("hidden");
          }
        }).bind(this);

  }

  componentDidUpdate(prevProps, prevState){

  }

  sendComment(){
    
  }

  render(){
    return (
      <>

          <div class={"modal-container-ac84bbb3728 hidden"} id={appParams.commentModalContainerID}>
            <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
            <form class="p-4">
      				<label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your comment</label>
      				<textarea id="message" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Leave a comment..."></textarea>
            </form>
      			<div class="p-4">
      				<div onClick={() => {this.sendComment()}} class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
      					<div class="inline-flex items-center">
      						<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      						<span>Send</span>
      					</div>
      				</div>
      			</div>
            </div>
          </div>      

      </>
    );
  }
}
