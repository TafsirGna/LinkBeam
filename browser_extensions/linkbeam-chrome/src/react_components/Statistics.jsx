import React from 'react'
import moment from 'moment';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import BackToPrev from "./widgets/BackToPrev"
import { faker } from '@faker-js/faker';
/*import './Settings.css'*/


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const lineOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Searches Line Chart',
    },
  },
};

export const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Keywords Bar Chart',
    },
  },
};


export default class Settings extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      lineLabels: null,
      barLabels: null,
      barData: null,
      lineData: null,
      lastDataResetDate: null,
    };

    this.setKeywordChartData = this.setKeywordChartData.bind(this);
    this.setKeywordChartLabels = this.setKeywordChartLabels.bind(this);

    this.setSearchChartData = this.setSearchChartData.bind(this);
    this.setSearchChartLabels = this.setSearchChartLabels.bind(this);
  }

  componentDidMount() {

    // Setting the local data
    this.setState({lastDataResetDate: this.props.globalData.lastDataResetDate});

    // Starting the listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch(message.header){
        case "keyword-list":{
          console.log("Statistics Message received keyword-list: ", message);
          // sending a response
          sendResponse({
              status: "ACK"
          });

          let labels = [];
          message.data.forEach((keyword) => {
            labels.push(keyword.name);
          });
          
          // setting the new value
          this.setState({barLabels: labels}, () => {this.setKeywordChartData()});
          break;
        }
        case "search-chart-data":{
          console.log("Statistics Message received search-chart-data: ", message);
          // sending a response
          sendResponse({
              status: "ACK"
          });

          let labels = this.state.lineLabels;

          this.setState({lineData: {
            labels,
            datasets: [
              {
                label: 'Dataset',
                data: message.data,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
              },
            ],
          }});

          break;
        }
        case "settings-data":{
          if (message.data.property == "lastDataResetDate"){
            console.log("Statistics Message received last reset date: ", message);
            // sending a response
            sendResponse({
                status: "ACK"
            });

            this.setState({lastDataResetDate: message.data.value});
          }
          break;
        }
      }

    });

    this.setKeywordChartLabels();

    this.setSearchChartLabels();
    
    // Requesting the last reset date
    chrome.runtime.sendMessage({header: 'get-last-reset-date', data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Last reset date request sent', response);
    });
  }

  setKeywordChartLabels(){

    chrome.runtime.sendMessage({header: 'get-keyword-list', data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Keyword list request sent', response);
    });

  }

  setKeywordChartData(){

    let labels = this.state.barLabels;

    this.setState({barData: {
      labels,
      datasets: [
        {
          label: 'Dataset',
          data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    }});
  }

  setSearchChartLabels(){
    let labels = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const d = new Date();
    let day = labels[d.getDay()];

    while(labels[labels.length - 1] != day){
      let firstItem = labels.shift();
      labels.push(firstItem);
    }

    this.setState({lineLabels: labels}, () => {this.setSearchChartData()})
  }

  setSearchChartData(){

    let dateDataList = [];
    for (let i = 0; i < 7; i++){
      dateDataList.push(moment().subtract(i, 'days').format().split("T")[0]);
    }

    // Requesting search chart data
    chrome.runtime.sendMessage({header: 'get-search-chart-data', data: dateDataList}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Search chart data request sent', response);
    });

  }

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev onClick={() => this.props.switchOnDisplay("Activity")}/>

          <div id="carouselExample" class="carousel slide carousel-dark shadow rounded p-2 border mt-3">
            <div class="carousel-inner">
              <div class="carousel-item active">
                {this.state.lineData && <Line options={lineOptions} data={this.state.lineData} />}
              </div>
              <div class="carousel-item">
                {this.state.barData && <Bar options={barOptions} data={this.state.barData} />}
              </div>
              <div class="carousel-item">
                <img src="..." class="d-block w-100" alt="..."/>
              </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </button>
          </div>

          <div class="clearfix">
            <span class="text-muted small float-end fst-italic mt-2 badge">Data recorded since {moment(this.state.lastDataResetDate, moment.ISO_8601).format('MMMM Do YYYY, h:mm:ss a')}</span>
          </div>
        </div>
      </>
    );
  }

}
