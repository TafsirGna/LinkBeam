/*import './About.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { 
	getChartColors,
	getFeedLineChartsData,
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
			text: "Feed visits' metrics",
		},
	},
};

export default class FeedMetricsLineChart extends React.Component{

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

		if (prevProps.metric != this.props.metric){
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

		var data = await getFeedLineChartsData(this.props.objects, this.props.rangeDates, this.props.metricValueFunction, [this.props.metric], {moment: moment})

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
