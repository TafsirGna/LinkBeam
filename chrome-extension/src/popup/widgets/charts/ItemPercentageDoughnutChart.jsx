/*import './ProfileGeoMapChart.css'*/
import React from 'react'
import * as ChartGeo from "chartjs-chart-geo";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  cutout: 60,
};

export default class ItemPercentageDoughnutChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      data: null,
      colors:[
        {back: 'rgba(255, 99, 132, 1)', bord: 'rgba(255, 99, 132, 1)'},
        {back: 'rgba(54, 162, 235, 1)', bord: 'rgba(54, 162, 235, 1)'},
        {back: 'rgba(255, 206, 86, 1)', bord: 'rgba(255, 206, 86, 1)'},
        {back: 'rgba(75, 192, 192, 1)', bord: 'rgba(75, 192, 192, 1)'},
        {back: 'rgba(153, 102, 255, 1)', bord: 'rgba(153, 102, 255, 1)'},
        {back: 'rgba(255, 159, 64, 1)', bord: 'rgba(255, 159, 64, 1)'},
        // {back: 'rgba(255, 99, 132, 0.2)', bord: 'rgba(255, 99, 132, 1)'},
        // {back: 'rgba(54, 162, 235, 0.2)', bord: 'rgba(54, 162, 235, 1)'},
        // {back: 'rgba(255, 206, 86, 0.2)', bord: 'rgba(255, 206, 86, 1)'},
        // {back: 'rgba(75, 192, 192, 0.2)', bord: 'rgba(75, 192, 192, 1)'},
        // {back: 'rgba(153, 102, 255, 0.2)', bord: 'rgba(153, 102, 255, 1)'},
        // {back: 'rgba(255, 159, 64, 0.2)', bord: 'rgba(255, 159, 64, 1)'},
      ],
    };
  }

  componentDidMount() {

    var color = this.state.colors[(Math.floor(Math.random() * this.state.colors.length))]

    this.setState({data: {
        labels: [this.props.data.label, 'Others'],
        datasets: [
          {
            label: 'Percentage %',
            data: [this.props.data.value, (100 - this.props.data.value)],
            backgroundColor: [
              color.back,
              'rgba(237, 231, 225, 0.2)',
            ],
            borderColor: [
              color.bord,
              'rgba(237, 231, 225, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
    });

  }

  componentDidUpdate(){

  }

  render(){
    return (
      <>
        <div class={"" + this.props.className} onClick={this.props.onClick}>
      	 { this.state.data && <Doughnut data={this.state.data} options={options} /> }
        </div>
      </>
    );
  }
}