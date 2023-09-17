/*import './WebUiCommentListModal.css'*/
import React from 'react';
import { appParams } from "../../react_components/Local_library";
// import { Drawer } from 'flowbite';
import user_icon from '../../assets/user_icon.png';
import { DateTime as LuxonDateTime } from "luxon";
import { Spinner } from 'flowbite-react';
import Parse from 'parse/dist/parse.min.js';

export default class WebUiCommentListModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      // drawer: null,
      commentList: null,
    };

    this.fetchCommentList = this.fetchCommentList.bind(this);
  }

  componentDidMount() {

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = (function(event) {
      
      const $targetEl1 = document.getElementById(appParams.extShadowHostId).shadowRoot.getElementById(appParams.commentListModalContainerID);
      if (event.composedPath()[0] == $targetEl1) {
        // if (!this.props.show){
          $targetEl1.classList.add("hidden");
        // }
      }

      const $targetEl2 = document.getElementById(appParams.extShadowHostId).shadowRoot.getElementById(appParams.commentModalContainerID);
      if (event.composedPath()[0] == $targetEl2) {
        $targetEl2.classList.add("hidden");
      }
    });

    this.fetchCommentList();

    /*// set the drawer menu element
    const $targetEl = document.getElementById(appParams.extShadowHostId).shadowRoot.getElementById('drawer-js-example');

    // options with default values
    const options = {
      placement: 'left',
      backdrop: true,
      bodyScrolling: false,
      edge: false,
      edgeOffset: '',
      backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-30',
      onHide: () => {
          console.log('drawer is hidden');
          this.props.handleClose();
      },
      onShow: () => {
          console.log('drawer is shown');
      },
      onToggle: () => {
          console.log('drawer has been toggled');
      }
    };

    const drawer = new Drawer($targetEl, options);
    this.setState({drawer: drawer});

    if (this.props.show){
      drawer.show();
    }
    else{
      drawer.hide();
    }*/

  }

  componentDidUpdate(prevProps, prevState){

    /*if (prevProps.show != this.props.show){
      if (this.props.show){
        this.state.drawer.show();
      }
      else{
        this.state.drawer.hide();
      }
    }*/

  }

  async fetchCommentList(){

    const query = new Parse.Query('Comment');
    // You can also query by using a parameter of an object
    // query.equalTo('objectId', 'xKue915KBG');
    const results = await query.find();
    try {
      console.log("--- ", results);
      this.setState({commentList: results});
    } catch (error) {
      console.error('Error while fetching Comment', error);
    }

  }

  expandToTab(){

    // Send message to the background
    chrome.runtime.sendMessage({header: "expand-modal", data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log("Expand Modal Request sent !");
    });

  }

  render(){
    return (
      <>
        <div class={"modal-container-ac84bbb3728 " + ((this.props.show) ? "" : " hidden ")} id={appParams.commentListModalContainerID}>
          <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
            {!this.props.show && <div class="p-4">
                                    <div onClick={() => {this.expandToTab()}} class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                                      <span class="inline-flex">
                                        Expand to tab 
                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 ml-2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                      </span>
                                    </div>
                                  </div> }

            { this.state.commentList == null &&  <div class="py-20 flex"><span class="mx-auto"><Spinner
                      aria-label="Extra small spinner example"
                      size="lg"
                    /></span></div>}

            { this.state.commentList != null &&  <>
                                                    <CommentListView dataList={this.state.commentList} />
                                                    <div class="p-4">
                                                      <div class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                                                        View more
                                                      </div>
                                                    </div>
                                                </> } 
            
            
          </div>
        </div>


        {/*{ this.props.show && <div id="drawer-js-example" class="fixed z-40 h-screen p-4 overflow-y-auto bg-white w-80 dark:bg-gray-800" tabindex="-1" aria-labelledby="drawer-js-label">
                   <h5 id="drawer-js-label" class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"><svg class="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>Info</h5>
                   <button onClick={() => {this.state.drawer.hide()}} id="drawer-hide-button" type="button" aria-controls="drawer-example" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
                      <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                         <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                      </svg>
                      <span class="sr-only">Close menu</span>
                   </button>
                   <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Supercharge your hiring by taking advantage of our <a href="#" class="text-blue-600 underline font-medium dark:text-blue-500 hover:no-underline">limited-time sale</a> for Flowbite Docs + Job Board. Unlimited access to over 190K top-ranked candidates and the #1 design job board.</p>
                   <div class="grid grid-cols-2 gap-4">
                      <a href="#" class="px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Learn more</a>
                      <a href="#" class="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Get access <svg class="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                  </svg></a>
                   </div>
                </div> }*/}

      </>
    );
  }
}

const CommentListView = (props) => {

  return (

    <>
      { props.dataList.map((commentItem, index) =>
                                (<div class="flex items-center p-4">
                                    <img src={user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                                    <div class="ml-4 flex-auto">
                                      <div class="font-medium">
                                        {commentItem.get("createdBy")} · <span class="font-light text-xs">{LuxonDateTime.fromISO(commentItem.get("createdAt").toISOString()).toRelative()}</span>
                                      </div>
                                      <div class="mt-1 text-slate-700 text-sm">
                                        {commentItem.get("text")}
                                      </div>
                                      <div class="mt-2">
                                        
                                        <span class="handy-cursor rounded-full bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-500">
                                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-1"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                          0{/*{ typeof commentItem.get(upvotes)}*/}
                                        </span>
                                        <span class="handy-cursor rounded-full bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-400">
                                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-1"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                          15
                                        </span>
                                        <span class="handy-cursor rounded-full bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-400">
                                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-1"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                                          15
                                        </span>
      
                                      </div>
                                    </div>
                                    {/*<div class="pointer-events-auto ml-4 flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                                      View
                                    </div>*/}
                                  </div>)
                              )}

    </>

  );

}
