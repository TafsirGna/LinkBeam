/*import './FeedPostFreshnessMeasureTrendChart.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { 
	getChartColors,
	getFeedLineChartsData,
	dateBetweenRange,
} from "../../Local_library";
import { db } from "../../../db";
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
			text: 'Post metrics',
		},
	},
};

export default class FeedPostFreshnessMeasureTrendChart extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			lineData: null,
			feedPostViews: null,
		};

  	this.setChartData = this.setChartData.bind(this);
  	this.setFeedPostViews = this.setFeedPostViews.bind(this);

	}

	componentDidMount() {

		this.setFeedPostViews();

	}

	componentDidUpdate(prevProps, prevState){

    if (prevProps.rangeDates != this.props.rangeDates){      
    	this.setFeedPostViews();
    }

    if (prevProps.category != this.props.category){
    	this.setChartData();
    }

  }

	componentWillUnmount(){

  }

  async setFeedPostViews(){

  	if (!this.props.rangeDates){
  		return;
  	}

  	var feedPostViews = await db.feedPostViews
										            .filter(postView => dateBetweenRange(this.props.rangeDates.start, this.props.rangeDates.end, postView.date))
										            .toArray();

		this.setState({feedPostViews: feedPostViews}, () => {
			this.setChartData();
		});

  }

	async setChartData(){

		if (!this.props.category){
			this.setState({lineData: null});
			return;
		}

		const titles = [this.props.category];
		const colors = (!this.props.colors) ? getChartColors(titles.length) : {borders: this.props.colors};

		const data = await getFeedLineChartsData(this.state.feedPostViews, this.props.rangeDates, this.getMetricValue, titles, {moment: moment});

		const datasets = titles.map((title, index) => 
			({
						    label: `# of ${title}`,
						    fill: true,
						    data: data.values[title],
						    borderColor: [colors.borders[index]],
						    backgroundColor: [colors.borders[index]],
						  })
		);

		this.setState({
			lineData: {
				labels: data.labels,
				datasets: datasets,
			}
		});

	}

	async getMetricValue(objects, metric){

		var value = 0,
				uids = [];

		objects.sort((a, b) => {
			if (new Date(a.date) > new Date(b.date)){
        return 1;
      }
      else if (new Date(a.date) < new Date(b.date)){
        return -1;
      }
      else{
        return 0;
      }
     });

		// if (objects){
			
		for (var object of objects){

			if (uids.indexOf(object.uid) != -1){
				continue;
			}

			const postView = await db.feedPostViews
                                .where({uid: object.uid})
                                .filter(postView => new Date(postView.date) < new Date(objects[0].date))
                                .first();

      if (postView){
      	if (metric == "Old"){
        	value++;
      	}
      }
      else{
      	if (metric == "New"){
      		value++;
      	}
      }

			uids.push(object.uid);

		}

		// }

		return value;

	}

	render(){
		return (
			<>
				<div class="text-center">
				
									{ !this.state.lineData && <div class="spinner-border spinner-border-sm" role="status">
					                                          <span class="visually-hidden">Loading...</span>
					                                        </div> }
				
									{ this.state.lineData && <div>
																						<Line options={lineOptions} data={this.state.lineData} />
																						{/*<p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">Chart of visits over a period of time</p>*/}
																					</div>}
				
								</div>
			</>
		);
	}
}
