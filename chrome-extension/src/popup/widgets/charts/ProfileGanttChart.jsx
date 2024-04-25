/*import './ProfileGanttChart.css'*/
import React from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
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
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import { faker } from '@faker-js/faker';
import 'chartjs-adapter-date-fns';
import { Line, Bar, getElementAtEvent } from 'react-chartjs-2';
import { 
  appParams, 
  getChartColors ,
  dbDataSanitizer,
} from "../../Local_library";
import moment from 'moment';
import { AlertCircleIcon } from "../SVGs";

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
      missingDataObjects: null,
    };

    this.onChartClick = this.onChartClick.bind(this);

  }

  componentDidMount() {

    // Setting the data for the chart
    this.setBarData();

  }

  setBarData(){

    var data = [], 
        minDate = moment(),
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

      var label = dbDataSanitizer.preSanitize(object.entity.name);

      if (!object.period){
        missingDataObjects.push(object);
        continue;
      }
      
      // Setting the minDate object
      if (object.period.startDateRange < minDate){ minDate = object.period.startDateRange; }
      
      data.push({x: [object.period.startDateRange.format("YYYY-MM-DD"), object.period.endDateRange.format("YYYY-MM-DD")], y: label});

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
            min: minDate.format("YYYY-MM-DD"),
            max: moment().format("YYYY-MM-DD"),
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
                return `[${moment(tooltipItem.raw.x[0], 'YYYY-MM-DD').format("MMM YY")} - ${moment(tooltipItem.raw.x[1], 'YYYY-MM-DD').format("MMM YY")}]`;
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
        missingDataObjects: missingDataObjects,
      });

    });

  }

  onChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);
    console.log(elements, (elements[0]).index);

    if (elements.length != 0){
      this.props.onClick(this.state.chartData[(elements[0]).index].y);
    }

  }

  render(){
    return (
      <>
        { this.state.barData && <div> 
                                  <div class="shadow border rounded border-1 p-2">
                                    <Bar 
                                      ref={this.state.chartRef}
                                      options={this.state.barOptions} 
                                      data={this.state.barData} 
                                      plugins={[todayLinePlugin]}
                                      onClick={this.onChartClick}
                                      />
                                      { this.state.missingDataObjects && this.state.missingDataObjects.length != 0 && <div class="rounded border shadow mt-2 p-2">
                                                                              { this.state.missingDataObjects.map((object) => (<span class="mx-1 handy-cursor badge align-items-center p-1 pe-2 text-secondary-emphasis bg-secondary-subtle border border-secondary-subtle rounded-pill">
                                                                                <OverlayTrigger
                                                                                  placement="top"
                                                                                  overlay={<ReactTooltip id="tooltip1">Missing period data</ReactTooltip>}
                                                                                >
                                                                                  <span><AlertCircleIcon size="16" className="text-warning rounded-circle me-1"/></span>
                                                                                </OverlayTrigger>
                                                                                {dbDataSanitizer.preSanitize(object.entity.name)}
                                                                              </span>
                                                                            ))}
                                                                          </div>}
                                  </div>
                                  <p class="small badge text-muted fst-italic p-0">
                                    <span>
                                      Time chart of 
                                      {this.props.periodLabel == "experience" 
                                        ? " job experiences"
                                        : this.props.periodLabel == "education"
                                          ? " institutions attended"
                                          : " job experiences and institutions attended" }
                                    </span>
                                  </p>
                                </div>}
      </>
    );
  }
}
