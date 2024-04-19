/*import './FeedPostDataMarkerView.css'*/
import React from 'react';
import { 
  appParams,
  messageMeta, 
  secondsToHms,
  categoryVerbMap,
} from "../../popup/Local_library";
import{
  sendTabData,
} from "../../scripts/data_extractor_lib";
import { 
  BarChartIcon, 
  LayersIcon,
  CheckIcon,
} from "../../popup/widgets/SVGs";
import eventBus from "../../popup/EventBus";
import { Dropdown, Spinner, Tooltip } from "flowbite-react";
import { Button, Label, TextInput, Textarea } from "flowbite-react";

const freshReminder = () => {

  return {
    date: (new Date()).toISOString().split('T')[0],
    text: "",
  };

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

export default class FeedPostDataMarkerView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      reminderModalShow: false,
      reminder: freshReminder(),
      processing: false,
      updated: false,
      timerDisplay: false,
      impressionCount: null,
      timeCount: 0, 
      timerInterval: null,
      postHtmlElementVisible: false,
      postHtmlElement: null,
    };

    this.showFeedPostDataModal = this.showFeedPostDataModal.bind(this);
    this.sendReminderData = this.sendReminderData.bind(this);
    this.handleReminderTextAreaChange = this.handleReminderTextAreaChange.bind(this);
    this.handleReminderDateInputChange = this.handleReminderDateInputChange.bind(this);
    this.updateReminder = this.updateReminder.bind(this);
    this.runTimer = this.runTimer.bind(this);
    this.extractSendPostObject = this.extractSendPostObject.bind(this);
    
  }

  componentDidMount() {

    this.startListening();

    this.setState({timerDisplay: this.props.timerDisplay});

    eventBus.on(eventBus.TIMER_DISPLAY_UPDATED, (data) => {
        
        this.setState({timerDisplay: data.timerDisplay});

      }
    );

    const postHtmlElement = document.querySelector(".scaffold-finite-scroll__content")
                            .querySelector(`div[data-id='${this.props.postUid}']`)
                            .querySelector(".feed-shared-update-v2");

    if (isElVisible(postHtmlElement)){
      this.setState({postHtmlElementVisible: true});
    }

    this.setState({postHtmlElement: postHtmlElement}, () => {

      document.addEventListener("scroll", (event) => {

        const visible = isElVisible(this.state.postHtmlElement);
        this.setState({postHtmlElementVisible: visible});

      });

    })

  }

  componentDidUpdate(prevProps, prevState){

    if (prevState.postHtmlElementVisible != this.state.postHtmlElementVisible){

      if (this.state.postHtmlElementVisible){
        if (!this.state.impressionCount){
          this.extractSendPostObject();
        }
        if (!this.state.timerInterval){
          this.runTimer();
        }
      }
      else{
        if (this.state.timerInterval){
          clearInterval(this.state.timerInterval);
          this.setState({timerInterval: null});
        }
      }

    }

  }

  extractSendPostObject(){

    console.log("iiiiiiiiii : ", "extracting");

    var post = {
      id: this.props.postUid,
      category: null,
      content: {},
    };

    const postContainerHeaderElement = this.state.postHtmlElement.querySelector(".update-components-header");

    if (postContainerHeaderElement){

      const headerText = postContainerHeaderElement.textContent.toLowerCase();
      for (var category in categoryVerbMap){

        if (headerText.indexOf(categoryVerbMap[category]) != -1){
          post.category = category;
        }

      };

      post.initiator = {
        name: postContainerHeaderElement.querySelector("a.update-components-text-view__mention") 
            ? postContainerHeaderElement.querySelector("a.update-components-text-view__mention").textContent 
            : null,
        url: postContainerHeaderElement.querySelector("a.app-aware-link ") 
            ? postContainerHeaderElement.querySelector("a.app-aware-link ").href.split("?")[0]
            : null,
        picture: postContainerHeaderElement.querySelector("img")
              ? postContainerHeaderElement.querySelector("img").src 
              : null,
      };

    }

    var reactionsTagContent = this.state.postHtmlElement.querySelector(".social-details-social-counts") 
                  ? this.state.postHtmlElement.querySelector(".social-details-social-counts").textContent
                  : null ;

    const getPostReactionsValues = metric => {

      var value = null;

      if (!reactionsTagContent){
        return value;
      }

      if (["comment", "repost"].indexOf(metric) != -1){

        if (reactionsTagContent.indexOf(metric) != -1){
          for (var arrayItem of reactionsTagContent.split("\n")){
            var index = arrayItem.indexOf(metric);
            if (index != -1){
              value = Number(arrayItem.slice(0, index).replaceAll(",", ""));
              break;
            }
          }
        }

      }

      if (metric == "reaction"){

        var otherTermIndex = reactionsTagContent.indexOf("other");
        if (otherTermIndex != -1){
          value = Number(reactionsTagContent.slice((reactionsTagContent.indexOf("and") + ("and").length), otherTermIndex).replaceAll(",", ""));
          value++;
        }
        else{
          var index1 = -1, index2 = -1, arrayItems = reactionsTagContent.split("\n");
          arrayItems.forEach((arrayItem, index) => {
            index1 = arrayItem.indexOf("comment") != -1 ? index : index1;
            index2 = arrayItem.indexOf("repost") != -1 ? index : index2;
          });

          if (index1 != -1){
            arrayItems.splice(index1, 1);
          }

          if (index2 != -1){
            arrayItems.splice(index1 != -1 ? index2 - 1 : index2, 1);
          }

          const val = Number(arrayItems.join("").replaceAll(",", "")); 
          if (!isNaN(val)){
            value = val;
          }

        }

      }
      
      return value;
    };

    post.content = {
      author:{
        name: this.state.postHtmlElement.querySelector(".update-components-actor__name .visually-hidden")
               ? this.state.postHtmlElement.querySelector(".update-components-actor__name .visually-hidden").textContent
               : null,
        url: this.state.postHtmlElement.querySelector(".update-components-actor__meta a.app-aware-link")
            ? this.state.postHtmlElement.querySelector(".update-components-actor__meta a.app-aware-link").href.split("?")[0]
            : null,
        picture: this.state.postHtmlElement.querySelector(".update-components-actor__container .update-components-actor__image img")
              ? this.state.postHtmlElement.querySelector(".update-components-actor__container .update-components-actor__image img").src
              : null,
      },
      text: this.state.postHtmlElement.querySelector(".feed-shared-update-v2__description-wrapper")
          ? this.state.postHtmlElement.querySelector(".feed-shared-update-v2__description-wrapper").textContent
          : null,
      reactions: getPostReactionsValues("reaction"),
      commentsCount: getPostReactionsValues("comment"),               
      repostsCount: getPostReactionsValues("repost"),
    };

    console.log("iiiiiiiiii : ", "sending");

    sendTabData(this.props.tabId, window.location.href, post);

  }

  runTimer(){

    // var value = 0;
    const timerInterval = setInterval(() => {
        this.setState((prevState) => ({timeCount: (prevState.timeCount + timeInc)}), () => {
          if (!(this.state.timeCount % 3)){
            // sendTabData()
          }
        });
      }, (timeInc * 1000)
    );

    this.setState({timerInterval: timerInterval});

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.TIMER_DISPLAY_UPDATED);

  }

  showFeedPostDataModal(){

    eventBus.dispatch(eventBus.SHOW_FEED_POST_DATA_MODAL, {tabId: this.props.tabId, postUid: this.props.postUid});

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
                  if (reminder.objectId != this.props.postUid){
                    return;
                  }
                  this.setState({
                    reminder: message.data.object, 
                    processing: false,
                    updated: true,
                  }, () => {
                    setTimeout(() => {
                      this.setState({updated: false});
                    }, appParams.TIMER_VALUE);
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
                    }, appParams.TIMER_VALUE);
                  });
                }

              }
              break;
            }

            case "read":{
              if (message.data.objectStoreName == "feedPosts"){

                const index = message.data.objects.map(p => p.id).indexOf(this.props.postUid);
                if (index != -1){
                  if (message.data.objects[index].reminder){
                    this.setState({reminder: message.data.objects[index].reminder})
                  }

                  if (message.data.objects[index].viewsCount){
                    this.setState({impressionCount: message.data.objects[index].viewsCount});
                  }
                }

              }

              break;
            }

          }

          break;

        }

      }

    });

  }

  handleReminderModalClose = () => this.setState({reminderModalShow: false});
  handleReminderModalShow = () => this.setState({reminderModalShow: true});

  /*() => this.setState((prevState) => ({timerDisplay: !prevState.timerDisplay}),*/
  toggleTimerDisplay = () => {

    // let the other markers know of the change of settings
    eventBus.dispatch(eventBus.TIMER_DISPLAY_UPDATED, {timerDisplay: !this.state.timerDisplay});

  };

  sendReminderData(){

    this.setState({processing: true}, () => {

      this.setState(prevState => {
        let reminder = Object.assign({}, prevState.reminder);
        reminder.objectId = this.props.postUid;
        return { reminder };
      }, () => {

        // Send message to the background
        chrome.runtime.sendMessage({header: messageMeta.header.CRUD_OBJECT, data: {tabId: this.props.tabId, objectStoreName: "reminders", action: "add", object: this.state.reminder}}, (response) => {
          // Got an asynchronous response with the data from the service worker
          console.log("Post reminder data Request sent !");
        });

      }); 

    });

  }

  handleReminderTextAreaChange(event) {

    this.setState(prevState => {
      let reminder = Object.assign({}, prevState.reminder);
      reminder.text = event.target.value;
      return { reminder };
    }); 

  }

  handleReminderDateInputChange(event) {

    this.setState(prevState => {
      let reminder = Object.assign({}, prevState.reminder);
      reminder.date = event.target.value;
      return { reminder };
    }); 

  }

  updateReminder(){

    if (Object.hasOwn(this.state.reminder, "id")){

      this.setState({processing: true}, () => {

        // Send message to the background
        chrome.runtime.sendMessage({header: messageMeta.header.CRUD_OBJECT, data: {tabId: this.props.tabId, objectStoreName: "reminders", action: "delete", object: this.state.reminder}}, (response) => {
          // Got an asynchronous response with the data from the service worker
          console.log("Post reminder data Request sent !");
        });

      });

    }
    else{
      this.handleReminderModalShow();
    }

  }

  render(){
    return (
      <>
        <div class={"shadow w-full inline-flex p-4 mb-4 py-1 text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800 "} role="alert">
          <div class="flex items-center">
            <Tooltip content="Proudly yours">
              <svg class="flex-shrink-0 w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"></path>
              </svg>
            </Tooltip>
            <span class="sr-only">Info</span>
            <h3 class="text-sm font-medium">LinkBeam</h3>
          </div>
          
          <div class="flex ml-auto">
            {/*<button onClick={() => {}} type="button" class="text-white bg-blue-800 hover:bg-blue-900 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              <svg class="-ml-0.5 mr-2 h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
                <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"></path>
              </svg>
              
              {this.state.commentsCount != null && <span class="ml-1">{"("+this.state.commentsCount+")"}</span>}
            </button>*/}

            { this.state.timerDisplay 
                && <span class="flex items-center bg-blue-100 text-blue-800 text-xl font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                    {secondsToHms(this.state.timeCount, false)}
                  </span>}

            { this.state.updated 
                && <span class="flex items-center bg-green-100 text-green-800 text-xl font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                      Updated
                      <CheckIcon
                        size="16"
                        className="ml-2"/>
                  </span>}

            <Dropdown 
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
              <Tooltip content={secondsToHms(this.state.timeCount, false)}>
                <Dropdown.Item 
                  // onClick={this.toggleTimerDisplay}
                  >
                  {/*{ `${this.state.timerDisplay ? "Hide" : "Show"}` } */}
                  Timer
                </Dropdown.Item>
              </Tooltip>
              { Object.hasOwn(this.state.reminder, "id") 
                  && <Dropdown.Item 
                        onClick={this.handleReminderModalShow}
                        className="">
                        Show reminder
                        </Dropdown.Item>}
              <Dropdown.Item 
                onClick={this.updateReminder}
                className={` ${Object.hasOwn(this.state.reminder, "id") ? "text-red-600" : ""}`}>
                { Object.hasOwn(this.state.reminder, "id") ? "Delete " : "Add " } reminder
              </Dropdown.Item>
            </Dropdown>


            <Tooltip content={this.state.impressionCount ? `${this.state.impressionCount} impression${this.state.impressionCount <= 1 ? "" : "s"}` : "loading..."}>
              <button 
                onClick={() => {if (this.state.impressionCount) {this.showFeedPostDataModal()}}} 
                type="button" 
                class="flex items-center text-blue-800 bg-transparent border border-blue-800 hover:bg-blue-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-blue-600 dark:border-blue-600 dark:text-blue-400 dark:hover:text-white dark:focus:ring-blue-800"
                >

                { !this.state.impressionCount
                    &&  <Spinner
                            aria-label="Extra small spinner example"
                            className="me-2"
                            size="xs"
                          />}

                { this.state.impressionCount && <span class="text-base me-2">({this.state.impressionCount})</span>}
                <BarChartIcon 
                    size="14"
                    className=""/>
              </button>
            </Tooltip>
          </div>
        </div>



        <div class={"modal-container-ac84bbb3728 " + (this.state.reminderModalShow ? "" : "hidden")}>
          <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
            
            <div class="p-4">

              <form className="flex flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="date" value="Remind at" />
                  </div>
                  <TextInput 
                    id="date" 
                    type="date" 
                    value={this.state.reminder.date}
                    onChange={this.handleReminderDateInputChange} 
                    /*placeholder=""*/ 
                    disabled={Object.hasOwn(this.state.reminder, "id")}
                    required />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="content" value="Content" />
                  </div>
                  <Textarea 
                    id="content" 
                    rows={4} 
                    value={this.state.reminder.text} 
                    onChange={this.handleReminderTextAreaChange}
                    disabled={Object.hasOwn(this.state.reminder, "id")}
                    required />
                </div>

                { this.state.processing 
                    && <div  
                          class="text-green-500 pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                          <Spinner aria-label="Default status example" className="mx-auto" />
                        </div>}
                        
                { !this.state.processing 
                    && <div>

                        { !Object.hasOwn(this.state.reminder, "id") 
                            && <Button className="w-full" onClick={this.sendReminderData}>Submit</Button> }

                        { Object.hasOwn(this.state.reminder, "id") 
                          && <div  
                                class="text-green-500 pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                                <span>
                                  <CheckIcon
                                    size="18"
                                    className="mx-auto"/>
                                </span>
                              </div> }

                      </div>  }
              </form>

            </div>

            <div class="p-4">
              <div 
                onClick={this.handleReminderModalClose} 
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
