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
      text: 'Keywords Bar Chart',
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

    // setting the labels
    //
    var labels = [];
    //

    var objects = [];
    for (var search of this.props.objects){
      var index = objects.map(e => e.url).indexOf(search.url);
      if (index == -1){
        var object = {
          url: search.url,
          label: dbDataSanitizer.profileAbout(search.profile.fullName),
          time: 0,
        };
        objects.push(object);

        //
        labels.push(object.label);
        //
      }
      else{
        // TODO
      }
    }

    // setting the bar data
    this.setState({barData: {
        labels,
        datasets: [
          {
            label: 'Dataset',
            data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
            // backgroundColor: colors.backgrounds,
            // borderColor: colors.borders,
            borderWidth: 2,
          },
        ],
    }});

  }

  componentDidUpdate(){

  }

  render(){
    return (
      <>
        { this.state.barData && <Bar options={barOptions} data={this.state.barData} /> }
      </>
    );
  }
}