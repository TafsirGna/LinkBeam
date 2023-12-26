/*import './ExpEdStackBarChart.css'*/
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';
import { 
  dbDataSanitizer,
  saveCanvas,
} from "../../Local_library";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  plugins: {
    title: {
      display: true,
      text: 'Chart.js Bar Chart - Stacked',
    },
  },
  responsive: true,
  indexAxis: 'y',
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
      ticks: {
           display: false,
      },
    },
  },
};

export default class ExpEdStackBarChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      stackLabels: null,
      stackData: null,
      uuid: uuidv4(),
    };
  }

  componentDidMount() {

    eventBus.on(eventBus.DOWNLOAD_CHART_IMAGE, (data) =>
      {
        if (data.carrouselItemIndex != this.props.carrouselIndex){
          return;
        }

        saveCanvas(this.state.uuid, "Experience-education-stack-chart.png", saveAs);
      }
    );

    this.setChartData();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.setChartData();
    }

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

  setChartData(){

    if (!this.props.objects){
      return;
    }

    var labels = [];
    for (var search of this.props.objects){

      var fullName = dbDataSanitizer.fullName(search.profile.fullName);
      var index = labels.indexOf(fullName);
      if (index == -1){
        labels.push(fullName);
      }

    }

    this.setState({stackData: {
        labels,
        datasets: [
          {
            label: 'Dataset 1',
            data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
            backgroundColor: 'rgb(255, 99, 132)',
          },
          {
            label: 'Dataset 2',
            data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
            backgroundColor: 'rgb(75, 192, 192)',
          },
        ],
      }
    });

  }

  render(){
    return (
      <>
        <div class="text-center">

          { !this.state.stackData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }

          { this.state.stackData && <Bar id={"chartTag_"+this.state.uuid} options={options} data={this.state.stackData} />}
          
        </div>
      </>
    );
  }
}