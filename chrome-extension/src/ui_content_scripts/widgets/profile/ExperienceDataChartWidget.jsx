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

/*import './ExperienceDataChartWidget.css'*/
import React from 'react';
import { 
  appParams,
  dbDataSanitizer,
} from "../../../popup/Local_library";
import ExtensionMarkerView from "./ExtensionMarkerView";
import ProfileGanttChart from "../../../popup/widgets/charts/ProfileGanttChart";
import { DateTime as LuxonDateTime } from "luxon";

export default class ExperienceDataChartWidget extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      modalShow: false,
      profileData: null,
      missingDataObjects: null,
    };

    this.startMessageListener = this.startMessageListener.bind(this);
    this.setMissingDataObjects = this.setMissingDataObjects.bind(this);

  }

  handleModalShow = () => {
    this.setState({modalShow: true}); 
  }
  handleModalClose = () => { this.setState({modalShow: false}); }
  

  componentDidMount() {

    this.startMessageListener();

  }

  componentDidUpdate(prevProps, prevState){

  }

  startMessageListener(){

      // Retrieving the tabId variable
      chrome.runtime.onMessage.addListener((function(message, sender, sendResponse) {
      
          if (message.header == "SAVED_PROFILE_OBJECT") {

              // Acknowledge the message
              sendResponse({
                  status: "ACK"
              });
                    
              if (!this.state.profileData){

                  this.setState({profileData: this.procProfileData(message.data) });
              }
          }
          
      }).bind(this));

  }

  setMissingDataObjects(objects){
    this.setState({missingDataObjects: objects})
  }

  procProfileData(profileData){

    // experience
    for (var experience of profileData.experience){
      experience.period = dbDataSanitizer.periodDates(experience.period, LuxonDateTime);
    }

    return profileData;

  }

  render(){
    return (
      <>
        { this.state.profileData 
            && <ExtensionMarkerView
                onClick={this.handleModalShow} />}


        { this.state.modalShow 
              && <div class={"modal-container-ac84bbb3728 "}>
                    <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
                      
                      <div class="p-4">
                        <ProfileGanttChart
                          profile={this.state.profileData} 
                          periodLabel="experience"
                          setMissingDataObjects={this.setMissingDataObjects}/>
                      </div>
          
                      <div class="p-4 text-lg">
                        <div 
                          onClick={this.handleModalClose} 
                          class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                          <span>Dismiss</span>
                        </div>
                      </div>
                      
                    </div>
                  </div> }
      </>
    );
  }
}
