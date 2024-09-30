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

/*import './AboutDataModal.css'*/
import React from 'react';
import { 
    appParams,
    dbDataSanitizer,
} from "../../../popup/Local_library";
import { DateTime as LuxonDateTime } from "luxon";
import ExtensionMarkerView from "./ExtensionMarkerView";
import ProfileAboutBubbleChart from '../../../popup/widgets/Charts/ProfileAboutBubbleChart';
import { DataApproximationAlert } from "../../injected_scripts/main_lib";

export default class AboutDataModal extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            modalShow: false,
            wordsData: null,
            profileData: null,
        };

        this.startMessageListener = this.startMessageListener.bind(this);
        this.setWordsData = this.setWordsData.bind(this);

    }

    handleModalShow = () => { this.setState({modalShow: true}); }
    handleModalClose = () => { this.setState({modalShow: false}); }

    componentDidMount() {

        if (this.props.profileData){
            this.setWordsData(this.props.profileData);
        }

        this.startMessageListener();

    }

    componentDidUpdate(prevProps, prevState){

    }

    setWordsData(profileData){

        var wordsData = {};
        for (var word of dbDataSanitizer.profileAbout(profileData.info).split(" ")){
            if (!word.length){
                continue;
            }

            wordsData[word] = !(word in wordsData) ? 1 : wordsData[word] + 1;
        }

        this.setState({wordsData: wordsData, profileData: profileData});

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
                    this.setWordsData(profileData);
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
                      {/*<!-- Main modal -->*/}
                      <div class="mx-auto relative p-4 w-full max-w-5xl max-h-full">
                        {/*<!-- Modal content -->*/}
                        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            {/*<!-- Modal header -->*/}
                            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                      About Section Analysis
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

                                <DataApproximationAlert/>

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
