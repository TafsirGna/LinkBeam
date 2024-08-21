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

/*import './AboveFeedPostWidgetView.css'*/
import React from 'react';
import { 
  appParams,
  messageMeta, 
  secondsToHms,
  categoryVerbMap,
  isLinkedinFeedPostPage,
  isLinkedinFeed,
  nRange,
  popularityValue,
  isLinkedinProfilePage,
  dbDataSanitizer,
} from "../../../popup/Local_library";
import{
  sendTabData,
  checkAndHighlightKeywordsInHtmlEl,
  extractPostDate,
  getFeedPostHtmlElement,
  getHtmlElImageSource,
  getHtmlElTextContent,
  getHtmlElInnerHTML, 
} from "../../injected_scripts/main_lib";
import { 
  BarChartIcon, 
  LayersIcon,
  CheckIcon,
  KeyIcon,
  ClockIcon,
  PlusIcon,
  ReminderIcon,
  BranchIcon,
  DeletionIcon,
  AlertCircleIcon,
  DuplicateIcon,
  BellIcon,
} from "../../../popup/widgets/SVGs";
import eventBus from "../../../popup/EventBus";
import sleeping_icon from '../../../assets/sleeping_icon.png';
import { DateTime as LuxonDateTime } from "luxon";
import FeedPostReminderModal from "./FeedPostReminderModal";
import { 
  Dropdown, 
  Spinner, 
  Tooltip, 
  Popover, 
} from "flowbite-react";
import ReactDOM from 'react-dom/client';
import styles from "../../styles.min.css";

const freshReminder = () => {

  return {
    date: (new Date()).toISOString().split('T')[0],
    text: "",
  };

}

const termLanguageVariants = {

  comment: {
    fr: "commentaire",
    en: "comment",
  },
  repost: {
    fr: "republication",
    en: "repost",
  },

}

function isElVisible (ele) {
  const { top, bottom } = ele.getBoundingClientRect();
  const vHeight = (window.innerHeight || document.documentElement.clientHeight);

  return (
    (top > 0 || bottom > 0) &&
    top < vHeight
  );
}

const timeInc = 1;

