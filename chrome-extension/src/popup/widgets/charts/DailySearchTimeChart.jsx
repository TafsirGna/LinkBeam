/*import './ProfileGeoMapChart.css'*/
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { 
  sendDatabaseActionMessage, 
  getChartColors, 
  startMessageListener, 
  messageParams, 
  dbData, 
  ack, 
  dbDataSanitizer 
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
  Legend,
} from 'chart.js';
import { Colors } from 'chart.js';

// Chart.register(Colors);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
);

const barOptions = {
  responsive: true,
  /*layout: {
    padding: {
      left: 30,
      right: 30
    }
  }*/
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Searches Bar Chart',
    },
  },
};

export default class DailySearchTimeChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      barData: null,
    };
  }

  componentDidMount() {

    if (!this.props.objects){
      return;
    }

    var results = [];
    for (var search of this.props.objects){
      var index = results.map(e => e.url).indexOf(search.url);
      if (index == -1){
        var object = {
          url: search.url,
          label: dbDataSanitizer.fullName(search.profile.fullName),
          time: 0,
        };
        results.push(object);
      }
      else{
        results[index].time += (search.timeCount.value / 60);
      }
    }

    var colors = getChartColors(1);

    // setting the bar data
    this.setState({barData: {
        labels: results.map((object) => object.label),
        datasets: [
          {
            label: 'Time spent',
            data: results.map((object) => object.time),
            // data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
            backgroundColor: colors.borders,
            borderColor: colors.borders,
            borderWidth: 1,
          },
        ],
    }});

  }

  componentDidUpdate(){

  }

  render(){
    return (
      <>

        { !this.state.barData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }

        { this.state.barData && <Bar options={barOptions} data={this.state.barData} /> }

      </>
    );
  }
}