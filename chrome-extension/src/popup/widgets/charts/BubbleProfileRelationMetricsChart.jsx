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

        saveCanvas(this.state.uuid, "Visits-bubble-chart.png", saveAs);
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

    for (let visit of this.props.objects){

    		var itemIndex = resultsDataset1.map(e => e.url).indexOf(visit.url);
    		if (itemIndex >= 0){
    			(resultsDataset1[itemIndex]).r += 1;
    			(resultsDataset2[itemIndex]).r += (visit.timeCount / 60);
    		}
    		else{
    			var followerCount = dbDataSanitizer.profileRelationMetrics(visit.profile.nFollowers),
    					connectionCount = dbDataSanitizer.profileRelationMetrics(visit.profile.nConnections);

    			resultsDataset1.push({
    				url: visit.url,
    				fullName: visit.profile.fullName,
    				r: 1,
    				x: followerCount,
    				y: connectionCount,
    			});

    			resultsDataset2.push({
    				url: visit.url,
    				fullName: visit.profile.fullName,
    				r: (visit.timeCount / 60),
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
			      label: '# of Visits',
			      data: resultsDataset1,
			      borderColor: colorDataset1.borders,
				    backgroundColor: colorDataset1.borders,
			    },
			    {
			      label: 'Time spent (minutes)',
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

					{ this.state.bubbleData && 
												<div>
													<Bubble id={"chartTag_"+this.state.uuid} options={options} data={this.state.bubbleData} /> 
													{ this.props.displayLegend && this.props.displayLegend == true && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small">Chart of profiles by number of visits and time</p> }
												</div>}

				</div>
			</>
		);
	}
}
