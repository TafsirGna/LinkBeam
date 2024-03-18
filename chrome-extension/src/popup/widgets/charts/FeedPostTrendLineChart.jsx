/*import './FeedPostTrendLineChart.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { 
	getChartColors,
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
			text: 'Visits Chart',
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

		// var titles = ["reactions", "comments", "reposts"];
		// var colors = getChartColors(titles.length);

		// var datasets = titles.map((title, index) => 
		// 		{
		// 	    label: `# of ${title}`,
		// 	    fill: true,
		// 	    data: [],
		// 	    borderColor: [colors.borders[index]],
		// 	    backgroundColor: [colors.borders[index]],
		// 	  },
		// 	);

		// for (var postView of this. props.objects){
		// 	if (postView.reactions){

		// 	}
		// }

		// this.setState({
		// 	lineData: {
		// 		labels: results.titles,
		// 		datasets: datasets,
		// 	}
		// });
	}

	render(){
		return (
			<>
				{/*<div class="text-center">
				
									{ !this.state.lineData && <div class="spinner-border spinner-border-sm" role="status">
					                                          <span class="visually-hidden">Loading...</span>
					                                        </div> }
				
									{ this.state.lineData && <div>
																						<Line id={"chartTag_"+this.state.uuid} options={lineOptions} data={this.state.lineData} />
																						{ this.props.displayLegend && this.props.displayLegend == true && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">Chart of visits over a period of time</p> }
																					</div>}
				
								</div>*/}
			</>
		);
	}
}
