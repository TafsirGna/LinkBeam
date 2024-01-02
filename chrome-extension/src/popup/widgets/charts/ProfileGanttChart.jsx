/*import './ProfileViewReminderModal.css'*/
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
import { OverlayTrigger } from "react-bootstrap";
import { faker } from '@faker-js/faker';
import 'chartjs-adapter-date-fns';
import { Line, Bar } from 'react-chartjs-2';
import { 
  appParams, 
  getChartColors ,
  dbDataSanitizer,
} from "../../Local_library";
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
      barOptions: null,
      barData: null,

    };
  }

  componentDidMount() {

    // Setting the data for the chart
    this.setBarData();
  }

  setBarData(){

    var data = [], minDate = moment();

    for (var experience of this.props.profile.experience){

      var company = dbDataSanitizer.companyName(experience.company);
      
      // Setting the minDate object
      if (experience.period.startDateRange < minDate){ minDate = experience.period.startDateRange; }
      
      data.push({x: [experience.period.startDateRange.format("YYYY-MM-DD"), experience.period.endDateRange.format("YYYY-MM-DD")], y: company});

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
    }, () => {

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

    });

  }

  render(){
    return (
      <>
        { this.state.barData && <div> 
                                  <div class="shadow border rounded border-1 p-2">
                                    <Bar options={this.state.barOptions} data={this.state.barData} plugins={[todayLinePlugin]}/>
                                  </div>
                                  <p class="small badge text-muted fst-italic p-0">
                                    <span>Time chart of job experiences</span>
                                  </p>
                                </div>}
      </>
    );
  }
}
