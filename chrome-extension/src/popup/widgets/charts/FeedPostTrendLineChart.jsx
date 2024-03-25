/*import './FeedPostTrendLineChart.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { 
	getChartColors,
	getFeedLineChartsData
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
			text: 'Post metrics',
		},
	},
};

export default class FeedPostTrendLineChart extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			lineData: null,
		};

  	this.setChartLabels = this.setChartLabels.bind(this);

	}

	componentDidMount() {

		this.setChartLabels();

	}

	componentDidUpdate(prevProps, prevState){

		// everytime the view choice is changed, the chart is reset
		if (prevProps.objects != this.props.objects){
			this.setChartLabels();
		}

	}

	componentWillUnmount(){

  }

	setChartLabels(){

		if (!this.props.objects){
			this.setState({lineData: null});
			return;
		}

		const titles = ["reactions", "comments", "reposts"];
		const colors = getChartColors(titles.length);

		const rangeDates = {
			start: this.props.globalData.settings.lastDataResetDate,
			end: new Date().toISOString(),
		}

		const data = getFeedLineChartsData(this.props.objects, rangeDates, this.getMetricValue, titles, {moment: moment});

		const datasets = titles.map((title, index) => 
			({
						    label: `# of ${title}`,
						    fill: true,
						    data: data.values[title],
						    borderColor: [colors.borders[index]],
						    backgroundColor: [colors.borders[index]],
						  })
		);

		this.setState({
			lineData: {
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

	render(){
		return (
			<>
				<div class="text-center">
				
									{ !this.state.lineData && <div class="spinner-border spinner-border-sm" role="status">
					                                          <span class="visually-hidden">Loading...</span>
					                                        </div> }
				
									{ this.state.lineData && <div>
																						<Line options={lineOptions} data={this.state.lineData} />
																						{/*<p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">Chart of visits over a period of time</p>*/}
																					</div>}
				
								</div>
			</>
		);
	}
}
