/*import './BubbleProfileRelationMetricsChart.css'*/
import React from 'react';
import { Bubble } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { 
	getChartColors, 
	messageParams, 
	dbData,
	appParams, 
	dbDataSanitizer,
} from "../../Local_library";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import moment from 'moment';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export default class BubbleProfileRelationMetricsChart extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			bubbleData: null,

		};

	}

	componentDidMount() {

		// this.getChartData();

	}

	componentDidUpdate(prevProps, prevState){

		// everytime the view choice is changed, the chart is reset
		if (prevProps.objects != this.props.objects){

			this.getChartData();

		}

	}

	getChartData(){

    var results = [];

    for (let search of this.props.objects){

    		var itemIndex = results.map(e => e.url).indexOf(search.url);
    		if (itemIndex >= 0){
    			(results[itemIndex]).r += 1;
    		}
    		else{
    			var followerCount = search.profile.nFollowers ? dbDataSanitizer.profileFollowers(search.profile.nFollowers) : 0,
    					connectionCount = search.profile.nConnections ? dbDataSanitizer.profileConnections(search.profile.nConnections) : 0;

    			results.push({
    				url: search.url,
    				fullName: search.profile.fullName,
    				r: 1,
    				x: followerCount,
    				y: connectionCount,
    			})
    		}

    }

    this.setState({bubbleData: {
			  datasets: [
			    {
			      label: 'Dataset',
			      data: results,
			      backgroundColor: getChartColors(1).borders,
			    },
			  ],
			}
		});

	}

	render(){
		return (
			<>
				{ this.state.bubbleData && <Bubble options={options} data={this.state.bubbleData} /> }
			</>
		);
	}
}
