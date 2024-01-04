/*import './About.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { 
	sendDatabaseActionMessage, 
	getChartColors, 
	startMessageListener, 
	ack, 
	messageParams, 
	groupObjectsByDate, 
	groupObjectsByMonth, 
	saveCanvas,
} from "../../Local_library";
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
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';

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
			uuid: uuidv4(),
		};

  	this.setChartLabels = this.setChartLabels.bind(this);

	}

	componentDidMount() {

		eventBus.on(eventBus.DOWNLOAD_CHART_IMAGE, (data) =>
      {
        if (data.carrouselItemIndex != this.props.carrouselIndex){
          return;
        }

        saveCanvas(this.state.uuid, "Searches-timeline-chart.png", saveAs);
      }
    );

		this.setChartLabels();

	}

	componentDidUpdate(prevProps, prevState){

		// everytime the view choice is changed, the chart is reset
		if (prevProps.objects != this.props.objects){
			this.setChartLabels();
		}

	}

	getDaysSearchesChartLabels(view){

		var results = {titles: [], valuesDataset1: [], valuesDataset2: []};
		var searches = groupObjectsByDate(this.props.objects);

		var upperLimit = (view == 0 ? 7 : 31);
		for (var i=0; i < upperLimit; i++){
			var date = moment().subtract(i, 'days');
			results.titles.push(view == 0 ? date.format('dddd') : date.format("DD-MM"));
			results.valuesDataset1.push((date.toISOString().split("T")[0] in searches) ? searches[date.toISOString().split("T")[0]].length : 0);

			var valueDataset2 = 0;
			if (date.toISOString().split("T")[0] in searches){
				for (var search of searches[date.toISOString().split("T")[0]]){
					valueDataset2 += (search.timeCount.value / 60);
				}
				
			}
			results.valuesDataset2.push(valueDataset2);
		}

		results.titles.reverse();
		results.valuesDataset1.reverse();
		results.valuesDataset2.reverse();

		return results;

	}

	getYearSearchesChartLabels(){

		var results = {titles: [], valuesDataset1: [], valuesDataset2: []};
		var searches = groupObjectsByMonth(this.props.objects);
		const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

		for (var i=0; i < 12; i++){
			var month = moment().subtract(i, 'months').toDate().getMonth();
			results.titles.push(months[month]);
			results.valuesDataset1.push((month in searches) ? searches[month].length : 0);

			var valueDataset2 = 0;
			if (month in searches){
				for (var search of searches[month]){
					valueDataset2 += (search.timeCount.value / 60);
				}
			}
			results.valuesDataset2.push(valueDataset2);
		}

		results.titles.reverse();
		results.valuesDataset1.reverse();
		results.valuesDataset2.reverse();

		return results;

	}

	componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

	setChartLabels(){

		if (!this.props.objects){
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
		var colors = getChartColors(2);
		var colorDataset1 = {borders: [colors.borders[0]], backgrounds: [colors.backgrounds[0]]};
		var colorDataset2 = {borders: [colors.borders[1]], backgrounds: [colors.backgrounds[1]]};

		this.setState({
			lineData: {
				labels: results.titles,
				datasets: [
				  {
				    label: '# Searches',
				    fill: true,
				    data: results.valuesDataset1,
				    borderColor: colorDataset1.borders,
				    backgroundColor: colorDataset1.borders,
				  },
				  {
				    label: 'Time spent (seconds)',
				    fill: true,
				    data: results.valuesDataset2,
				    borderColor: colorDataset2.borders,
				    backgroundColor: colorDataset2.borders,
				  },
				],
			}
		});
	}

	render(){
		return (
			<>
				<div class="text-center">

					{ !this.state.lineData && <div class="spinner-border spinner-border-sm" role="status">
	                                          <span class="visually-hidden">Loading...</span>
	                                        </div> }

					{ this.state.lineData && <Line id={"chartTag_"+this.state.uuid} options={lineOptions} data={this.state.lineData} /> }

				</div>
			</>
		);
	}
}
