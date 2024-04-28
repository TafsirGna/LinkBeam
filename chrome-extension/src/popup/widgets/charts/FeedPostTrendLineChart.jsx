/*import './FeedPostTrendLineChart.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { 
	getChartColors,
	getFeedLineChartsData,
	getPostMetricValue,
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

  	this.setChartData = this.setChartData.bind(this);

	}

	componentDidMount() {

		this.setChartData();

	}

	componentDidUpdate(prevProps, prevState){

		// everytime the view choice is changed, the chart is reset
		if (prevProps.objects != this.props.objects){
			this.setChartData();
		}

	}

	componentWillUnmount(){

  }

	async setChartData(){

		if (!this.props.objects){
			this.setState({lineData: null});
			return;
		}

		const titles = ["reactions", "comments", "reposts"];
		const colors = getChartColors(titles.length);

		const rangeDates = {
			start: this.props.globalData.settings.lastDataResetDate.split("T")[0],
			end: new Date().toISOString().split("T")[0],
		}

		const data = await getFeedLineChartsData(this.props.objects, rangeDates, getPostMetricValue, titles, {moment: moment});

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
