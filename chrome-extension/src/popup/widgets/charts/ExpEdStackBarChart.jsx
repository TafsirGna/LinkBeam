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
  computeExperienceTime
} from "../../Local_library";
import moment from 'moment';

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

    var labels = [], expTimeData = [], edTimeData = [];
    for (var search of this.props.objects){

      var fullName = dbDataSanitizer.fullName(search.profile.fullName);
      var index = labels.indexOf(fullName);
      if (index == -1){
        labels.push(fullName);

        console.log("%%%%%%%%%%%%%%%%%%%%%%%%% : ", search.profile.experience);
        var experienceTime = computeExperienceTime(search.profile.experience, {moment: moment});
        experienceTime = Math.ceil(experienceTime / (1000 * 60 * 60 * 24)) // diff days
        var y = Math.floor(experienceTime / 365);
        expTimeData.push(Number(y));
      }

    }

    this.setState({stackData: {
        labels,
        datasets: [
          {
            label: 'Experience Time',
            data: expTimeData, // labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
            backgroundColor: 'rgb(255, 99, 132)',
          },
          {
            label: 'Education Time',
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