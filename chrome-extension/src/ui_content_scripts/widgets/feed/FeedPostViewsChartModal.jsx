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
  getChartColors,
  messageMeta,
  getFeedLineChartsData,
  getPostMetricValue,
  isLinkedinFeedPostPage,
} from "../../../popup/Local_library";
import { BarChartIcon } from "../../../popup/widgets/SVGs";
import eventBus from "../../../popup/EventBus";
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
      text: 'Post Trending Evolution Line Chart',
    },
  },
};

export default class FeedPostViewsChartModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      show: false,
      data: null,
      freshPost: false,
      metricChangeValues: null, 
      pageUrl: window.location.href,
    };

    this.startListening = this.startListening.bind(this);
    this.setChartData = this.setChartData.bind(this);
    this.checkPostFreshness = this.checkPostFreshness.bind(this);
    this.setMetricChangeValues = this.setMetricChangeValues.bind(this);

  }

  componentDidMount() {

    this.startListening();

    eventBus.on(eventBus.SHOW_FEED_POST_DATA_MODAL, (data) => {

        if (data.from.split("?")[0] != this.state.pageUrl.split("?")[0]){
          return;
        }
        
        this.setState({
          show: true, 
          metricChangeValues: null,
        }, () => {

          chrome.runtime.sendMessage({header: messageMeta.header.CRUD_OBJECT, data: {tabId: this.props.tabId, action: "read", objectStoreName: "feedPostViews", props: {htmlElId: data.htmlElId}}}, (response) => {
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

        case messageMeta.header.CRUD_OBJECT_RESPONSE:{

          if (message.data.objectStoreName == "feedPostViews"){
            var feedPostViews = message.data.object.views;
            this.setChartData(feedPostViews);
            this.setMetricChangeValues(feedPostViews);
          }

          break;

        }

      }

    });

  }

  setMetricChangeValues(feedPostViews){

    if (feedPostViews.length < 2){
      return;
    }

    // feedPostViews.sort(function(a, b){ return new Date(b.date) - new Date(a.date) });
    const views = feedPostViews.toReversed();

    const values = {
      numbers: {
        reactions: views[0].reactions - views[1].reactions,
        comments: views[0].commentsCount - views[1].commentsCount,
        reposts: views[0].repostsCount - views[1].repostsCount,
      },
      percentages: {
        reactions: !views[1].reactions ? "-" : (((views[0].reactions - views[1].reactions) / views[1].reactions) * 100).toFixed(1),
        comments: !views[1].commentsCount ? "-" : (((views[0].commentsCount - views[1].commentsCount) / views[1].commentsCount) * 100).toFixed(1),
        reposts: !views[1].repostsCount ? "-" : (((views[0].repostsCount - views[1].repostsCount) / views[1].repostsCount) * 100).toFixed(1), 
      }
    };

    this.setState({metricChangeValues: values});

  }

  checkPostFreshness(objects){

    var fresh = false;

    if (isLinkedinFeedPostPage(window.location.href)){
      return fresh;
    }

    const today = new Date().toISOString().split("T")[0];
    if (objects.length == 1 
          && objects[0].date.split("T")[0] == today){
      fresh = true; 
    }

    this.setState({freshPost: fresh});

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.SHOW_FEED_POST_DATA_MODAL);

  }

  async setChartData(objects){

    const titles = ["reactions", "comments", "reposts"];
    const colors = getChartColors(titles.length);

    const rangeDates = {
      start: this.props.appSettings.lastDataResetDate.split("T")[0],
      end: new Date().toISOString().split("T")[0],
    }

    this.checkPostFreshness(objects);

    const data = await getFeedLineChartsData(objects, rangeDates, getPostMetricValue, titles, LuxonDateTime);

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

        <div class={`modal-container-ac84bbb3728 ${(this.state.show ? "" : "hidden")}`}>
          {/*<!-- Main modal -->*/}
          <div class="mx-auto relative p-4 w-full max-w-5xl max-h-full">
              {/*<!-- Modal content -->*/}
              <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                  {/*<!-- Modal header -->*/}
                  <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                      <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                          Post 
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

                      { !this.state.data 
                          && <div class="text-center">
                              <Spinner aria-label="Default status example" />
                            </div>}

                      { this.state.data
                          && <div>
                                { this.state.freshPost 
                                    && <div id="alert-border-4" class="flex items-center p-4 mb-4 text-yellow-800 border-t-4 border-yellow-300 bg-yellow-50 dark:text-yellow-300 dark:bg-gray-800 dark:border-yellow-800" role="alert">
                                            <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                            </svg>
                                            <div class="ms-3 text-sm font-medium">
                                              Just to let you notice that this is the first time this post appears on your feed
                                            </div>
                                            {/*<button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-yellow-50 text-yellow-500 rounded-lg focus:ring-2 focus:ring-yellow-400 p-1.5 hover:bg-yellow-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-yellow-300 dark:hover:bg-gray-700" data-dismiss-target="#alert-border-4" aria-label="Close">
                                              <span class="sr-only">Dismiss</span>
                                              <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                              </svg>
                                            </button>*/}
                                        </div> }

                                { this.state.metricChangeValues 
                                    && <div class="text-lg">
                                        { Object.keys(this.state.metricChangeValues.numbers).map(metric => (
                                            <span class={`${this.state.metricChangeValues.numbers[metric] == 0 
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                                                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"} 
                                                          font-medium me-2 px-2.5 py-0.5 rounded`}>
                                              {`${this.state.metricChangeValues.numbers[metric] >= 0 ? "+" : ""} ${this.state.metricChangeValues.numbers[metric]} ${metric} (${this.state.metricChangeValues.percentages[metric]}%)`}
                                            </span>
                                          ))}
                                    </div>}
                                    
                                <Line options={options} data={this.state.data} />
                            </div> }

                  </div>
                  {/*<!-- Modal footer -->*/}
                  <div class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                    <button data-modal-hide="default-modal" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={this.handleModalClose} >Dismiss</button>
                    {/*<button data-modal-hide="default-modal" type="button" class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Decline</button>*/}
                  </div>
              </div>
          </div>
        </div>

      </>
    );
  }
}
