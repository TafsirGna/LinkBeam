/*import './About.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { sendDatabaseActionMessage, shuffle, stickColors } from "../Local_library";
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

const lineOptions = {
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

export default class ViewsTimelineChart extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			lineLabels: null,
			lineData: null,
		};

		this.getChartData = this.getChartData.bind(this);
    	this.setChartLabels = this.setChartLabels.bind(this);

    	this.startMessageListener = this.startMessageListener.bind(this);

	}

	componentDidMount() {

		this.startMessageListener();

		this.setChartLabels();

	}

	componentDidUpdate(prevProps, prevState){

		// everytime the view choice is changed, the chart is reset
		if (prevProps.viewChoice != this.props.viewChoice){
			this.setChartLabels();
		}

	}

	startMessageListener(){

		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	      	switch(message.header){

	      		case "search-chart-data":{
							console.log("Statistics Message received search-chart-data: ", message);
							// sending a response
							sendResponse({
								status: "ACK"
							});

							let labels = this.state.lineLabels;

							var colors = stickColors;
					  	shuffle(colors);
					  	colors = colors.splice(0, labels.length); 

							this.setState({lineData: {
								labels,
								datasets: [
								  {
								    label: 'Dataset',
								    data: message.data,
								    borderColor: 'rgb(255, 99, 132)',
								    backgroundColor: colors,
								  },
								],
							}});

							break;
						}

	      	}
      	});

	}

	getLastDaysViewChartLabels(){

		let labels = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

		const d = new Date();
		let day = labels[d.getDay()];

		while(labels[labels.length - 1] != day){
			let firstItem = labels.shift();
			labels.push(firstItem);
		}

		return labels;

	}

	getLastMonthViewChartLabels(){

	}

	getLastYearViewChartLabels(){

	}

	setChartLabels(){
		
		var labels = null;
		switch(this.props.viewChoice){
			case 0: {
				labels = this.getLastDaysViewChartLabels();
				break;
			}
			case 1: {
				labels = this.getLastMonthViewChartLabels();
				break;
			}
			case 2: {
				labels = this.getLastYearViewChartLabels();
				break;
			}
		}

		this.setState({lineLabels: labels}, () => {this.getChartData()})
	}

	getChartData(){

		let dateDataList = [];
		for (let i = 0; i < 7; i++){
			dateDataList.push(moment().subtract(i, 'days').format().split("T")[0]);
		}

		// Requesting search chart data
		chrome.runtime.sendMessage({header: 'get-search-chart-data', data: dateDataList}, (response) => {
			// Got an asynchronous response with the data from the service worker
			console.log('Search chart data request sent', response, dateDataList);
		});

	}

	render(){
		return (
			<>
				{ this.state.lineData && <Line options={lineOptions} data={this.state.lineData} /> }
			</>
		);
	}
}
