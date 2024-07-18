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

/*import './FeedPostViewsChartModal.css'*/
import React from 'react';
import { 
  appParams, 
} from "../../../popup/Local_library";
import { CheckIcon } from "../../../popup/widgets/SVGs";
import eventBus from "../../../popup/EventBus";
import { DateTime as LuxonDateTime } from "luxon";
import { 
  Spinner,
  Label, 
  TextInput, 
  Textarea 
} from "flowbite-react";

export default class FeedPostReminderModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      processing: false,
    };

    this.sendReminderData = this.sendReminderData.bind(this);
    this.handleReminderTextAreaChange = this.handleReminderTextAreaChange.bind(this);
    this.handleReminderDateInputChange = this.handleReminderDateInputChange.bind(this);

  }

  componentDidMount() {

    if (this.props.reminder){
      this.setState({reminder: this.props.reminder});
    }

  }

  componentWillUnmount(){

  }

  handleReminderTextAreaChange(event) {

    this.setState({reminder: {...this.state.reminder, text: event.target.value}}); 

  }

  handleReminderDateInputChange(event) {

    this.setState({reminder: {...this.state.reminder, date: event.target.value}}); 

  }

  sendReminderData(){

    this.setState({processing: true}, () => {

      this.setState({
        reminder: {...this.state.reminder, objectId: this.props.postUid},
      }, () => {

        // Send message to the background
        chrome.runtime.sendMessage({header: messageMeta.header.CRUD_OBJECT, data: {tabId: this.props.tabId, objectStoreName: "reminders", action: "add", object: this.state.reminder}}, (response) => {
          // Got an asynchronous response with the data from the service worker
          console.log("Post reminder data Request sent !");
        });

      }); 

    });

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.reminder != this.props.reminder){
      this.setState({reminder: this.props.reminder});
    }

  }

  render(){
    return (
      <>

       {  this.props.show
            && <div class={"modal-container-ac84bbb3728 "}>
                 <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
                   
                   <div class="p-4">
       
                     <form className="flex flex-col gap-4">
                       <div>
                         <div className="mb-2 block">
                           <Label 
                             htmlFor="date" 
                             value="Remind at" 
                             className="text-lg"/>
                         </div>
                         <TextInput 
                           id="date" 
                           type="date" 
                           value={this.state.reminder.date}
                           onChange={this.handleReminderDateInputChange} 
                           min={(new Date()).toISOString().split('T')[0]}
                           /*placeholder=""*/ 
                           disabled={Object.hasOwn(this.state.reminder, "id")}
                           className="text-lg"
                           required />
                       </div>
                       <div>
                         <div className="mb-2 block">
                           <Label 
                             htmlFor="content" 
                             value="Content"
                             className="text-lg" />
                         </div>
                         <Textarea 
                           id="content" 
                           rows={4} 
                           value={this.state.reminder.text} 
                           onChange={this.handleReminderTextAreaChange}
                           disabled={Object.hasOwn(this.state.reminder, "id")}
                           className="text-lg"
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
                                   && <button 
                                         type="button" 
                                         onClick={this.sendReminderData}
                                         class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                         Submit
                                       </button> }
       
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
       
                   <div class="p-4 text-lg">
                     <div 
                       onClick={this.props.onHide} 
                       class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                       <span>Dismiss</span>
                     </div>
                   </div>
                   
                 </div>
               </div>}

      </>
    );
  }
}
