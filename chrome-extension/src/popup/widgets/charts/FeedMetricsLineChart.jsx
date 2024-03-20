/*import './About.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { 
	getChartColors,
	getVisitsTotalTime,
	getVisitsPostCount,
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
			display: false,
			text: 'Visits Chart',
		},
	},
};

export default class FeedMetricsLineChart extends React.Component{

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

		if (prevProps.metric != this.props.metric){
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

		var data = getFeedLineChartsData(this.props.objects, this.props.rangeDates, this.getMetricValue, [this.props.metric], moment)

		const colors = getChartColors(1);
		this.setState({
			lineData: {
				labels: data.labels,
				datasets: [
				  {
				    label: this.props.metric,
				    fill: true,
				    data: data.values[this.props.metric],
				    borderColor: colors.borders,
				    backgroundColor: colors.borders,
				  },
				],
			}
		});
	}

	getMetricValue(visits, metric){

		var value = null;
		switch(metric){
			case "Total time": {
				value = getVisitsTotalTime(visits); 
				break;
			}

			case "Post Count": {
				value = getVisitsPostCount(visits); 
				break;
			}

			case "Visit Count": {
				value = visits.length; 
				break;
			}

			case "Mean time": {
				value = (getVisitsTotalTime(visits) / visits.length).toFixed(2); 
				break;
			}
		}

		return value;
	}

	render(){
		return (
			<>
				<div class="text-center">

					{ !this.state.lineData 
						&& <div class="spinner-border spinner-border-sm" role="status">
                              <span class="visually-hidden">Loading...</span>
                            </div> }

					{ this.state.lineData 
						&& <div>
								<Line options={lineOptions} data={this.state.lineData} />
								{ this.props.displayLegend && this.props.displayLegend == true 
									&& <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">
											Chart of visits over a period of time
										</p> }
							</div>}

				</div>
			</>
		);
	}
}
