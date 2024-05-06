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
  computePeriodTimeSpan,
  getProfileDataFrom,
} from "../../Local_library";
import { DateTime as LuxonDateTime } from "luxon";
import { db } from "../../../db";

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
      text: 'Education/Experience Bar Chart - Stacked',
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

  async setChartData(){

    if (!this.props.objects){
      this.setState({stackData: null});
      return;
    }

    var labels = [], expTimeData = [], edTimeData = [];
    for (var profile of this.props.objects){

      var index = labels.map(e => e.url).indexOf(profile.url);
      if (index == -1){

        const fullName = dbDataSanitizer.preSanitize(profile.fullName);
        labels.push({url: profile.url, fullName: fullName});

        // console.log("%%%%%%%%%%%%%%%%%%%%%%%%% 1 : ", profile);
        var experienceTime = computePeriodTimeSpan(profile.experience, "experience", LuxonDateTime),
            educationTime = computePeriodTimeSpan(profile.education, "education", LuxonDateTime);
        
        experienceTime = Math.ceil(experienceTime / (1000 * 60 * 60 * 24)) // diff days
        var y = Math.floor(experienceTime / 365);
        expTimeData.push(y.toFixed(2));

        educationTime = Math.ceil(educationTime / (1000 * 60 * 60 * 24)) // diff days
        y = Math.floor(educationTime / 365);
        edTimeData.push(-(y.toFixed(2)));
        // expTimeData.push(Number(y));
      }

    }

    this.setState({stackData: {
        labels: labels.map(label => label.fullName),
        datasets: [
          {
            label: 'Experience Time (years)',
            data: expTimeData, // labels.map(() => faker.datatype.number({ min: -20, max: 20 })),
            backgroundColor: 'rgb(255, 99, 132)',
          },
          {
            label: 'Education Time (years)',
            data: edTimeData, // labels.map(() => faker.datatype.number({ min: -20, max: 0 })),
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

          { this.state.stackData && 
                              <div>
                                <Bar id={"chartTag_"+this.state.uuid} options={options} data={this.state.stackData} />
                                { this.props.displayLegend && this.props.displayLegend == true && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">Chart of profiles by experience and education time lengths</p> }
                              </div>}
          
        </div>
      </>
    );
  }
}