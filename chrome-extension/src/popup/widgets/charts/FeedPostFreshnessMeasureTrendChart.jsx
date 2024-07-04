/*import './FeedPostFreshnessMeasureTrendChart.css'*/
import React from 'react';
import { Line } from 'react-chartjs-2';
import { DateTime as LuxonDateTime } from "luxon";
import { 
	getChartColors,
	getFeedLineChartsData,
	getFeedDashMetricValue,
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
		};

  	this.setChartData = this.setChartData.bind(this);

	}

	componentDidMount() {

		this.setChartData();

	}

	componentDidUpdate(prevProps, prevState){

    if (prevProps.rangeDates != this.props.rangeDates
    			|| prevProps.category != this.props.category
    			|| prevProps.objects != this.props.objects){      
    	this.setChartData();
    }

  }

	componentWillUnmount(){

  }

	async setChartData(){

		if (!this.props.category){
			this.setState({lineData: null});
			return;
		}

		const titles = [this.props.category, "Post Count"];
		const colors = (!this.props.colors) ? getChartColors(titles.length) : {borders: [...this.props.colors, ...getChartColors(1).borders]};

		const data = await getFeedLineChartsData(this.props.objects, this.props.rangeDates, this.getMetricValue, titles, LuxonDateTime);

		const datasets = titles.map((title, index) => 
			({
		    label: `# of ${title == "Post Count" ? "posts" : title}`,
		    fill: title == this.props.category,
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

		if (metric == "Post Count"){
			// Unique visits ids
			return getFeedDashMetricValue(objects, metric);
		}

		var value = 0;

		// objects.sort((a, b) => {
		// 	if (new Date(a.date) > new Date(b.date)){
    //     return 1;
    //   }
    //   else if (new Date(a.date) < new Date(b.date)){
    //     return -1;
    //   }
    //   else{
    //     return 0;
    //   }
    // });

    objects = objects.filter((value, index, self) => self.findIndex(view => view.uid == value.uid) === index);
			
		for (var object of objects){

			const postView = await db.feedPostViews
                                .where({feedPostId: object.feedPostId})
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

		}

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
