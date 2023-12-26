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
	saveCanvas,
} from "../../Local_library";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';

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
			uuid: uuidv4(),
		};

	}

	componentDidMount() {

		eventBus.on(eventBus.DOWNLOAD_CHART_IMAGE, (data) =>
      {
        if (data.carrouselItemIndex != this.props.carrouselIndex){
          return;
        }

        saveCanvas(this.state.uuid, "Searches-bubble-chart.png", saveAs);
      }
    );

    this.setChartData();

	}

	componentDidUpdate(prevProps, prevState){

		// everytime the view choice is changed, the chart is reset
		if (prevProps.objects != this.props.objects){

			this.setChartData();

		}

	}

	componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

	setChartData(){

		if (!this.props.objects){
			return;
		}

    var resultsDataset1 = [], 
    		resultsDataset2 = [];

    for (let search of this.props.objects){

    		var itemIndex = resultsDataset1.map(e => e.url).indexOf(search.url);
    		if (itemIndex >= 0){
    			(resultsDataset1[itemIndex]).r += 1;
    			(resultsDataset2[itemIndex]).r += search.timeCount.value;
    		}
    		else{
    			var followerCount = search.profile.nFollowers ? dbDataSanitizer.profileFollowers(search.profile.nFollowers) : 0,
    					connectionCount = search.profile.nConnections ? dbDataSanitizer.profileConnections(search.profile.nConnections) : 0;

    			resultsDataset1.push({
    				url: search.url,
    				fullName: search.profile.fullName,
    				r: 1,
    				x: followerCount,
    				y: connectionCount,
    			});

    			resultsDataset2.push({
    				url: search.url,
    				fullName: search.profile.fullName,
    				r: search.timeCount.value,
    				x: followerCount,
    				y: connectionCount,
    			});
    		}

    }

    var colors = getChartColors(2);
    var colorDataset1 = {borders: [colors.borders[0]], backgrounds: [colors.backgrounds[0]]};
		var colorDataset2 = {borders: [colors.borders[1]], backgrounds: [colors.backgrounds[1]]};

    this.setState({bubbleData: {
			  datasets: [
			    {
			      label: 'Dataset 1',
			      data: resultsDataset1,
			      borderColor: colorDataset1.borders,
				    backgroundColor: colorDataset1.borders,
			    },
			    {
			      label: 'Dataset 2',
			      data: resultsDataset2,
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

					{ !this.state.bubbleData && <div class="spinner-border spinner-border-sm" role="status">
	                                          <span class="visually-hidden">Loading...</span>
	                                        </div> }

					{ this.state.bubbleData && <Bubble id={"chartTag_"+this.state.uuid} options={options} data={this.state.bubbleData} /> }

				</div>
			</>
		);
	}
}
