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

/*import './AboutDataChartWidget.css'*/
import React from 'react';
import { 
    appParams,
    dbDataSanitizer,
} from "../../../popup/Local_library";
import { DateTime as LuxonDateTime } from "luxon";
import ExtensionMarkerView from "./ExtensionMarkerView";
import ProfileAboutBubbleChart from '../../../popup/widgets/charts/ProfileAboutBubbleChart';

export default class AboutDataChartWidget extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            modalShow: false,
            wordsData: null,
            profileData: null,
        };

        this.startMessageListener = this.startMessageListener.bind(this);

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
                      
                if (!this.state.wordsData){

                    const profileData = message.data;

                    var wordsData = {};
                    for (var word of dbDataSanitizer.profileAbout(profileData.info).split(" ")){
                        if (!word.length){
                            continue;
                        }

                        wordsData[word] = !(word in wordsData) ? 1 : wordsData[word] + 1;
                    }

                    this.setState({wordsData: wordsData, profileData: profileData});

                }
            }
            
        }).bind(this));

    }

    render(){
        return (
          <>
            { this.state.wordsData
                && <ExtensionMarkerView
                    onClick={this.handleModalShow} />}


            { this.state.modalShow 
                  && <div class={"modal-container-ac84bbb3728 "}>
                        <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
                          
                            <div class="p-4">
                                <div class="grid grid-cols-4 gap-4">
                                    {[{
                                        cardText: "Word count",
                                        cardTitle: dbDataSanitizer.profileAbout(this.state.profileData.info).split(" ").filter(word => word.length).length,
                                        onClickFunc: null,
                                    },
                                    {
                                        cardText: "Character count",
                                        cardTitle: dbDataSanitizer.preSanitize(this.state.profileData.info).length,
                                        onClickFunc: null,
                                    },
                                    {
                                        cardText: "Average word length",
                                        cardTitle: (Object.keys(this.state.wordsData).map(word => word.length).reduce((acc, a) => acc + a, 0) / Object.keys(this.state.wordsData).length).toFixed(1),
                                        onClickFunc: null,
                                    },
                                    {
                                        cardText: "Unique words",
                                        cardTitle: `${(((Object.keys(this.state.wordsData).filter(word => this.state.wordsData[word] == 1).length * 100) / Object.keys(this.state.wordsData).length)).toFixed(1)}%`,
                                        onClickFunc: null,
                                    }].map(item => (<a href="#" class="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                                    
                                                                        <h6 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                                            {item.cardTitle}
                                                                        </h6>
                                                                        <p class="font-normal text-gray-700 dark:text-gray-400">
                                                                            {item.cardText}
                                                                        </p>
                                                                    </a>))}
                                </div>
                  
                                {this.state.wordsData 
                                    && /*<div class="border border-1 mb-3 mt-2 shadow rounded">*/
                                        <ProfileAboutBubbleChart 
                                            objectData={this.state.wordsData}/>
                                    /*</div>*/}

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
