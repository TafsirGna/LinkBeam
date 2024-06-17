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
import SeeMoreButtonView from "../../../popup/widgets/SeeMoreButtonView";
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
      extractedPostData: null,
      tabsData: Array.from({length: 3}).map((o, index) => { return index != 1 ? {offset: 0, items: null} : {items: null} }),
    };

    this.startListening = this.startListening.bind(this);
    this.setViewIndex = this.setViewIndex.bind(this);
    this.requestTabData = this.requestTabData.bind(this);

  }

  componentDidMount() {

    this.startListening();

    eventBus.on(eventBus.SHOW_FEED_POST_RELATED_POSTS_MODAL, (data) => {
        
        this.setState({
          show: true, 
          extractedPostData: data.extractedPostData,
        }, () => {

          this.requestTabData({offset: 0, viewIndex: 0, url: data.extractedPostData.content.author.url});

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

        case "PREVIOUS_RELATED_POSTS_LIST":{

          switch(message.data.viewIndex){
            case 0:{
              var items = this.state.tabsData[message.data.viewIndex].items;
              if (!items){
                items = message.data.objects;
              }
              else{
                items = items.concat(message.data.objects);
              }
              var tabsData = this.state.tabsData;
              tabsData[message.data.viewIndex].items = items;
              this.setState({tabsData: tabsData});
              break;
            }
            case 1:{
              break;
            }
            case 2:{
              var items = this.state.tabsData[message.data.viewIndex].items;
              if (!items){
                items = message.data.objects;
              }
              else{
                items = items.concat(message.data.objects);
              }
              var tabsData = this.state.tabsData;
              tabsData[message.data.viewIndex].items = items;
              this.setState({tabsData: tabsData});
              break;
            }
          }

          break;

        }

      }

    });

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.SHOW_FEED_POST_RELATED_POSTS_MODAL);

  }

  handleModalClose = () => { 
    this.setState({
      show: false, 
      viewIndex: 0, 
      tabsData: Array.from({length: 3}).map((o, index) => { return index != 1 ? {offset: 0, items: null} : {items: null} }),
    }); 
  }

  setViewIndex(index){
    this.setState({viewIndex: index}, () => {
      if (!this.state.tabsData[index].items){

        var payload = null;
        switch(index){
          case 0:{
            payload = {viewIndex: index, offset: this.state.tabsData[index].offset, url: this.state.extractedPostData.content.author.url};
            break;
          }
          case 1:{
            // payload = {viewIndex: index, offset: this.state.tabsData[index].offset, url: this.state.extractedPostData.content.author.url};
            break;
          }
          case 2:{
            payload = {viewIndex: index, offset: this.state.tabsData[index].offset, url: this.state.extractedPostData.initiator.url};
            break;
          }
        }

        this.requestTabData(payload);
      }
    });
  }

  requestTabData(payload){

    chrome.runtime.sendMessage({header: "PREVIOUS_RELATED_POSTS", data: {tabId: this.props.tabId, payload: payload}}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log("Previous related posts data request sent !");
    });

  }

  render(){
    return (
      <>
        <div class={"modal-container-ac84bbb3728 " + (this.state.show ? "" : "hidden")}>
          <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
            
            <div class="p-4">
              <div onClick={null} class="text-lg pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                Previous related posts
              </div>
            </div>

            <div class="p-4">

              { !this.state.extractedPostData
                  && <div class="text-center">
                      <Spinner aria-label="Default status example" />
                    </div>}

              {/*{ this.state.data
                    && <div>
                          
                      </div> }*/}

              { this.state.extractedPostData 
                  && <div>
                      <div class="text-lg font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
                        <ul class="flex flex-wrap -mb-px">
                            <li class="me-2 handy-cursor" onClick={() => {this.setViewIndex(0)}}>
                                <a
                                  class={ this.state.viewIndex == 0 
                                            ? "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                                            :  "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" }>
                                  {this.state.extractedPostData.content.author.name}
                                  { this.state.tabsData[0].items 
                                      && <span class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">{this.state.tabsData[0].items.length}+</span>}
                                </a>
                            </li>
                            <li class="me-2 handy-cursor" onClick={() => {this.setViewIndex(1)}}>
                                <a 
                                  class={ this.state.viewIndex == 1 
                                            ? "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                                            :  "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" }  
                                  /*aria-current="page"*/>
                                  Tags
                                </a>
                            </li>
                            { this.state.extractedPostData.initiator
                                && this.state.extractedPostData.initiator.name 
                                && <li class="me-2 handy-cursor" onClick={() => {this.setViewIndex(2)}}>
                                    <a 
                                      class={ this.state.viewIndex == 2
                                            ? "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                                            :  "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" }>
                                      {this.state.extractedPostData.initiator.name}
                                      { this.state.tabsData[2].items 
                                        && <span class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">{this.state.tabsData[2].items.length}+</span>}
                                    </a>
                                </li>}
                        </ul>
                    </div>

                    { this.state.viewIndex == 0 
                        && <div>

                            { !this.state.tabsData[this.state.viewIndex].items 
                              && <div class="text-center">
                                                  <Spinner aria-label="Default status example" />
                                                </div>}

                            { this.state.tabsData[this.state.viewIndex].items
                                && <PreviousPostsList
                                    objects={this.state.tabsData[this.state.viewIndex].items}
                                    extractedPostData={this.state.extractedPostData}
                                    viewIndex={0}/> }
                          </div>}

                    { this.state.viewIndex == 1
                        && <div>
                      </div>}

                    { this.state.viewIndex == 2
                        && <div>

                            { !this.state.tabsData[this.state.viewIndex].items 
                              && <div class="text-center">
                                                  <Spinner aria-label="Default status example" />
                                                </div>}

                            { this.state.tabsData[this.state.viewIndex].items 
                                && <PreviousPostsList
                                    objects={this.state.tabsData[this.state.viewIndex].items}
                                    extractedPostData={this.state.extractedPostData}
                                    viewIndex={2}/> }
                          </div>}

                  </div>}


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

function PreviousPostsList(props){
  return <div>
          <ol class="relative border-s border-gray-200 dark:border-gray-700 mt-5 mx-2">                  
            { props.objects.map(object => (<li class="mb-10 ms-6">
                                                        <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                                                            <img 
                                                              class="rounded-full shadow-lg" 
                                                              src={props.viewIndex == 0 
                                                                    ? props.extractedPostData.content.author.picture
                                                                    : (props.viewIndex == 2 
                                                                        ? props.extractedPostData.initiator.picture
                                                                        : object.profile.picture)} 
                                                              alt="Thomas Lean image"/>
                                                        </span>
                                                        <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                                                            <div class="items-center justify-between mb-3 sm:flex">
                                                                <time class="mb-1 text-base font-normal text-gray-400 sm:order-last sm:mb-0">{LuxonDateTime.fromISO(object.date).toRelative()}</time>
                                                                <div class="text-xl font-normal text-gray-500 lex dark:text-gray-300">
                                                                  {props.viewIndex == 0 
                                                                    ? props.extractedPostData.content.author.name
                                                                    : (props.viewIndex == 2 
                                                                        ? props.extractedPostData.initiator.name
                                                                        : null)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                              <a href={object.link}>
                                                                { object.media && <img class="rounded-lg shadow-lg" src={(object.media[0].src ? object.media[0].src : object.media[0].poster)}/>}
                                                                <div class="mt-1 handy-cursor p-3 text-xl font-normal text-gray-500 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
                                                                  {object.text}
                                                                </div>
                                                              </a>
                                                            </div>
                                                        </div>
                                                    </li>)) }
        </ol>

        {/*{ props.objects 
            && <SeeMoreButtonView
                  showSeeMoreButton = { !this.state.searchingMedia 
                                          && (!this.state.allObjects || (this.state.allObjects && this.state.allObjects[this.state.allObjects.length - 1].date.toJSDate() > new Date(this.props.globalData.settings.lastDataResetDate)))
                                          && !this.state.searchText }
                  seeMore={this.searchMedia}
                  showLoadingSpinner={this.state.searchingMedia}
                  onSeeMoreButtonVisibilityChange={(isVisible) => { if (isVisible) { this.searchMedia() } }}
                  buttonClass=""/> }*/}

      </div>
}
