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

/*import './FeedPostDataModal.css'*/
import React from 'react';
import { 
  appParams, 
  getChartColors,
  messageMeta,
  getFeedLineChartsData,
  getPostMetricValue,
} from "../../popup/Local_library";
import { BarChartIcon } from "../../popup/widgets/SVGs";
import eventBus from "../../popup/EventBus";
import { Spinner } from "flowbite-react";
// import { Button, Modal } from "flowbite-react";
import { DateTime as LuxonDateTime } from "luxon";

// import { faker } from '@faker-js/faker';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);


export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Chart.js Line Chart',
    },
  },
};

export default class FeedPostDataModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      show: false,
      post: null,
      data: null,
      freshPost: false,
    };

    this.startListening = this.startListening.bind(this);
    this.setChartData = this.setChartData.bind(this);
    this.checkPostFreshness = this.checkPostFreshness.bind(this);

  }

  componentDidMount() {

    this.startListening();

    eventBus.on(eventBus.SHOW_FEED_POST_DATA_MODAL, (data) => {
        
        this.setState({show: true, post: data.object}, () => {

          chrome.runtime.sendMessage({header: messageMeta.header.REQUEST_POST_VIEWS_DATA, data: {tabId: this.props.tabId, postUid: data.object.id}}, (response) => {
            // Got an asynchronous response with the data from the service worker
            console.log("Post views data request sent !");
          });

        });

      }
    );

  }

  startListening(){

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

      // acknowledge receipt
      sendResponse({
          status: "ACK"
      });

      switch(message.header){

        case messageMeta.header.RESPONSE_POST_VIEWS_DATA:{

          this.setChartData(message.data.lastDataResetDate, message.data.objects);

          break;

        }

      }

    });

  }

  checkPostFreshness(objects){

    var fresh = true;
    const today = new Date().toISOString().split("T")[0];
    if (objects[0].date.split("T")[0] == today){
      for (var object of objects){
        if (object.date.split("T")[0] != today){
          fresh = false;
          break;
        }
      }
    }
    else{
      fresh = false;
    }

    this.setState({freshPost: fresh});

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.SHOW_FEED_POST_DATA_MODAL);

  }

  setChartData(lastDataResetDate, objects){

    const titles = ["reactions", "comments", "reposts"];
    const colors = getChartColors(titles.length);

    const rangeDates = {
      start: lastDataResetDate.split("T")[0],
      end: new Date().toISOString().split("T")[0],
    }

    this.checkPostFreshness(objects);

    const data = getFeedLineChartsData(objects, rangeDates, getPostMetricValue, titles, {luxon: LuxonDateTime});

    const datasets = titles.map((title, index) => 
      ({
        label: `# of ${title}`,
        fill: false,
        data: data.values[title],
        borderColor: [colors.borders[index]],
        backgroundColor: [colors.borders[index]],
      })
    );

    this.setState({
      data: {
        labels: data.labels,
        datasets: datasets,
      }
    });

  }

  handleModalClose = () => { this.setState({show: false, data: null}); }

  render(){
    return (
      <>
        <div class={"modal-container-ac84bbb3728 " + (this.state.show ? "" : "hidden")}>
          <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
            
            <div class="p-4">

              { !this.state.data 
                  && <div class="text-center">
                      <Spinner aria-label="Default status example" />
                    </div>}

              { this.state.data
                    && <div>
                          { this.state.freshPost && <div id="alert-border-4" class="flex items-center p-4 mb-4 text-yellow-800 border-t-4 border-yellow-300 bg-yellow-50 dark:text-yellow-300 dark:bg-gray-800 dark:border-yellow-800" role="alert">
                                                        <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                                        </svg>
                                                        <div class="ms-3 text-sm font-medium">
                                                          Just to notice that this is the first time this post appears on your feed
                                                        </div>
                                                        {/*<button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-yellow-50 text-yellow-500 rounded-lg focus:ring-2 focus:ring-yellow-400 p-1.5 hover:bg-yellow-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-yellow-300 dark:hover:bg-gray-700" data-dismiss-target="#alert-border-4" aria-label="Close">
                                                          <span class="sr-only">Dismiss</span>
                                                          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                                          </svg>
                                                        </button>*/}
                                                    </div>}
                          <Line options={options} data={this.state.data} />
                      </div> }

            </div>

            <div class="p-4">
              <div 
                onClick={this.handleModalClose} 
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
