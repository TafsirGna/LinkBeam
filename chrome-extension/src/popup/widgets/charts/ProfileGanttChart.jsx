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

/*import './ProfileGanttChart.css'*/
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Colors,
} from 'chart.js';
// import { faker } from '@faker-js/faker';
import 'chartjs-adapter-date-fns';
import { Line, Bar, getElementAtEvent } from 'react-chartjs-2';
import {  
  getChartColors,
  dbDataSanitizer,
} from "../../Local_library";
import { DateTime as LuxonDateTime } from "luxon";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, 
  Colors,
);

// Today line plugin block 
const todayLinePlugin = {
  id: "todayLine",
  afterDatasetsDraw(chart, args, pluginOptions){
    const { ctx, data, chartArea: { top, bottom, left, right }, scales: { x, y } } = chart;

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255, 99, 132, 1)";
    ctx.setLineDash([6, 6]);
    ctx.moveTo(x.getPixelForValue(new Date()), top);
    ctx.lineTo(x.getPixelForValue(new Date()), bottom);
    ctx.stroke();

    ctx.setLineDash([]);
  },
};

// const labels = ["a", "b", "c", "d"];

export default class ProfileGanttChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      barOptions: null,
      barData: null,
      chartData: null,
      chartRef: React.createRef(),
    };

    this.onChartClick = this.onChartClick.bind(this);

  }

  componentDidMount() {

    // Setting the data for the chart
    this.setBarData();

  }

  setBarData(){

    var data = [], 
        minDate = LuxonDateTime.now(),
        objects = null,
        missingDataObjects = [];

    if (this.props.periodLabel == "experience"){
      objects = this.props.profile.experience;
    }
    else{
      if (this.props.periodLabel == "education"){
        objects = this.props.profile.education;
      }
      else if (this.props.periodLabel == "all"){
        objects = this.props.profile.experience;
        objects = objects.concat(this.props.profile.education);
      }
    }

    for (var object of objects){

      if (object == "incomplete"){
        continue;
      }

      var label = dbDataSanitizer.preSanitize(object.entity.name);

      if (!object.period){
        missingDataObjects.push(object);
        continue;
      }
      
      // Setting the minDate object
      if (object.period.startDateRange < minDate){ minDate = object.period.startDateRange; }
      
      data.push({x: [object.period.startDateRange.toFormat("yyyy-MM-dd"), object.period.endDateRange.toFormat("yyyy-MM-dd")], y: label});

    }

    this.setState({
      chartData: data,
      barOptions: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: {
            position: "top",
            type: "time",
            time:{
                unit: 'month'
            },
            min: minDate.toFormat("yyyy-MM-dd"),
            max: LuxonDateTime.now().toFormat('yyyy-MM-dd'),
          },
        },
        plugins: {
          legend: {
            display: false,
            labels: {
                // This more specific font property overrides the global property
                font: {
                    weight: "bolder"
                }
            }
          },
          tooltip: {
            callbacks: {
              label: ((tooltipItem, data) => {
                // console.log(tooltipItem);
                return `[${LuxonDateTime.fromFormat(tooltipItem.raw.x[0], 'yyyy-MM-dd').toFormat("MMM yyyy")} - ${LuxonDateTime.fromFormat(tooltipItem.raw.x[1], 'yyyy-MM-dd').toFormat("MMM yyyy")}]`;
              })
            }
          }
        }
      }
    }, () => {

      var chartColors = getChartColors(data.length);

      this.setState({
        barData: {
          // labels,
          datasets: [
            {
              label: 'Dataset',
              data: data,
              backgroundColor: chartColors.borders/*chartColors.backgrounds*/,
              borderColor: chartColors.borders,
              borderWidth: 1,
              borderSkipped: false,
              borderRadius: 10,
              barPercentage: .85,
            },
          ],
        },
      });

      this.props.setMissingDataObjects(missingDataObjects);

    });

  }

  onChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);
    console.log(elements, (elements[0]).index);

    if (elements.length != 0){
      if (this.props.onClick){
        this.props.onClick(this.state.chartData[(elements[0]).index].y);
      }
    }

  }

  render(){
    return (
      <>
        { this.state.barData && <div> 
                                  <Bar 
                                      ref={this.state.chartRef}
                                      options={this.state.barOptions} 
                                      data={this.state.barData} 
                                      plugins={[todayLinePlugin]}
                                      onClick={this.onChartClick}
                                      />
                                </div>}
      </>
    );
  }
}
