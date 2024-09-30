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

/*import './GenericSectionDataModal.css'*/
import React from 'react';
import { 
  appParams,
  dbDataSanitizer,
} from "../../../popup/Local_library";
import ExtensionMarkerView from "./ExtensionMarkerView";
import ProfileSectionNoteView from "./ProfileSectionNoteView";
import ProfileGanttChart from "../../../popup/widgets/Charts/ProfileGanttChart";
import { DateTime as LuxonDateTime } from "luxon";
import { 
  DataApproximationAlert,
  OnProfileIncompleteSectionAlert,
} from "../../injected_scripts/main_lib";

export default class GenericSectionDataModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      modalShow: false,
      profileData: null,
      missingDataObjects: null,
      viewIndex: 0,
      tabLabels: null,
    };

    this.startMessageListener = this.startMessageListener.bind(this);
    this.setMissingDataObjects = this.setMissingDataObjects.bind(this);
    this.onProfileNoteAdded = this.onProfileNoteAdded.bind(this);
    this.onProfileNoteDeleted = this.onProfileNoteDeleted.bind(this);

  }

  handleModalShow = () => {
    this.setState({modalShow: true}); 
  }
  handleModalClose = () => { this.setState({modalShow: false}); }
  

  componentDidMount() {

    if (this.props.profileData){
      this.setState({
        profileData: this.procProfileData(this.props.profileData),
        tabLabels: [this.props.sectionName == "Certifications" ? "Roadmap" : "Chart", "Notes"],
      });
    }

    this.startMessageListener();

  }

  componentDidUpdate(prevProps, prevState){

  }

  startMessageListener(){

      // Retrieving the tabId variable
      chrome.runtime.onMessage.addListener((function(message, sender, sendResponse) {
      
          switch(message.header){

            case "SAVED_PROFILE_OBJECT":{

              // Acknowledge the message
              sendResponse({
                  status: "ACK"
              });
                    
              // if (message.data){
                this.setState({profileData: this.procProfileData(message.data)});
              // }

              break;

            }

            case "PROFILE_ENRICHED_SECTION_DATA":{

              // Acknowledge the message
              sendResponse({
                  status: "ACK"
              });

              if (message.data.sectionName == this.props.sectionName.toLowerCase()){
                var profileData = this.state.profileData;
                profileData[message.data.sectionName] = message.data.sectionData;
                this.setState({profileData: this.procProfileData(profileData)});
              }

              break;
            }

          }
          
      }).bind(this));

  }

  setMissingDataObjects(objects){
    this.setState({missingDataObjects: objects})
  }

  procProfileData(profileData){

    for (var object of profileData[this.props.sectionName.toLowerCase()]){
      if (object == "incomplete" || !object.period){
        continue;
      }
      object.period = dbDataSanitizer.preProcExtractedPeriodString(object.period, LuxonDateTime);
    }

    return profileData;

  }

  setViewIndex = (index) => this.setState({viewIndex: index});

  onProfileNoteAdded(profileNote){
    this.setState({profileData: { ...this.state.profileData, notes: [profileNote].concat(this.state.profileData.notes)}})
  }

  onProfileNoteDeleted(profileNote){
    var notes = this.state.profileData.notes;
    notes.splice(notes.findIndex(n => n.uniqueId == profileNote.uniqueId), 1);
    this.setState({profileData: { ...this.state.profileData, notes: notes}});
  }

  render(){
    return (
      <>
        { this.state.profileData 
            && <ExtensionMarkerView
                onClick={this.handleModalShow} />}


        { this.state.modalShow 
              && <div class={"modal-container-ac84bbb3728 "}>
                      {/*<!-- Main modal -->*/}
                      <div class="mx-auto relative p-4 w-full max-w-5xl max-h-full">
                        {/*<!-- Modal content -->*/}
                        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                          {/*<!-- Modal header -->*/}
                          <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                    {this.props.sectionName} Section Analysis
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

                            <div class="text-lg font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
                              <ul class="flex flex-wrap -mb-px">
                                { this.state.tabLabels?.map((tabLabel, index) => <li class="me-2 handy-cursor" onClick={() => {this.setViewIndex(index)}}>
                                                                      <a
                                                                        class={ this.state.viewIndex == index
                                                                                  ? "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                                                                                  :  "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" }>
                                                                        {tabLabel}
                                                                        { index == 1
                                                                              && <span class="bg-blue-100 text-blue-800 text-base font-medium mx-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                                                                  {this.state.profileData.notes.filter(note => note.section == this.props.sectionName.toLowerCase()).length}+
                                                                                </span>}
                                                                      </a>
                                                                    </li>)}
                              </ul>
                            </div>

                            <div>
                              { this.state.tabLabels?.map((_, index) => <div>
                                                              { index == 0
                                                                  && this.state.viewIndex == index
                                                                  && <div>

                                                                        <DataApproximationAlert/>

                                                                        { this.state.profileData[this.props.sectionName.toLowerCase()].indexOf("incomplete") != -1
                                                                            && <div class="mt-3">
                                                                                <OnProfileIncompleteSectionAlert
                                                                                  sectionName={this.props.sectionName}/>
                                                                              </div> }

                                                                        <ProfileGanttChart
                                                                          profile={this.state.profileData} 
                                                                          periodLabel={this.props.sectionName.toLowerCase()}
                                                                          setMissingDataObjects={this.setMissingDataObjects}/>

                                                                      </div> }

                                                              { index == 1
                                                                  && this.state.viewIndex == index
                                                                  && <ProfileSectionNoteView
                                                                        sectionName={this.props.sectionName}
                                                                        objects={this.state.profileData.notes.filter(note => note.section == this.props.sectionName.toLowerCase())}
                                                                        tabId={this.props.tabId}
                                                                        onProfileNoteAdded={this.onProfileNoteAdded}
                                                                        onProfileNoteDeleted={this.onProfileNoteDeleted}/> }

                                                            </div>) }
                            </div>

                          </div>

                          {/*<!-- Modal footer -->*/}
                          <div class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                            <button data-modal-hide="default-modal" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={this.handleModalClose} >Dismiss</button>
                            {/*<button data-modal-hide="default-modal" type="button" class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Decline</button>*/}
                          </div>

                        </div>
                      </div>
                    </div> }
      </>
    );
  }
}
