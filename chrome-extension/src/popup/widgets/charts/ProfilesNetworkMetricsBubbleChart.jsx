/*import './ProfilesNetworkMetricsBubbleChart.css'*/
import React from 'react';
import { Bubble } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { 
	getChartColors, 	
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
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';
import { db } from "../../../db";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const options = {
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'followers'
      }
    },
    x: {
    	title: {
        display: true,
        text: 'connections'
      }
    }
  },
  plugins: {
  	tooltip: {
  		callbacks: {
  			label: ((tooltipItem, data) => {
  				// console.log(tooltipItem);
  				var subjectLabel = dbDataSanitizer.preSanitize(tooltipItem.raw.fullName);
  				return `${tooltipItem.dataset.label} [${tooltipItem.raw.r.toFixed(2)}] | ${subjectLabel}`;
  			})
  		}
  	}
  }
};

export default class ProfilesNetworkMetricsBubbleChart extends React.Component{

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

	async setChartData(){

		if (!this.props.objects){
			this.setState({bubbleData: null});
			return;
		}

		var colors = getChartColors(2);
    var datasets = ["# of Visits", "Time spent (minutes)"].map((label, index) => (
    	{
	      label: label,
	      data: [],
	      borderColor: [colors.borders[index]],
		    backgroundColor: [colors.borders[index]],
	    }
    )); 

    for (let visit of this.props.objects){

    		var itemIndex = datasets[0].data.map(e => e.url).indexOf(visit.url);
    		if (itemIndex >= 0){
    			(datasets[0].data[itemIndex]).r += 1;
    			(datasets[1].data[itemIndex]).r += (visit.timeCount / 60);
    		}
    		else{

    			var profile = this.props.profiles[this.props.profiles.map(e => e.url).indexOf(visit.url)];

    			var followerCount = dbDataSanitizer.profileRelationMetrics(profile.nFollowers),
    					connectionCount = dbDataSanitizer.profileRelationMetrics(profile.nConnections);

    			datasets[0].data.push({
    				url: visit.url,
    				fullName: profile.fullName,
    				r: 1,
    				x: followerCount,
    				y: connectionCount,
    			});

    			datasets[1].data.push({
    				url: visit.url,
    				fullName: profile.fullName,
    				r: (visit.timeCount / 60),
    				x: followerCount,
    				y: connectionCount,
    			});
    		}

    }

    this.setState({bubbleData: {
			  datasets: datasets,
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
