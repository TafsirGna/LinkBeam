/*import './About.css'*/
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { sendDatabaseActionMessage } from "../Local_library";
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

const barOptions = {
  responsive: true,
  /*layout: {
    padding: {
      left: 30,
      right: 30
    }
  }*/
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

export default class ViewsKeywordsBarChart extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			barLabels: null,
			barData: null,
		};

  	this.setChartLabels = this.setChartLabels.bind(this);

  	this.startMessageListener = this.startMessageListener.bind(this);

	}

	componentDidMount() {

		this.setChartLabels();

		this.startMessageListener();

	}

	startMessageListener(){

		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch(message.header){
        case "object-list":{
          
          switch(message.data.objectStoreName){
            case "keywords":{
              
              // sending a response
              sendResponse({
                  status: "ACK"
              });

              let labels = [];
              var results = message.data.objectData;
              results.forEach((keyword) => {
                labels.push(keyword.name);
              });
              
              // setting the new value
              this.setState({barLabels: labels}, () => {this.setChartData()});
              break;
            }
          }

          break;
        }
      }
    });
	}

	setChartLabels(){

  	sendDatabaseActionMessage("get-list", "keywords", null);

	}

	setChartData(){

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

	render(){
		return (
			<>
				{ this.state.barData && <Bar options={barOptions} data={this.state.barData} /> }
			</>
		);
	}
}
