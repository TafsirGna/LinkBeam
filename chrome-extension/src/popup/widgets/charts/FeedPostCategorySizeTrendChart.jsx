/*import './FeedPostCategorySizeTrendChart.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import { 
	getChartColors,
	getFeedLineChartsData,
	getFeedDashMetricValue,
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
import { DateTime as LuxonDateTime } from "luxon";

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

export default class FeedPostCategorySizeTrendChart extends React.Component{

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

		const titles = [this.props.category, "Post Count"];
		const colors = (!this.props.colors) ? getChartColors(titles.length) : {borders: [...this.props.colors, ...getChartColors(1).borders]};

		const data = await getFeedLineChartsData(this.props.objects, this.props.rangeDates, this.getMetricValue, titles, LuxonDateTime);

		const datasets = titles.map((title, index) => 
			({
		    label: `# of ${title == "Post Count" ? "posts" : title}`,
		    fill: title == this.props.category,
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

	async getMetricValue(objects, metric){

		if (metric == "Post Count") {
     	return getFeedDashMetricValue(objects, metric); 
    }

		var value = 0,
				uids = [];

		for (const feedPostView of objects){
			if (uids.indexOf(feedPostView.uid) != -1){
				continue;
			}

			if (feedPostView.category){
				if (feedPostView.category == metric){
					value++;
				}
			}
			else{
				if (feedPostView.category == "publications"){
					value++;
				}
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
