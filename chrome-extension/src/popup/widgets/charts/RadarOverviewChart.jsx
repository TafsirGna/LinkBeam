/*import './RadarOverviewChart.css'*/
import React from 'react';
import { Radar } from 'react-chartjs-2';
// import { 
// 	saveCanvas,
// } from "../../Local_library";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { v4 as uuidv4 } from 'uuid';
// import eventBus from "../../EventBus";
// import { saveAs } from 'file-saver';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default class RadarOverviewChart extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			radarData: null,
			uuid: uuidv4(),
		};

  	this.setChartLabels = this.setChartLabels.bind(this);
  	this.getExperienceTime = this.getExperienceTime.bind(this);
  	this.getEducationTime = this.getEducationTime.bind(this);

	}

	componentDidMount() {

		// eventBus.on(eventBus.DOWNLOAD_CHART_IMAGE, (data) =>
    //   {
    //     if (data.carrouselItemIndex != this.props.carrouselIndex){
    //       return;
    //     }

    //     saveCanvas(this.state.uuid, "Searches-timeline-chart.png", saveAs);
    //   }
    // );

    // if (this.props.computedData.experienceTime){
    //   this.setExperienceTime();
    // }

		this.setChartLabels();

	}

	componentDidUpdate(prevProps, prevState){

	}

	componentWillUnmount(){

    // eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

  getExperienceTime(){

    var experienceTime = Math.ceil(this.props.computedData.experienceTime / (1000 * 60 * 60 * 24)) // diff days
    var y = Math.floor(experienceTime / 365);

    return y.toFixed(2);

  }

  getEducationTime(){

    var educationTime = Math.ceil(this.props.computedData.educationTime / (1000 * 60 * 60 * 24)) // diff days
    var y = Math.floor(educationTime / 365);

    return y.toFixed(2);

  }

	setChartLabels(){

		if (!this.props.profile){
			return;
		}

		this.setState({
			radarData: {
			  labels: ['Education', 'Experience', 'Languages', 'Certifications', 'Projects'],
			  datasets: [
			    {
			      label: 'Count',
			      data: [
			      	this.getEducationTime(), 
			      	this.getExperienceTime(), 
			      	(this.props.profile.languages ? this.props.profile.languages.length : 0), 
			      	(this.props.profile.certifications ? this.props.profile.certifications.length : 0),
			      	(this.props.profile.projects ? this.props.profile.projects.length : 0)],
			      backgroundColor: 'rgba(255, 99, 132, 0.2)',
			      borderColor: 'rgba(255, 99, 132, 1)',
			      borderWidth: 1,
			    },
			  ],
			}
		});
	}

	render(){
		return (
			<>
				<div class="text-center">

					{ !this.state.radarData && <div class="spinner-border spinner-border-sm" role="status">
	                                          <span class="visually-hidden">Loading...</span>
	                                        </div> }

					{ this.state.radarData && <Radar id={"chartTag_"+this.state.uuid} data={this.state.radarData} /> }

				</div>
			</>
		);
	}
}
