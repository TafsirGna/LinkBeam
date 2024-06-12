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

/*import './FeedPostRelatedPostsModal.css'*/
import React from 'react';
import { 
  appParams, 
  getChartColors,
  messageMeta,
  getFeedLineChartsData,
  getPostMetricValue,
} from "../../../popup/Local_library";
import { BarChartIcon } from "../../../popup/widgets/SVGs";
import eventBus from "../../../popup/EventBus";
import { Spinner } from "flowbite-react";
// import { Button, Modal } from "flowbite-react";
import { DateTime as LuxonDateTime } from "luxon";


export default class FeedPostRelatedPostsModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      show: false,
      viewIndex: 0,
    };

    this.startListening = this.startListening.bind(this);
    this.setViewIndex = this.setViewIndex.bind(this);

  }

  componentDidMount() {

    this.startListening();

    eventBus.on(eventBus.SHOW_FEED_POST_RELATED_POSTS_MODAL, (data) => {
        
        this.setState({
          show: true, 
        }, () => {

          /*chrome.runtime.sendMessage({header: messageMeta.header.CRUD_OBJECT, data: {tabId: this.props.tabId, action: "read", objectStoreName: "feedPostViews", props: {uid: data.postUid}}}, (response) => {
            // Got an asynchronous response with the data from the service worker
            console.log("Post views data request sent !");
          });*/

        });

      }
    );

  }

  startListening(){

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

      // acknowledge receipt
      sendResponse({
          status: "ACK"
      });

      switch(message.header){

        /*case messageMeta.header.CRUD_OBJECT_RESPONSE:{

          if (message.data.objectStoreName == "feedPostViews"){
            var feedPostViews = message.data.object.views;
            this.setChartData(feedPostViews);
            this.setMetricChangeValues(feedPostViews);
          }

          break;

        }*/

      }

    });

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.SHOW_FEED_POST_RELATED_POSTS_MODAL);

  }

  handleModalClose = () => { this.setState({show: false, viewIndex: 0}); }

  setViewIndex(index){
    this.setState({viewIndex: index});
  }

  render(){
    return (
      <>
        <div class={"modal-container-ac84bbb3728 " + (this.state.show ? "" : "hidden")}>
          <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
            
            <div class="p-4">

              {/*{ !this.state.data 
                  && <div class="text-center">
                      <Spinner aria-label="Default status example" />
                    </div>}

              { this.state.data
                    && <div>
                          
                      </div> }*/}

              <div class="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
                  <ul class="flex flex-wrap -mb-px">
                      <li class="me-2" onClick={() => {this.setViewIndex(0)}}>
                          <a href="#" class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">Profile</a>
                      </li>
                      <li class="me-2" onClick={() => {this.setViewIndex(1)}}>
                          <a href="#" class="inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500" aria-current="page">Tags</a>
                      </li>
                      <li class="me-2" onClick={() => {this.setViewIndex(2)}}>
                          <a href="#" class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">fff</a>
                      </li>
                  </ul>
              </div>


            </div>

            <div class="p-4 text-lg">
              <div 
                onClick={this.handleModalClose} 
                class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                <span>Dismiss</span>
              </div>
            </div>
            
          </div>
        </div> 

      </>
    );
  }
}
