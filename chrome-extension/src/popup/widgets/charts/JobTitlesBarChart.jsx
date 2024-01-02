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
      text: 'Job titles Chart',
    },
  },
  scales: {
    x: {
      ticks: {
           display: false,
      },
    },
  },
  maintainAspectRatio: false,
};

export default class JobTitlesBarChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      barData: null,
    };
    this.setBarData = this.setBarData.bind(this);
  }

  componentDidMount() {

    if (!this.props.data){
      return;
    }

    this.setBarData();

  }

  setBarData(){

    var colors = getChartColors(1);

    // setting the bar data
    this.setState({barData: {
        labels: this.props.data.map((object) => object.label),
        datasets: [
          {
            label: '% Percentage',
            data: this.props.data.map((object) => object.value),
            backgroundColor: colors.borders,
            borderColor: colors.borders,
            borderWidth: 1,
          },
        ],
    }});

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.data != this.props.data){
      this.setBarData();
    }

  }

  render(){
    return (
      <>

        { !this.state.barData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }

        { this.state.barData && <Bar height="200" options={barOptions} data={this.state.barData} /> }

      </>
    );
  }
}