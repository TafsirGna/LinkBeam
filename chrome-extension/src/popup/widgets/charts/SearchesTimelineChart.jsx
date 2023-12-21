/*import './About.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { sendDatabaseActionMessage, getChartColors, startMessageListener, ack ,messageParams, groupObjectsByDate } from "../../Local_library";
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

export default class SearchesTimelineChart extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			lineData: null,
		};

  	this.setChartLabels = this.setChartLabels.bind(this);

	}

	componentDidMount() {

		// this.setChartLabels();

	}

	componentDidUpdate(prevProps, prevState){

		// everytime the view choice is changed, the chart is reset
		if (prevProps.objects != this.props.objects){
			this.setChartLabels();
		}

	}

	getDaysSearchesChartLabels(view){

		var results = {titles: [], values: []};
		var searches = groupObjectsByDate(this.props.objects);

		var upperLimit = (view == 0 ? 7 : 31);
		for (var i=0; i < upperLimit; i++){
			var date = moment().subtract(i, 'days');
			results.titles.push(view == 0 ? date.format('dddd') : date.format("DD-MM"));
			results.values.push((date.toISOString().split("T")[0] in searches) ? searches[date.toISOString().split("T")[0]].length : 0);
		}

		results.titles.reverse();
		results.values.reverse();

		return results;

	}

	getYearSearchesChartLabels(){

	}

	setChartLabels(){

		if (this.props.objects == []){
			return;
		}
		
		var results = null;
		switch(this.props.view){
			case 0: {
				results = this.getDaysSearchesChartLabels(this.props.view);
				break;
			}
			case 1: {
				results = this.getDaysSearchesChartLabels(this.props.view);
				break;
			}
			case 2: {
				results = this.getYearSearchesChartLabels();
				break;
			}
		}

		var titles = results.titles;
		var colors = getChartColors(titles.length);

		this.setState({
			lineData: {
				labels: results.titles,
				datasets: [
				  {
				    label: 'Dataset',
				    data: results.values,
				    borderColor: colors.borders,
				    backgroundColor: colors.backgrounds,
				  },
				],
			}
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
