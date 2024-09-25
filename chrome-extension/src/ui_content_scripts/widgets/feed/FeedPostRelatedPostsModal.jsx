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
import React, { useState, useEffect } from 'react';
import { 
  appParams, 
  getChartColors,
  messageMeta,
  getFeedLineChartsData,
  getPostMetricValue,
  isReferenceHashtag,
  getHashtagText,
} from "../../../popup/Local_library";
import { BarChartIcon } from "../../../popup/widgets/SVGs";
import SeeMoreButtonView from "../../../popup/widgets/SeeMoreButtonView";
import ImageLoader from "../../../popup/widgets/ImageLoader";
import eventBus from "../../../popup/EventBus";
import { Spinner } from "flowbite-react";
import { DateTime as LuxonDateTime } from "luxon";

const getBlankTabsData = () => Array.from({length: 4}).map(_ => ({offset: 0, items: null}));
const TAGS_TAB_INDEX = 2;
var selectedTagIndex = null;

function requestTabData(payload, tabId){

  chrome.runtime.sendMessage({header: "PREVIOUS_RELATED_POSTS", data: {tabId: tabId, payload: payload}}, (response) => {
    // Got an asynchronous response with the data from the service worker
    console.log("Previous related posts data request sent !");
  });

}

export default class FeedPostRelatedPostsModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      show: false,
      viewIndex: 0,
      extractedPostData: null,
      tabsData: getBlankTabsData(),
    };

    this.startListening = this.startListening.bind(this);
    this.setViewIndex = this.setViewIndex.bind(this);
    this.onTagSelected = this.onTagSelected.bind(this);
    this.postViewIndexUpdate = this.postViewIndexUpdate.bind(this);

  }

  componentDidMount() {

    this.startListening();

    eventBus.on(eventBus.SHOW_FEED_POST_RELATED_POSTS_MODAL, (data) => {
        
        this.setState({
          show: true, 
          extractedPostData: data.extractedPostData,
        }, () => {
          requestTabData(
            {
              offset: 0, 
              viewIndex: 0, 
              url: data.extractedPostData.content.author.url,
              htmlElId: data.extractedPostData.id,
            },
            this.props.tabId,
          );

          // setting the hashtag tab data
          this.setState({
            tabsData: this.state.tabsData.map((tabData, index) => (index != TAGS_TAB_INDEX) 
                                                                    ? tabData 
                                                                    : {
                                                                        ...tabData, 
                                                                        items: data.extractedPostData.content.references.filter(reference => isReferenceHashtag(reference))
                                                                                                                        .map(reference => ({refText: getHashtagText(reference.text), selected: false, items: null})),
                                                                      }
            ),       
          });

        }
      );

    });
  }

  startListening(){

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

      // acknowledge receipt
      sendResponse({
          status: "ACK"
      });

      switch(message.header){

        case "PREVIOUS_RELATED_POSTS_LIST":{

          var items = (message.data.viewIndex == TAGS_TAB_INDEX 
                        ? this.state.tabsData[message.data.viewIndex].items[selectedTagIndex]
                        : this.state.tabsData[message.data.viewIndex]).items;
          items = !items ? message.data.objects : items.concat(message.data.objects);
          
          var tabsData = this.state.tabsData;
          (message.data.viewIndex == TAGS_TAB_INDEX
            ? tabsData[message.data.viewIndex].items[selectedTagIndex]
            : tabsData[message.data.viewIndex]).items = items;
          this.setState({tabsData: tabsData});
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
      tabsData: getBlankTabsData(),
    }); 
  }

  setViewIndex(index){
    this.setState({viewIndex: index}, () => {
      this.postViewIndexUpdate(index);
    });
  }

  postViewIndexUpdate(index){

    const tabItems = (index != TAGS_TAB_INDEX 
                      ? this.state.tabsData[index] 
                      : (selectedTagIndex
                          ? this.state.tabsData[index].items[selectedTagIndex]
                          : {})
                      ).items

    if (!tabItems){

      var payload = { viewIndex: index, offset: this.state.tabsData[index].offset };
      selectedTagIndex = (index != TAGS_TAB_INDEX ? null : selectedTagIndex);
      switch(index){
        case 0:{
          payload = { ...payload, url: this.state.extractedPostData.content.author.url };
          break;
        }
        case 1:{
          payload = { ...payload, url: this.state.extractedPostData.initiator.url };
          break;
        }
        case TAGS_TAB_INDEX:{
          payload = !selectedTagIndex ? null : { ...payload, tag: this.state.tabsData[index].items[selectedTagIndex].refText };
          break;
        }
        case 3:{
          if (this.state.extractedPostData.content.text){
            payload = { ...payload, text: this.state.extractedPostData.content.text };
          }
          break;
        }
        default:{
          payload = null;
        }
      }

      if (payload){
        requestTabData(
          { ...payload, htmlElId: this.state.extractedPostData.id },
          this.props.tabId,
        );
      }

    }

  }

  onTagSelected(){
    this.setState({
      tabsData: this.state.tabsData.map((tabData, index) => {
        if (index != TAGS_TAB_INDEX){
          return tabData;
        }

        tabData.items = tabData.items.map((item, index) => ({...item, selected: index == selectedTagIndex}));
        tabData.offset = tabData.items[selectedTagIndex].items ? tabData.items[selectedTagIndex].items.length : 0;
        return tabData;
      }),
    }, () => {
      this.postViewIndexUpdate(TAGS_TAB_INDEX);
    });
  }

  render(){
    return (
      <>
        <div class={`modal-container-ac84bbb3728 ${(this.state.show ? "" : "hidden")}`}>
          {/*<!-- Main modal -->*/}
          <div class="mx-auto relative p-4 w-full max-w-5xl max-h-full">
              {/*<!-- Modal content -->*/}
              <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                  {/*<!-- Modal header -->*/}
                  <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                      <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                          Previous related posts
                      </h3>
                      <button onClick={this.handleModalClose} type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="default-modal">
                          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                          </svg>
                          <span class="sr-only">Close modal</span>
                      </button>
                  </div>
                  {/*<!-- Modal body -->*/}
                  <div class="p-4 md:p-5 space-y-4">

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
                                            && <span class="bg-blue-100 text-blue-800 text-base font-medium mx-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">{this.state.tabsData[0].items.length}+</span>}
                                      </a>
                                  </li>
                                  { this.state.extractedPostData.initiator
                                      && this.state.extractedPostData.initiator.name 
                                      && <li class="me-2 handy-cursor" onClick={() => {this.setViewIndex(1)}}>
                                          <a 
                                            class={ this.state.viewIndex == 1
                                                  ? "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                                                  :  "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" }>
                                            {this.state.extractedPostData.initiator.name}
                                            { this.state.tabsData[1].items 
                                              && <span class="bg-blue-100 text-blue-800 text-base font-medium mx-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">{this.state.tabsData[1].items.length}+</span>}
                                          </a>
                                      </li>}
                                  <li class="me-2 handy-cursor" onClick={() => {this.setViewIndex(TAGS_TAB_INDEX)}}>
                                      <a 
                                        class={ this.state.viewIndex == TAGS_TAB_INDEX 
                                                  ? "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                                                  :  "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" }  
                                        /*aria-current="page"*/>
                                        Tags
                                      </a>
                                  </li>
                                  <li class="me-2 handy-cursor" onClick={() => {this.setViewIndex(3)}}>
                                    <a 
                                      class={ this.state.viewIndex == 3
                                                ? "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                                                :  "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" }  
                                      >
                                      Copycats
                                      { this.state.tabsData[3].items
                                          && <span class="bg-indigo-100 text-indigo-800 text-base font-medium mx-2 px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300">{this.state.tabsData[3].items.length}+</span>}
                                    </a>
                                  </li>


                              </ul>
                          </div>

                          { Array.from({length: 4})
                                 .map((_, index) => <div>
                                                    { this.state.viewIndex == index 
                                                        && <div>
                                                              { !this.state.tabsData[this.state.viewIndex].items 
                                                                && <div class="text-center mt-5">
                                                                                    <Spinner aria-label="Default status example" />
                                                                                  </div>}
            
                                                              { this.state.tabsData[this.state.viewIndex].items
                                                                  && <div>
            
                                                                    { this.state.tabsData[this.state.viewIndex].items.length == 0
                                                                        && <AlertWidget
                                                                              text="Nothing to show here."
                                                                              variant="yellow"
                                                                              className="mt-5"/>}
            
                                                                    { this.state.tabsData[this.state.viewIndex].items.length != 0
                                                                        && <PreviousPostsListView
                                                                              objects={this.state.tabsData[this.state.viewIndex].items}
                                                                              extractedPostData={this.state.extractedPostData}
                                                                              viewIndex={index}
                                                                              onTagSelected={this.onTagSelected}/>}
                                                                  </div> }     
                                                            </div> }
                                                      </div>) }

                        </div>}

                      </div>
                            {/*<!-- Modal footer -->*/}
                            <div class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                              <button data-modal-hide="default-modal" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={this.handleModalClose} >Dismiss</button>
                              {/*<button data-modal-hide="default-modal" type="button" class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Decline</button>*/}
                            </div>
                        </div>
                    </div>
                  </div>

      </>
    );
  }
}

