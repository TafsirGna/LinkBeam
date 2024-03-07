/*import './WebUiRequestToast.css'*/
import React from 'react';
import { appParams, dbDataSanitizer, deactivateTodayReminders } from "../../popup/Local_library";
import { db } from "../../db";
import { DateTime as LuxonDateTime } from "luxon";
import default_user_icon from '../../assets/user_icons/default.png';
import elevator_tone_audio from '../../assets/audio/elevator-tone.mp3';


export default class InjectedReminderToastView extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            remindersToastShow: true,
            remindersModalShow: false,
        };

        this.handleRemindersToastClose = this.handleRemindersToastClose.bind(this);
    }

    handleRemindersToastShow = () => { this.setState({remindersToastShow: true}); }
    handleRemindersToastClose = (callback = null) => { this.setState({remindersToastShow: false}, () => { if (callback) {callback()}}); }

    handleRemindersModalShow = () => {
        if (this.state.remindersToastShow){
            this.handleRemindersToastClose(() => {
                this.setState({remindersModalShow: true}); 
            });
        }
        else{
            this.setState({remindersModalShow: true}); 
        }
    }

    handleRemindersModalClose = () => {
       this.setState({remindersModalShow: false}, () => {
            deactivateTodayReminders(db);
       }); 
    }
  

  componentDidMount() {

    var audioElement = new Audio(chrome.runtime.getURL("/assets/elevator-tone.mp3"));
    audioElement.play();

  }

  render(){
    return (
      <>
        {this.state.remindersToastShow && <div class="toast-container-ac84bbb3728">
                    <div id="toast-interactive" class="fixed bottom-5 right-5 w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:bg-gray-800 dark:text-gray-400" role="alert">
                        <div class="flex">
                            <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:text-blue-300 dark:bg-blue-900">
                                <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97"/>
                                </svg>
                                <span class="sr-only">Refresh icon</span>
                            </div>
                            <div class="ml-3 text-sm font-normal">
                                <span class="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{appParams.appName}</span>
                                <div class="mb-2 text-sm font-normal">{this.props.objects.length} reminder{ this.props.objects.length > 1 ? "s" : ""} waiting</div> 
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <a onClick={this.handleRemindersModalShow} /*href="#"*/ class="handy-cursor inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">
                                          View
                                        </a>
                                    </div>
                                    <div>
                                        <a onClick={this.handleRemindersToastClose} class="handy-cursor inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700">
                                          Dismiss
                                        </a> 
                                    </div>
                                </div>    
                            </div>
                            <button onClick={this.handleRemindersToastClose} type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-interactive" aria-label="Close">
                                <span class="sr-only">Close</span>
                                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>}

        { this.state.remindersModalShow && <div class={"modal-container-ac84bbb3728 "}>
                  <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
        
                    { this.props.objects &&  <>
                                                            { this.props.objects.map((reminder, index) => <ReminderListItemView object={reminder} /> ) }
                                                            
                                                        </> } 
                    
                    
                    <div class="p-4">
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
            <img src={props.object.profile.avatar ? props.object.profile.avatar : default_user_icon} alt="twbs" width="40" height="40" class="rounded-circle flex-shrink-0 rounded shadow"/>
            <div class="ml-4 flex-auto">
              <div class="font-medium inline-flex items-center">
                <a class="mr-3" href={ /*props.appSettingsData.productID == props.object.createdOn ? "#" :  "/web_ui.html?web-ui-page-profile-id="+props.object.get("createdBy").getUsername()*/ "#" } target="_blank">
                  { dbDataSanitizer.preSanitize(props.object.profile.fullName) }
                </a>
                <span class="font-light text-xs ml-2">{LuxonDateTime.fromISO(props.object.createdOn).toRelative()}</span>
              </div>
              <div class="mt-1 text-slate-700 text-sm">
                { props.object.text }
              </div>
            </div>
            {/*<div onClick={this.handleRemindersModalShow} class="pointer-events-auto ml-4 flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
              Close
            </div>*/}
        </div>

    );

}
