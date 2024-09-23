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

/*import './TensorBoardChart.css'*/
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
			text: "Acc/Loss metrics",
		},
	},
};

export default class TensorBoardChart extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			lineData: null,
		};

	}

	componentDidMount() {

		const colors = getChartColors(2);
		this.setState({
			lineData: {
				labels: this.props.data.labels,
				datasets: this.props.data.datasets.map((dataset, index) => ({
																			    ...dataset,
																			    borderColor: colors.borders[index],
																			    backgroundColor: colors.borders[index],
																		 	})),
			}
		});
	}

	componentDidUpdate(prevProps, prevState){
		// if ((prevProps.data.datasets[0].data !== this.props.data.datasets[0].data)
		// 		|| (prevProps.data.datasets[1].data !== this.props.data.datasets[1].data)){
		// 	console.log("RiRiRi ? : ", [...(this.props.data.datasets[0].data)]);
		// 	var lineData = [...this.state.lineData];
		// 	lineData.datasets = this.props.data.datasets.map((dataset, index) => ({ ...(lineData.datasets[index]), data: dataset.data }));
		// 	this.setState({lineData: lineData});
		// }
	}

	componentWillUnmount(){

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
							</div>}

				</div>
			</>
		);
	}
}
