/*import './About.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { sendDatabaseActionMessage, getChartColors } from "../Local_library";
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

							let labels = this.state.lineLabels.titles;


							var colors = getChartColors(labels.length);

							this.setState({lineData: {
								labels,
								datasets: [
								  {
								    label: 'Dataset',
								    data: message.data,
								    borderColor: colors.borders,
								    backgroundColor: colors.backgrounds,
								  },
								],
							}});

							break;
						}

	      	}
      	});

	}

	getLastDaysViewChartLabels(){

		var labels = {titles: [], values: []};

		/*var labels = {titles: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], values: []};

		const d = new Date();
		let day = labels.titles[d.getDay()];

		while(labels.titles[labels.titles.length - 1] != day){
			let firstItem = labels.titles.shift();
			labels.titles.push(firstItem);
		}*/

		for (var i=0; i < 6; i++){
			var date = moment().subtract(i, 'days');
			labels.titles.push(date.format('dddd'));
			labels.values.push(date.toISOString().split("T")[0]);
		}

		labels.titles.reverse();
		labels.values.reverse();

		return labels;

	}

	getLastMonthViewChartLabels(){

		var labels = {titles: [], values: []};

		for (var i=0; i < 30; i++){
			var date = moment().subtract(i, 'days');
			labels.titles.push(date.format("DD-MM"));
			labels.values.push(date.toISOString().split("T")[0]);
		}

		labels.titles.reverse();
		labels.values.reverse();

		return labels;

	}

	getLastYearViewChartLabels(){

		var labels = {titles: [], values: []};

		for (var i=1; i < 12; i++){
			labels.titles.push(moment().subtract(i - 1, 'months').format("MM-YYYY"));
			labels.values.push({beg: moment().subtract(i, 'months').toISOString().split("T")[0], end: moment().subtract(i - 1, 'months').toISOString().split("T")[0]});
		}

		labels.titles.reverse();
		labels.values.reverse();

		return labels;

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

		// Requesting search chart data
		chrome.runtime.sendMessage({header: 'get-search-chart-data', data: this.state.lineLabels.values}, (response) => {
			// Got an asynchronous response with the data from the service worker
			console.log('Search chart data request sent', response, this.state.lineLabels.values);
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