function AlertWidget(props){

  return <div id="alert-border-4" class={`${props.className || ""} flex items-center p-4 mb-4 text-${props.variant}-800 border-t-4 border-${props.variant}-300 bg-${props.variant}-50 dark:text-${props.variant}-300 dark:bg-gray-800 dark:border-${props.variant}-800`} role="alert">
      <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
      </svg>
      <div class="ms-3 text-base font-medium">
        {props.text}
      </div>
  </div>;

}

function PreviousPostsListView(props){

  const [objects, setObjects] = useState([...props.objects]);

  useEffect(() => {
    setObjects([...props.objects]);
  }, [props.objects]);

  function getProfilePicture(object){

    switch(props.viewIndex){
      case 0:{
        return props.extractedPostData.content.author.picture;
      }
      case 1:{
        return props.extractedPostData.initiator.picture;
      }
      case TAGS_TAB_INDEX:{
        return null;
      }
    }

  }

  function getProfileName(object){

    switch(props.viewIndex){
      case 0:{
        return props.extractedPostData.content.author.name;
      }
      case 1:{
        return props.extractedPostData.initiator.name;
      }
      case TAGS_TAB_INDEX:{
        return null;
      }
    }

  }

  function onTagSelected(object, index){

    if (!object.selected){
      selectedTagIndex = index; 
      if (!object.items){
        props.onTagSelected();
      }
    }

    setObjects(objects.map((obj, idx) => ({ ...obj, selected: index == idx ? !obj.selected : false })));   
  }

  return <div>
          { props.viewIndex == TAGS_TAB_INDEX 
              && <div class="my-3 flex flex-wrap">
                        { objects.map((object, index) => <span 
                                                          class={`my-1 handy-cursor text-lg font-medium me-2 px-2.5 py-0.5 rounded border
                                                                    ${object.selected 
                                                                      ? "bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-blue-400 border-blue-400 "
                                                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 border-gray-500"}`}
                                                          onClick={() => onTagSelected(object, index)}>
                                                          {object.refText}
                                                        </span>) }
                      </div>}
          <ol class="border-s border-gray-200 dark:border-gray-700 mt-5 mx-2">                  
            { (() => {
                const items = props.viewIndex != TAGS_TAB_INDEX 
                                ? objects 
                                : (selectedTagIndex
                                    ? objects[selectedTagIndex].items
                                    : null);

                if (!items || !items.length){
                  return <AlertWidget
                          text="Nothing to show here."
                          variant="yellow"
                          className="mt-5"/>;
                }

                return items.map(object => (<li class="mb-10 ms-6" title="Click to open in a new tab">
                                                <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                                                    <img 
                                                      class="rounded-full shadow-lg" 
                                                      src={getProfilePicture(object)} 
                                                      alt="Thomas Lean image"/>
                                                </span>
                                                <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                                                    <div class="items-center justify-between mb-3 sm:flex">
                                                        <time class="mb-1 text-base font-normal text-gray-400 sm:order-last sm:mb-0">{LuxonDateTime.fromISO(object.date).toRelative()}</time>
                                                        <div class="text-xl font-normal text-gray-500 lex dark:text-gray-300">
                                                          <span class="font-bold">
                                                            {getProfileName(object)}
                                                          </span>
                                                          <span class="text-base italic">{" interacted with or edited this"}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                      <a 
                                                        href={object.url}
                                                        target="_blank">
                                                        { (object.media && object.media[0]) 
                                                            && 
                                                              <ImageLoader
                                                                imgSrc={(object.media[0].src ? object.media[0].src : object.media[0].poster)}
                                                                imgClass="rounded-lg shadow-lg"
                                                                spinnerTemplate={<Spinner aria-label="Default status example" />}
                                                                spinnerSize="small"/>}
                                                        <div class="mt-2 handy-cursor p-3 text-xl font-normal text-gray-500 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300" dangerouslySetInnerHTML={{__html: object.text}}>
                                                          {/**/}
                                                        </div>
                                                      </a>
                                                    </div>
                                                </div>
                                            </li>));
            })() }
        </ol>

        {/*{ objects 
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
