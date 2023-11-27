/*import './About.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { sendDatabaseActionMessage, getChartColors, startMessageListener, ack ,messageParams } from "../../Local_library";
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

  	this.listenToMessages = this.listenToMessages.bind(this);
  	this.onProcessedDataReceived = this.onProcessedDataReceived.bind(this);

	}

	componentDidMount() {

		this.listenToMessages();

		this.setChartLabels();

	}

	componentDidUpdate(prevProps, prevState){

		// everytime the view choice is changed, the chart is reset
		if (prevProps.viewChoice != this.props.viewChoice){
			this.setChartLabels();
		}

	}

	onProcessedDataReceived(message, sendResponse){

		// acknowledge receipt
		ack(sendResponse);

		let labels = this.state.lineLabels.titles;
		var colors = getChartColors(labels.length);

		this.setState({lineData: {
			labels,
			datasets: [
			  {
			    label: 'Dataset',
			    data: message.data.objectData,
			    borderColor: colors.borders,
			    backgroundColor: colors.backgrounds,
			  },
			],
		}});

	}

	listenToMessages(){

		startMessageListener([
      {
        param: [messageParams.responseHeaders.PROCESSED_DATA, "views-timeline-chart"].join(messageParams.separator), 
        callback: this.onProcessedDataReceived
      },
    ]);
    
	}

	getLastDaysViewChartLabels(){

		var labels = {titles: [], values: []};

		for (var i=0; i < 7; i++){
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

		for (var i=0; i < 31; i++){
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

		for (var i=1; i <= 12; i++){
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
		sendDatabaseActionMessage(messageParams.requestHeaders.GET_PROCESSED_DATA, "views-timeline-chart", {labelValues: this.state.lineLabels.values, specificUrl: (this.props.specificProfile ? this.props.specificProfile.url : null)});

	}

	render(){
		return (
			<>
				{ this.state.lineData && <Line options={lineOptions} data={this.state.lineData} /> }
			</>
		);
	}
}
