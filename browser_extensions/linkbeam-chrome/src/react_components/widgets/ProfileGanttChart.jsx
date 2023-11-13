/*import './ProfileViewReminderModal.css'*/
import React from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
/*import 'bootstrap/dist/css/bootstrap.min.css';*/
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
import { OverlayTrigger } from "react-bootstrap";
import { faker } from '@faker-js/faker';
import 'chartjs-adapter-date-fns';
import { Line, Bar } from 'react-chartjs-2';
import { appParams, getChartColors } from "../Local_library";
import moment from 'moment';

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

      barOptions: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: {
            position: "top",
            type: "time",
            time: {
                displayFormats: {
                    quarter: 'MMM YYYY'
                }
            },
            min: "1900-01-01",
            max: "1900-01-01",
          },
        },
        plugins: {
          legend: {
            display: false,
          }
        }
      },

      barData: {
        // labels,
        datasets: [
          {
            label: 'Dataset',
            data: [],
            // backgroundColor: 'rgba(255, 99, 132, 1)',
            // borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            borderSkipped: false,
            borderRadius: 10,
            barPercentage: .7,
          },
        ],
      },

    };
  }

  componentDidMount() {

    // Setting the data for the chart
    this.setBarData();
  }

  setBarData(){

    var data = [], minDate = moment();

    for (var experience of this.props.profile.experience){

      var company = experience.company;

      // handling date range
      var dateRange = experience.period.replaceAll("\n", "").split(appParams.DATE_RANGE_SEPARATOR);
      var startDateRange = dateRange[0], endDateRange = dateRange[1];

      // starting with the start date
      startDateRange = moment(startDateRange, "MMM YYYY");

      // Setting the minDate object
      if (startDateRange < minDate){
        minDate = startDateRange;
      }

      // then the end date
      if (endDateRange.indexOf("Present") > -1 || endDateRange.indexOf("aujourd'hui") > -1 ){ // contains Present 
        endDateRange = moment().format("YYYY-MM-DD");
      }
      else{
        endDateRange = moment(endDateRange, "MMM YYYY").format("YYYY-MM-DD");
      }

      data.push({x: [startDateRange.format("YYYY-MM-DD"), endDateRange], y: company});

    }

    this.setState({barOptions: {
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
          }
        }
      }
    });

    var chartColors = getChartColors(data.length);

    this.setState({barData: {
      // labels,
      datasets: [
        {
          label: 'Dataset',
          data: data,
          backgroundColor: chartColors.backgrounds,
          borderColor: chartColors.borders,
          borderWidth: 1,
          borderSkipped: false,
          borderRadius: 10,
          barPercentage: .7,
        },
      ],
    }});

  }

  render(){
    return (
      <>
        <Bar options={this.state.barOptions} data={this.state.barData} plugins={[todayLinePlugin]}/>
      </>
    );
  }
}
