/*import './FeedPostDataModal.css'*/
import React from 'react';
import { 
  appParams, 
  getChartColors,
  messageMeta,
  getFeedLineChartsData,
} from "../../popup/Local_library";
import { BarChartIcon } from "../../popup/widgets/SVGs";
import eventBus from "../../popup/EventBus";
import { Spinner } from "flowbite-react";
// import { Button, Modal } from "flowbite-react";
import { DateTime as LuxonDateTime } from "luxon";

import { faker } from '@faker-js/faker';
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

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export default class FeedPostDataModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      show: false,
      post: null,
      data: null,
    };

    this.startListening = this.startListening.bind(this);
    this.setChartData = this.setChartData.bind(this);

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

  componentWillUnmount(){

    eventBus.remove(eventBus.SHOW_FEED_POST_DATA_MODAL);

  }

  setChartData(lastDataResetDate, objects){

    const titles = ["reactions", "comments", "reposts"];
    const colors = getChartColors(titles.length);

    const rangeDates = {
      start: lastDataResetDate,
      end: new Date().toISOString(),
    }

    const data = getFeedLineChartsData(objects, rangeDates, this.getMetricValue, titles, {luxon: LuxonDateTime});

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

  getMetricValue(postViews, metric){

    var value = 0;
    
    switch (metric){
      case "reactions": {
        for (var postView of postViews){
          value += postView.reactions ? postView.reactions : 0;
        }
        break;
      }

      case "comments": {
        for (var postView of postViews){
          value += postView.commentsCount ? postView.commentsCount : 0;
        }
        break;
      }

      case "reposts": {
        for (var postView of postViews){
          value += postView.repostsCount ? postView.repostsCount : 0;
        }
        break;
      }
    }

    return value;

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
                    && <Line options={options} data={this.state.data} /> }

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