export default class AboveFeedPostWidgetView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      reminderModalShow: false,
      reminder: freshReminder(),
      processing: false,
      updated: false,
      // timerDisplay: false,
      impressionCount: null,
      timeCount: 0, 
      timerInterval: null,
      postHtmlElementVisible: false,
      postHtmlElement: null,
      foundKeywords: null,
      fetchedTimeCount: 0,
      popularityRank: null,
      dbId: null,
      extractedPostData: null,
      dataExtractionError: false,
      visitId: null,
    };

    this.showFeedPostDataModal = this.showFeedPostDataModal.bind(this);
    this.showFeedPostRelatedPostsModal = this.showFeedPostRelatedPostsModal.bind(this);
    this.updateReminder = this.updateReminder.bind(this);
    this.runTimer = this.runTimer.bind(this);
    this.extractSendPostObject = this.extractSendPostObject.bind(this);
    this.clearTimer = this.clearTimer.bind(this);
    this.checkAndHighlightKeywordsInPost = this.checkAndHighlightKeywordsInPost.bind(this);
    
  }

  componentDidMount() {

    this.setState({visitId: this.props.visitId});

    eventBus.on(eventBus.ACTIVE_POST_CONTAINER_ELEMENT, (data) => {

      this.setState({
        postHtmlElementVisible: (this.props.postUid == data.uid),
      });
      
    });

    chrome.storage.onChanged.addListener(((changes, namespace) => {
    
      if (namespace != "session" || this.state.dbId == null){
        return;
      }

      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {

        if (key != "rankedPostsByPopularity"){
          continue;
        }

        this.setState({
          popularityRank: { 
            index1: newValue.findIndex(o => o.id == this.state.dbId) + 1, 
            count: newValue.length, 
            topValue: newValue[0].popularity,
          },
        });

      }

    }).bind(this));

    this.startListening();

    eventBus.on(eventBus.PAGE_IDLE_SIGNAL, (data) => {
      if (data.value){
        if (this.state.timerInterval){
          this.clearTimer();
        }
      }
      else{
        if (!this.state.timerInterval){
          if (this.state.postHtmlElementVisible){
            this.runTimer();
          }
        }
      }
    });

    if (isLinkedinFeedPostPage(window.location.href)){
      this.setState({
        impressionCount: this.props.postData.viewsCount,
        reminder: this.props.postData.reminder ? this.props.postData.reminder : freshReminder(),
      });

      this.checkAndHighlightKeywordsInPost();

      return;
    }

    // if it's the main feed, then
    const postHtmlElement = getFeedPostHtmlElement(this.props.postUid).querySelector(".feed-shared-update-v2");

    this.setState({postHtmlElement: postHtmlElement}, () => {
      // Screen this post for all contained keywords
      this.checkAndHighlightKeywordsInPost();
    });

    if (isElVisible(postHtmlElement)){
      this.setState({postHtmlElementVisible: true});
    }

  }

  componentDidUpdate(prevProps, prevState){

    if (prevState.postHtmlElementVisible != this.state.postHtmlElementVisible){

      if (this.state.postHtmlElementVisible){
        if (this.state.impressionCount == null){
          this.extractSendPostObject();
        }
        if (!this.state.timerInterval){
          this.runTimer();
        }
      }
      else{
        if (this.state.timerInterval){
          this.clearTimer();
        }
      }

    }

  }

  clearTimer(){

    clearInterval(this.state.timerInterval);
    this.setState({timerInterval: null});

  }

  extractSendPostObject(){

    var post = {
      id: this.props.postUid,
      category: null,
      content: {},
    };

    const postContainerHeaderElement = this.state.postHtmlElement.querySelector(".update-components-header");

    if (postContainerHeaderElement){

      post.initiator = this.getPostProfileData(postContainerHeaderElement);

      const headerText = dbDataSanitizer.preSanitize(postContainerHeaderElement.textContent);
      for (const category in categoryVerbMap){

        for (var lang in categoryVerbMap[category]){
          const categoryVerbIndex = headerText.toLowerCase().indexOf(categoryVerbMap[category][lang]);
          if (categoryVerbIndex != -1){
            post.category = category;
            if (category != "suggestions"){
              post.initiator.name = headerText.slice(0, categoryVerbIndex);
            }
            break;
          }
        }

      }

    }


    const postReactionsData = this.getPostReactionsData();
    const subPostHtmlEl = this.state.postHtmlElement.querySelector(".update-components-mini-update-v2");

    post.content = {
      ...this.getPostData(this.state.postHtmlElement, false),
      reactions: postReactionsData.reactions,
      commentsCount: postReactionsData.comments,               
      repostsCount: postReactionsData.reposts,
      subPost: subPostHtmlEl
                ? this.getPostData(subPostHtmlEl, true)
                : null,
    };

    if (!this.isPostDataValid(post)){
      this.setState({dataExtractionError: true});
      return;
    }

    this.setState({extractedPostData: post});

    sendTabData(this.props.tabId, post);

  }

  isPostDataValid(post){

    if (post.category 
            && post.category != "suggestions"
            && (!post.initiator.name || !post.initiator.url /*|| !post.initiator.picture*/)){
      console.log("[[[[[[[[[[[[[[[[[[[[[[[ 1 : ", post.category, post.initiator.name, post.initiator.url);
      return false;
    }

    if (!post.content.author.url 
          || !post.content.author.name
          /*|| post.content.author.picture*/
          || !post.content.estimatedDate
          || (post.content.subPost
                && (!post.content.subPost.author.url
                      || !post.content.subPost.author.name
                      /*|| !post.content.subPost.author.picture*/
                      || !post.content.subPost.estimatedDate))){
      console.log("[[[[[[[[[[[[[[[[[[[[[[[ 2 : ", post.content.author.url, post.content.author.name, getHtmlElTextContent(this.state.postHtmlElement.querySelector(".update-components-actor__sub-description-link .visually-hidden")), post.content.estimatedDate);
      return false;
    }

    return true;

  }

  getPostReactionsData(){

    var result = {
      reactions: null,
      comments: null,
      reposts: null,
    };

    const postReactionsSectionHtmlEl = this.state.postHtmlElement.querySelector(".social-details-social-counts");

    if (!postReactionsSectionHtmlEl){
      return result;
    }

    var postReactionsSectionHtmlElTextContent = getHtmlElTextContent(postReactionsSectionHtmlEl);
    var reactionsDataString = postReactionsSectionHtmlElTextContent.replaceAll("\n", "").match(/\s{2,}\d+([\s,]\d+)?\s{2,}/g)[0].replaceAll(/\s{2,}/g, "");
    result.reactions = Number(reactionsDataString.replaceAll(",", "").replaceAll(/\s/g, ""));

    for (const language in termLanguageVariants["comment"]){ // fr && en

      // resetting the result
      for (const key in result){ if (key == "reactions") { continue; } result[key] = null; }

      var commentsDataString = (new RegExp(String.raw`\s\d+([\s,]\d+)?\s${termLanguageVariants["comment"][language]}`, "g")).exec(postReactionsSectionHtmlElTextContent);
      if (commentsDataString){
        result.comments = Number(commentsDataString[0].match(/\d+([\s,]\d+)?/g)[0].replaceAll(",", "").replaceAll(/\s/g, ""));
      }

      var repostsDataString = (new RegExp(String.raw`\s\d+\s${termLanguageVariants["repost"][language]}`, "g")).exec(postReactionsSectionHtmlElTextContent);
      if (repostsDataString){
        result.reposts = Number(repostsDataString[0].match(/\d+([\s,]\d+)?/g)[0].replaceAll(",", "").replaceAll(/\s/g, ""));
      }

      if ((result.comments && result.comments != 0)
            || (result.reposts && result.reposts != 0)){
        break;
      }

    }

    return result;

  }

  getPostData(postHtmlEl, subPost){

    const postAuthorHtmlEl = postHtmlEl.querySelector(".update-components-actor");
    const postContentHtmlEl = postHtmlEl.querySelector(".feed-shared-update-v2__description");

    var result = {
      author: this.getPostProfileData(postAuthorHtmlEl),
      text: getHtmlElTextContent(postContentHtmlEl),
      innerHtml: getHtmlElInnerHTML(postContentHtmlEl),
      estimatedDate: extractPostDate(getHtmlElTextContent(this.getEstimatedDateHtmlEl(postHtmlEl)), LuxonDateTime),
      references: this.getPostReferenceArray(postContentHtmlEl),
      media: this.getPostMediaArray(postHtmlEl.querySelector(subPost ? ".update-components-mini-update-v2__reshared-content" : ".feed-shared-update-v2__content")),
    };

    if (subPost){
      result = {
        ...result,
        uid: postContentHtmlEl && postContentHtmlEl.parentNode.tagName == "A"
              ? postContentHtmlEl.parentNode.getAttribute("href").match(/urn:li:activity:\d+/g)[0]
              : null
      };
    }

    return result;

  }

  runTimer(){

    const timerInterval = setInterval(() => {
        this.setState((prevState) => ({timeCount: (prevState.timeCount + timeInc)}), () => {

          if (!isLinkedinFeed(window.location.href)
                || (this.state.postHtmlElement 
                      && window.getComputedStyle(this.state.postHtmlElement).display === "none" /* in the case the html element has been hidden */ )){
            if (this.state.timerInterval){
              this.clearTimer();
            }
            return;
          }

          if (!(this.state.timeCount % 3)){
            if (this.state.impressionCount == null){
              return;
            }

            if (!this.state.postHtmlElementVisible){ // for a more accurate count
              return;
            }

            chrome.runtime.sendMessage({header: messageMeta.header.FEED_POST_TIME_UPDATE, data: {visitId: this.state.visitId, postUid: this.props.postUid, time: this.state.timeCount }}, (response) => {
              console.log('time count update request sent', this.props.postUid, this.state.postHtmlElementVisible, response);
            });
          }
        });
      }, (timeInc * 1000)
    );

    this.setState({timerInterval: timerInterval});

  }

  getPostMediaArray(htmlElement){

    if (!htmlElement){
      return null;
    }

    return Array.from(htmlElement.querySelectorAll("img, video"))
               .map(htmlEl => ({
                  type: htmlEl.tagName,
                  src: htmlEl.tagName == "VIDEO" ? null : htmlEl.src,
                  poster: htmlEl.poster ? htmlEl.poster : null,
               }));

  }

  getPostReferenceArray(htmlElement){

    if (!htmlElement){
      return null;
    }

    
    return Array.from(htmlElement.querySelectorAll("a[href]"))
                .map(htmlEl => ({
                  url: htmlEl.getAttribute("href"),
                  text: htmlEl.textContent,
                }));

  }

  getEntityHtmlElHref(htmlElement){

    if (!htmlElement){
      return null;
    }

    const result = isLinkedinProfilePage(htmlElement.href);
    return result ? result[0] : htmlElement.href.match(/linkedin.com\/\w+\/[\wàâçéèêëîïôûùüÿñæœ-]+/g)[0];

  }

  getPostProfileData(htmlElement){
    return {
      name: getHtmlElTextContent(htmlElement.querySelector("[aria-hidden]")),
      url: this.getEntityHtmlElHref(htmlElement.querySelector("a")),
      picture: getHtmlElImageSource(htmlElement.querySelector("img")),
    };
  }

  getEstimatedDateHtmlEl(htmlElement){
    return htmlElement.querySelector(".update-components-actor__sub-description-link .visually-hidden")
  }

  componentWillUnmount(){

    eventBus.remove(eventBus.TIMER_DISPLAY_UPDATED);
    eventBus.remove(eventBus.PAGE_IDLE_SIGNAL);
    eventBus.remove(eventBus.ACTIVE_POST_CONTAINER_ELEMENT);

    if (this.state.timerInterval){
      this.clearTimer();
    }

  }

  showFeedPostDataModal(){

    eventBus.dispatch(eventBus.SHOW_FEED_POST_DATA_MODAL, { postUid: this.props.postUid, from: window.location.href });

  }

  showFeedPostRelatedPostsModal(){
    
    eventBus.dispatch(eventBus.SHOW_FEED_POST_RELATED_POSTS_MODAL, { extractedPostData: this.state.extractedPostData });

  }

  startListening(){

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

      // acknowledge receipt
      sendResponse({
          status: "ACK"
      });

      switch(message.header){

        case messageMeta.header.CRUD_OBJECT_RESPONSE:{

          switch(message.data.action){

            case "add":{
              if (message.data.objectStoreName == "reminders"){

                if (message.data.object){
                  const reminder = message.data.object;
                  if (reminder.postUid != this.props.postUid){
                    return;
                  }
                  this.setState({
                    reminder: message.data.object, 
                    processing: false,
                    updated: true,
                  }, () => {
                    setTimeout(() => {
                      this.setState({updated: false});
                    }, appParams.TIMER_VALUE_1);
                  });
                }

              }
              break;
            }

            case "delete":{
              if (message.data.objectStoreName == "reminders"){

                if (message.data.object){
                  if (message.data.object != this.props.postUid){
                    return;
                  }
                  this.setState({
                    reminder: freshReminder(), 
                    processing: false,
                    updated: true,
                  }, () => {
                    setTimeout(() => {
                      this.setState({updated: false});
                    }, appParams.TIMER_VALUE_1);
                  });
                }

              }
              break;
            }

            case "read":{

              if (message.data.objectStoreName == "feedPosts"){

                const index = message.data.objects.map(p => p.id).indexOf(this.props.postUid);
                if (index != -1){

                  var post = message.data.objects[index];

                  if (Object.hasOwn(post, "reminder") && post.reminder){
                    this.setState({reminder: post.reminder})
                  }

                  if (Object.hasOwn(post, "viewsCount")){
                    this.setState({impressionCount: post.viewsCount});
                  }

                  if (Object.hasOwn(post, "timeCount")){
                    this.setState({fetchedTimeCount: post.timeCount});
                  }

                  if (Object.hasOwn(post, "dbId")){
                    this.setState({dbId: post.dbId});
                  }

                  if (Object.hasOwn(post, "rank")){
                    this.setState({popularityRank: post.rank});
                  }

                  if (Object.hasOwn(post, "visitId")){
                    this.setState({visitId: post.visitId});
                  }

                  if (post.bookmarked){

                    this.state.postHtmlElement.classList.add(appParams.LINKBEAM_HIGHLIGHTED_POST_CLASS);

                    if (this.props.appSettings.notifications){
                      // play the ringtone to alert the user
                      (new Audio(chrome.runtime.getURL("/assets/elevator-tone.mp3"))).play();
                    }
                  }
                  
                }

              }

              break;
            }

          }

          break;

        }

        case messageMeta.header.CS_SETUP_DATA: {
          if (Object.hasOwn(message.data, "tabId")){
            if (this.props.tabId == message.data.tabId){
              if (!this.state.timerInterval){
                this.runTimer();
              }
            }
            else{
              if (this.state.timerInterval){
                this.clearTimer();
              }
            }
          }
          break;
        }

      }

    });

  }

  handleReminderModalClose = () => this.setState({reminderModalShow: false});
  handleReminderModalShow = () => this.setState({reminderModalShow: true});

  updateReminder(){

    if (Object.hasOwn(this.state.reminder, "id")){

      if (confirm("You're about to delete this reminder. Proceed ?")){

        this.setState({processing: true}, () => {

          // Send message to the background
          chrome.runtime.sendMessage({header: messageMeta.header.CRUD_OBJECT, data: {tabId: this.props.tabId, objectStoreName: "reminders", action: "delete", object: this.state.reminder}}, (response) => {
            // Got an asynchronous response with the data from the service worker
            console.log("Post reminder data Request sent !");
          });

        });

      }

    }
    else{
      this.handleReminderModalShow();
    }

  }

  getKeywordCountWidget(){

    return <button 
            type="button" 
            title={`${Object.keys(this.state.foundKeywords).length == "0" ? "No" : Object.keys(this.state.foundKeywords).length} keyword${Object.keys(this.state.foundKeywords).length > 1 ? "s" : ""} detected`}
            class="mx-2 flex items-center text-blue-800 bg-transparent border border-blue-800 hover:bg-blue-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-blue-600 dark:border-blue-600 dark:text-blue-400 dark:hover:text-white dark:focus:ring-blue-800">
            <span class="text-base me-2">({Object.keys(this.state.foundKeywords).length})</span>
            <KeyIcon 
              size="10"/>
          </button>;

  }

  // We're gonna use Deep First Search to pull this off
  checkAndHighlightKeywordsInPost(){

    if (!this.props.allKeywords.length){
      return;
    }

    var htmlElement = (isLinkedinFeedPostPage(window.location.href)) ? document.querySelector(".scaffold-layout__main")
                                                                         .querySelector("div[data-urn]")
                                                                         .querySelector(".feed-shared-update-v2__description-wrapper")
                                                                     : (this.state.postHtmlElement
                                                                                 .querySelector(".feed-shared-update-v2__description-wrapper")
                                                                        ? this.state.postHtmlElement
                                                                                 .querySelector(".feed-shared-update-v2__description-wrapper .update-components-update-v2__commentary")
                                                                        : null);

    var detected = {};

    checkAndHighlightKeywordsInHtmlEl(htmlElement, this.props.allKeywords, detected, this.props.highlightedKeywordBadgeColors);
    
    this.setState({foundKeywords: detected});  

  }

  render(){
    return (
      <>
        <div>
                  <div class="shadow w-full inline-flex p-4 mb-4 py-1 text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800" role="alert">
                    <div class="flex items-center">
                      <Tooltip content="Proudly yours" style="light" arrow={false}>
                        <svg class="flex-shrink-0 w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"></path>
                        </svg>
                      </Tooltip>
                      <span class="sr-only">Info</span>
                      <h3 class="text-sm font-medium">LinkBeam</h3>
                    </div>
                    
                    <div class="flex ml-auto">
        
                      {/*{ this.state.timerDisplay 
                          && <span class="flex items-center bg-blue-100 text-blue-800 text-xl font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                              {secondsToHms((this.state.timeCount + this.state.fetchedTimeCount), false)}
                            </span>}*/}

                      {/* Indication that the page has gone idle after some time of inactivity */}
                      { !this.state.timerInterval
                          && isLinkedinFeed(window.location.href)
                          && <div class="flex items-center">
                              <img 
                                src={chrome.runtime.getURL("/assets/sleeping_icon.png")} 
                                alt="" 
                                width="20" 
                                height="20" 
                                class="mx-2"
                                title="dozing"/>
                            </div> }

                      { this.state.dataExtractionError
                          && <div 
                              class="text-red-600 mx-2 flex items-center"
                              title="Data extraction error">
                              <AlertCircleIcon 
                                size="22"
                                className=""/>
                          </div> }

                      { this.state.reminder
                          && Object.hasOwn(this.state.reminder, "id")
                          && <div 
                              class="mx-2 flex items-center"
                              /*title=""*/>
                              <Tooltip content="A reminder is associated with this post" style="light" arrow={false}>
                                <BellIcon 
                                  size="18"
                                  className=""/>
                              </Tooltip>
                          </div> }
        
                      {/* Indication that the post has just been updated */}
                      { this.state.updated 
                          && <span class="flex items-center bg-green-100 text-green-800 text-lg font-medium mx-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                                Updated
                                <CheckIcon
                                  size="16"
                                  className="ml-2"/>
                            </span>}

                      {/*Rating widget*/}
                      { this.state.popularityRank
                          && <div class="flex items-center mx-2" title={`#${this.state.popularityRank.index1} out of ${this.state.popularityRank.count}`}>
                                { nRange(0, 4, 1).map(item => (<svg class={`w-4 h-4 ${/*(popularityValue(this.state.extractedPostData.content) / this.state.popularityRank.topValue)*/ (1 - (this.state.popularityRank.index1 / this.state.popularityRank.count)) >= ((item + 1) * 0.25) ? "text-yellow-300" : "text-gray-300 dark:text-gray-500"} ms-1`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                </svg>)) }
                              </div>}
        
                      { this.state.foundKeywords 
                          && <div> 
                              { Object.keys(this.state.foundKeywords).length != 0
                                && <Popover
                                      aria-labelledby="default-popover"
                                      content={
                                        <div className="w-64 text-lg text-gray-500 dark:text-gray-400">
                                          <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                                            <h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white">Keywords</h3>
                                          </div>
                                          <div className="px-3 py-2">
                                            <p>
                                              {Object.keys(this.state.foundKeywords).map((keyword, index) => (
                                                <span class={`${this.props.highlightedKeywordBadgeColors[index % this.props.highlightedKeywordBadgeColors.length]} text-base font-medium mx-2 px-2.5 py-0.5 rounded`}>{`${keyword} (${this.state.foundKeywords[keyword]})`}</span>
                                              ))}
                                            </p>
                                          </div>
                                        </div>
                                      }
                                      arrow={false}
                                      // trigger="hover"
                                    >
                                    { this.getKeywordCountWidget() }
                                  </Popover>}
        
                              { Object.keys(this.state.foundKeywords).length == 0
                                  && this.getKeywordCountWidget() }
        
                            </div>}
        
                      { this.state.impressionCount != null 
                          && this.state.impressionCount != 0
                          && <Dropdown 
                                label="" 
                                renderTrigger={() => 
                                  <span 
                                    class="flex items-center handy-cursor mx-2 text-blue-800 bg-transparent border border-blue-800 hover:bg-blue-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-blue-600 dark:border-blue-600 dark:text-blue-400 dark:hover:text-white dark:focus:ring-blue-800"
                                    title="Actions">
                                    <LayersIcon 
                                      size="14"
                                      className=""/>
                                  </span>
                                }>
                                { !isLinkedinFeedPostPage(window.location.href) 
                                    && <Tooltip 
                                          content={secondsToHms((this.state.timeCount + this.state.fetchedTimeCount), false)}
                                          placement="left"
                                          style="light"
                                          arrow={false}>
                                          <Dropdown.Item>
                                            <ClockIcon
                                              size="12"
                                              className="me-2"/>
                                            Timer
                                          </Dropdown.Item>
                                        </Tooltip>
                                      }
                                { Object.hasOwn(this.state.reminder, "id") 
                                    && <Dropdown.Item 
                                          onClick={this.handleReminderModalShow}
                                          className="">
                                          <ReminderIcon
                                            size="12"
                                            className="me-2"/>
                                          Show reminder
                                          </Dropdown.Item>}
                                { <Dropdown.Item 
                                          onClick={this.updateReminder}
                                          className={` ${Object.hasOwn(this.state.reminder, "id") ? "text-red-600" : ""}`}>

                                          {Object.hasOwn(this.state.reminder, "id") 
                                              && <DeletionIcon size="12" className="me-2"/>}
                                          {!Object.hasOwn(this.state.reminder, "id") 
                                              && <PlusIcon size="12" className="me-2"/>}

                                          { Object.hasOwn(this.state.reminder, "id") ? "Delete " : "Add " } reminder
                                        </Dropdown.Item>}

                                { !isLinkedinFeedPostPage(window.location.href)
                                  && <Dropdown.Item 
                                      onClick={() => { window.open(`${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${this.props.postUid}`, '_blank'); }}
                                      className="">
                                      <DuplicateIcon
                                        size="12"
                                        className="me-2"/>
                                      Open in a new tab
                                      </Dropdown.Item>}
                              </Dropdown> }
        
                      {/* Indication of the number of this post inpression on the user's feed */}
                      <button 
                        onClick={() => {if (this.state.impressionCount != null) {this.showFeedPostDataModal()}}} 
                        type="button" 
                        class="mx-2 flex items-center text-blue-800 bg-transparent border border-blue-800 hover:bg-blue-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-blue-600 dark:border-blue-600 dark:text-blue-400 dark:hover:text-white dark:focus:ring-blue-800"
                        title={this.state.impressionCount != null ? `${this.state.impressionCount} impression${this.state.impressionCount <= 1 ? "" : "s"}` : "loading..."}
                        >
      
                        { this.state.impressionCount == null
                            &&  <Spinner
                                    aria-label="Extra small spinner example"
                                    className="me-2"
                                    size="xs"
                                  />}
      
                        { this.state.impressionCount != null 
                            && <span class="text-base me-2">({this.state.impressionCount})</span>}

                        <BarChartIcon 
                            size="14"
                            className=""/>
                      </button>

                      {/*Connected posts*/}
                      { this.state.extractedPostData 
                          && <button 
                              onClick={this.showFeedPostRelatedPostsModal} 
                              type="button" 
                              class="mx-2 flex items-center text-blue-800 bg-transparent border border-blue-800 hover:bg-blue-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-blue-600 dark:border-blue-600 dark:text-blue-400 dark:hover:text-white dark:focus:ring-blue-800"
                              title="Previous related posts"
                              >
                              <BranchIcon 
                                  size="14"
                                  className=""/>
                            </button>}

                    </div>
                  </div>
        
                  
                  <FeedPostReminderModal
                    show={this.state.reminderModalShow }
                    onHide={this.handleReminderModalClose}
                    reminder={this.state.reminder}
                    tabId={this.props.tabId}
                    postUid={this.props.postUid}/>

                </div>

      </>
    );
  }
}
