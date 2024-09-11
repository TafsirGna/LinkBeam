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

/*import './VisitsTimelineChart.css'*/
import React from 'react';
import { Line, getElementAtEvent } from 'react-chartjs-2';
import { 
	getChartColors,
	groupObjectsByDate, 
	groupObjectsByMonth, 
	saveCanvas,
	getPeriodLabel,
	periodRange,
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
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';
import { DateTime as LuxonDateTime } from "luxon";

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

export default class VisitsTimelineChart extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			chartRef: React.createRef(),
			lineData: null,
			uuid: uuidv4(),
			givenDates: null,
		};

  	this.setChartLabels = this.setChartLabels.bind(this);
  	this.onChartClick = this.onChartClick.bind(this);

	}

	componentDidMount() {

		eventBus.on(eventBus.DOWNLOAD_CHART_IMAGE, (data) =>
      {
        if (data.carrouselItemIndex != this.props.carrouselIndex){
          return;
        }

        saveCanvas(this.state.uuid, "visits-timeline-chart.png", saveAs);
      }
    );

		this.setChartLabels();

	}

	componentDidUpdate(prevProps, prevState){

		// everytime the view choice is changed, the chart is reset
		if (prevProps.objects != this.props.objects){
			this.setChartLabels();
		}

	}


	getDaysVisitsChartLabels(view){

		var results = {titles: [], valuesDataset1: [], valuesDataset2: [], dates: []};
		var visits = groupObjectsByDate(this.props.objects);

		var startDate = null, endDate = null;
		if (view == 3){
			startDate = new Date(this.props.periodRangeLimits.start);
			endDate = new Date(this.props.periodRangeLimits.end);
		}
		else{
			startDate = LuxonDateTime.now().minus({days:(view == 0 ? 6 : 30)}).toJSDate();
			endDate = new Date();
		}

		for (var date of periodRange(startDate, endDate, 1, LuxonDateTime, "days")){
			results.titles.push((view == 0) ? date.toLocaleString({weekday: 'long'}) : date.toFormat("dd-MM"));
			results.dates.push(date);
			results.valuesDataset1.push((date.toISO().split("T")[0] in visits) ? visits[date.toISO().split("T")[0]].length : 0);

			var valueDataset2 = 0;
			if (date.toISO().split("T")[0] in visits){
				for (var visit of visits[date.toISO().split("T")[0]]){
					valueDataset2 += (visit.timeCount / 60);
				}
				
			}
			results.valuesDataset2.push(valueDataset2);
		}

		return results;

	}

	getYearVisitsChartLabels(){

		var results = {titles: [], valuesDataset1: [], valuesDataset2: [], dates: []};
		var visits = groupObjectsByMonth(this.props.objects);
		const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

		for (var i=0; i < 12; i++){
			const date = LuxonDateTime.now().minus({months: i});
			const month = date.toLocaleString({month: 'numeric'}) - 1;
			results.titles.push(months[month]);
			results.dates.push(date);
			results.valuesDataset1.push((month in visits) ? visits[month].length : 0);

			var valueDataset2 = 0;
			if (month in visits){
				for (var visit of visits[month]){
					valueDataset2 += (visit.timeCount / 60);
				}
			}
			results.valuesDataset2.push(valueDataset2);
		}

		results.titles.reverse();
		results.dates.reverse();
		results.valuesDataset1.reverse();
		results.valuesDataset2.reverse();

		return results;

	}

	componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

	setChartLabels(){

		if (!this.props.objects){
			this.setState({lineData: null});
			return;
		}
		
		var results = null;
		switch(this.props.view){
			case 0: {
				results = this.getDaysVisitsChartLabels(this.props.view);
				break;
			}
			case 1: {
				results = this.getDaysVisitsChartLabels(this.props.view);
				break;
			}
			case 2: {
				results = this.getYearVisitsChartLabels();
				break;
			}
			case 3: {
				results = this.getDaysVisitsChartLabels(this.props.view);
				break;
			}
		}

		const titles = results.titles,
				  colors = getChartColors(2);
		const colorDataset1 = {borders: [colors.borders[0]], backgrounds: [colors.backgrounds[0]]},
					colorDataset2 = {borders: [colors.borders[1]], backgrounds: [colors.backgrounds[1]]};

		this.setState({
			givenDates: results.dates,
			lineData: {
				labels: results.titles,
				datasets: [
				  {
				    label: '# of Visits',
				    // fill: true,
				    data: results.valuesDataset1,
				    borderColor: colorDataset1.borders,
				    backgroundColor: colorDataset1.borders,
				  },
				  {
				    label: 'Time spent (minutes)',
				    // fill: true,
				    data: results.valuesDataset2,
				    borderColor: colorDataset2.borders,
				    backgroundColor: colorDataset2.borders,
				  },
				],
			}
		});
	}

	onChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);

    if (elements.length){
    	console.log(elements, (elements[0]).index);
      window.open(`/index.html?view=Calendar&dataType=ProfileVisits&currentDate=${this.state.givenDates[elements[0].index].toJSDate().toISOString()}`, '_blank');
    }

  }

	render(){
		return (
			<>
				<div class="text-center">

					{ !this.state.lineData && <div class="spinner-border spinner-border-sm" role="status">
	                                          <span class="visually-hidden">Loading...</span>
	                                        </div> }

					{ this.state.lineData && <div>
																		<Line 
																			id={`chartTag_${this.state.uuid}`} 
																			ref={this.state.chartRef}
																			options={lineOptions} 
																			data={this.state.lineData} 
																			onClick={this.onChartClick}/>
																		{ this.props.displayLegend 
																				&& this.props.displayLegend == true 
																				&& <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">
																						Chart of visits over a period of time ({getPeriodLabel(this.props.view, this.props.periodRangeLimits, LuxonDateTime)})
																					</p> }
																	</div>}

				</div>
			</>
		);
	}
}
