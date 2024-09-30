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

/*import './ProfileSectionNoteView.css'*/
import React from 'react';
import { Popover, Spinner } from "flowbite-react";
import { 
  isLinkedinProfilePage,
  messageMeta,
  appParams,
} from "../../../popup/Local_library";
import { 
  DeletionIcon,
} from "../../../popup/widgets/SVGs";
import { DateTime as LuxonDateTime } from "luxon";

export default class ProfileSectionNoteView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      newNote: null,
      processing: false,
      updated: false,
      allNotes: null,
    };

    this.startMessageListener = this.startMessageListener.bind(this);
    this.saveNewNote = this.saveNewNote.bind(this);
    this.deleteProfileNote = this.deleteProfileNote.bind(this);

  }  

  componentDidMount() {

    this.startMessageListener();

    this.setState({allNotes: this.props.objects});

  }

  saveNewNote(){

    this.setState({processing: true}, () => {

      const note = {
        url: isLinkedinProfilePage(window.location.href.split("?")[0])[0],
        text: this.state.newNote,
        section: this.props.sectionName.toLowerCase(),
      };

      // Send message to the background
      chrome.runtime.sendMessage({header: messageMeta.header.CRUD_OBJECT, data: {tabId: this.props.tabId, objectStoreName: "profileNotes", action: "add", object: note}}, (response) => {
        // Got an asynchronous response with the data from the service worker
        console.log("Post reminder data Request sent !");
      });

    });

  }

  deleteProfileNote(profileNote){
    if (!confirm("Do you confirm the deletion of this note ?")){
      return;
    }

    // Send message to the background
    chrome.runtime.sendMessage({header: messageMeta.header.CRUD_OBJECT, data: {tabId: this.props.tabId, objectStoreName: "profileNotes", action: "delete", object: profileNote}}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log("Post reminder data Request sent !");
    });
  }

  handleNoteAreaInputChange = (event) => this.setState({newNote: event.target.value});

  startMessageListener(){

      // Retrieving the tabId variable
      chrome.runtime.onMessage.addListener((function(message, sender, sendResponse) {
      
          switch(message.header){

            case messageMeta.header.CRUD_OBJECT_RESPONSE:{

              switch(message.data.action){

                case "add":{
                  if (message.data.objectStoreName == "profileNotes"){

                    if (message.data.object){
                      const profileNote = message.data.object;
                      if (profileNote.section != this.props.sectionName.toLowerCase()){
                        return;
                      }
                      this.setState({
                        allNotes: [profileNote].concat(this.state.allNotes),
                        newNote: "", 
                        processing: false,
                        updated: true,
                      }, () => {
                        setTimeout(() => {
                          this.setState({updated: false});
                        }, appParams.TIMER_VALUE_1);

                        this.props.onProfileNoteAdded(profileNote);
                      });
                    }

                  }
                  break;
                }

                case "delete":{
                  if (message.data.objectStoreName == "profileNotes"){

                    if (message.data.object){
                      const profileNote = message.data.object;
                      if (profileNote.section != this.props.sectionName.toLowerCase()){
                        return;
                      }

                      var allNotes = this.state.allNotes;
                      allNotes.splice(allNotes.findIndex(n => n.uniqueId == profileNote.uniqueId), 1);
                      this.setState({
                        allNotes: allNotes,
                        processing: false,
                        updated: true,
                      }, () => {
                        setTimeout(() => {
                          this.setState({updated: false});
                        }, appParams.TIMER_VALUE_1);

                        this.props.onProfileNoteDeleted(profileNote);
                      });
                    }

                  }
                  break;
                }
              }
            }
          }
          
      }).bind(this));

  }

  render(){
    return (
      <>
        <div>
          <form class="">
            <label 
              for="message" 
              class="block mb-2 text-lg font-medium text-gray-900 dark:text-white">
              New note
            </label>
            <textarea 
              id="message" 
              rows="4" 
              value={this.state.newNote}
              onChange={this.handleNoteAreaInputChange}
              class="block p-2.5 w-full text-lg text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
              placeholder="Your note here ...">
            </textarea>
            <div>
              { this.state.processing 
                  && <Spinner aria-label="Default status example" /> }
              { !this.state.processing
                  && <button 
                      data-modal-hide="default-modal" 
                      type="button" 
                      class="ms-auto mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" 
                      onClick={this.saveNewNote}>
                      Save
                    </button>}
            </div>
          </form>


          { this.state.allNotes 
              && <div>
                    <p>Notes</p>
                    <ol class="relative border-s border-gray-200 dark:border-gray-700 mt-3">                  
                      { this.state.allNotes.map(note => <li class="mb-10 ms-4">
                                                          <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                                          <time class="mb-1 text-lg font-normal leading-none text-gray-400 dark:text-gray-500">
                                                            {LuxonDateTime.fromISO(note.createdOn).toFormat('MMMM dd yyyy, hh:mm a')}
                                                          </time>
                                                          {/*<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                                              Application UI code in Tailwind CSS
                                                            </h3>*/}
                                                          <p class="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
                                                            {note.text}
                                                          </p>
                                                          <a 
                                                            class="hand-cursor inline-flex items-center px-4 py-2 text-lg font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                                                            onClick={() => this.deleteProfileNote(note)}>
                                                            <DeletionIcon size="12" className="me-2 text-red-600"/>
                                                            Delete
                                                            {/*<svg class="w-3 h-3 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                                              </svg>*/}
                                                          </a>
                                                      </li>) }
                    </ol> 
                  </div>}
        </div>
      </>
    );
  }
}
