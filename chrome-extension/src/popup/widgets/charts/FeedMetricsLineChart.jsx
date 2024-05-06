/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

/*import './FeedMetricsLineChart.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import { DateTime as LuxonDateTime } from "luxon";
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

		var data = await getFeedLineChartsData(this.props.objects, this.props.rangeDates, this.props.metricValueFunction, [this.props.metric], LuxonDateTime);

		const colors = getChartColors(1);
		this.setState({
			lineData: {
				labels: data.labels,
				datasets: [
				  {
				    label: this.props.metric,
				    // fill: true,
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
