/*import './WebUiRequestToast.css'*/
import React from 'react';
import { 
    appParams, 
    dbDataSanitizer, 
    isLinkedinProfilePage,
    messageMeta,
} from "../../popup/Local_library";
import { db } from "../../db";
import { DateTime as LuxonDateTime } from "luxon";
import elevator_tone_audio from '../../assets/audio/elevator-tone.mp3';
import { 
  Tooltip, 
} from "flowbite-react";


export default class TodayRemindersListModal extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            remindersModalShow: false,
        };

        this.startMessageListener = this.startMessageListener.bind(this);

    }

    handleRemindersModalShow = () => {
        this.setState({remindersModalShow: true});
    }

    handleRemindersModalClose = () => {
       this.setState({remindersModalShow: false}); 
    }
  

    componentDidMount() {

        this.startMessageListener();

        var audioElement = new Audio(chrome.runtime.getURL("/assets/elevator-tone.mp3"));
        audioElement.play();

    }

    startMessageListener(){

        // Retrieving the tabId variable
        chrome.runtime.onMessage.addListener((function(message, sender, sendResponse) {
        
            if (message.header == messageMeta.header.CS_SETUP_DATA) {

                // Acknowledge the message
                sendResponse({
                    status: "ACK"
                });
                      
                if (Object.hasOwn(message.data, "show")){
                    if (message.data.widget == "ReminderModal"){
                        this.handleRemindersModalShow();
                    }
                }
            }
            
        }).bind(this));
    }


  render(){
    return (
      <>

        { this.state.remindersModalShow 
            && <div class={`${this.props.className ? this.props.className : null}`}>
                  <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
        
                    { this.props.objects 
                        &&  <>
                                { this.props.objects.map((reminder, index) => <ReminderListItemView object={reminder} /> ) }
                            </> } 
                    
                    <div class="p-4 text-lg">
                      <div onClick={this.handleRemindersModalClose} class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                        <span>Dismiss</span>
                      </div>
                    </div>

                  </div>
                </div>}
      </>
    );
  }
}

const ReminderListItemView = (props) => {

    return (

        <div class="flex items-center p-4">
            <img src={isLinkedinProfilePage(props.object.objectId) ? (props.object.object.avatar ? props.object.object.avatar : chrome.runtime.getURL("/assets/default.png")) : chrome.runtime.getURL("/assets/linkedin_icon.png")} alt="twbs" width="40" height="40" class="rounded-circle flex-shrink-0 rounded shadow"/>
            <div class="ml-4 flex-auto text-2xl">
              <div class="font-medium inline-flex items-center">
                <a 
                    class="mr-3" 
                    href={ isLinkedinProfilePage(props.object.objectId) ? `https://${props.object.objectId}` : `https://www.linkedin.com/feed/update/${props.object.objectId}`} 
                    target="_blank">
                    { isLinkedinProfilePage(props.object.objectId) 
                        && <span>{dbDataSanitizer.preSanitize(props.object.object.fullName)}</span> }
                    { !isLinkedinProfilePage(props.object.objectId)
                        && <Tooltip content={props.object.object.initiator ? dbDataSanitizer.preSanitize(props.object.object.initiator.name) : dbDataSanitizer.preSanitize(props.object.object.content.author.name)}>
                            Feed Post
                        </Tooltip>}
                </a>
                <span class="font-light text-base ml-2">{LuxonDateTime.fromISO(props.object.createdOn).toRelative()}</span>
              </div>
              <div class="mt-1 text-slate-700 text-lg">
                { props.object.text }
              </div>
            </div>
            {/*<div onClick={this.handleRemindersModalShow} class="pointer-events-auto ml-4 flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
              Close
            </div>*/}
        </div>

    );

}
