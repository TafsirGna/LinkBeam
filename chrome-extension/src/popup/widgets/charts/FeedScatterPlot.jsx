/*import './FeedScatterPlot.css'*/
import React from 'react'
import * as ChartGeo from "chartjs-chart-geo";
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { AlertCircleIcon } from "../SVGs";
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import { 
  getChartColors, 
} from "../../Local_library";
import { faker } from '@faker-js/faker';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export const data = {
  datasets: [
    {
      label: 'A dataset',
      data: Array.from({ length: 100 }, () => ({
        x: faker.datatype.number({ min: -100, max: 100 }),
        y: faker.datatype.number({ min: -100, max: 100 }),
      })),
      backgroundColor: 'rgba(255, 99, 132, 1)',
    },
  ],
};

export default class FeedScatterPlot extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      data: null,
    };

    this.setChartData = this.setChartData.bind(this);
  }

  componentDidMount() {

    this.setChartData();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.setChartData();
    }

  }

  setChartData(){

    if (!this.props.objects){
      return;
    }

    // var labels = [], 
    //     data = [],
    //     colors = []; 

    // if (this.props.objects.length){

    //   labels = Object.keys(this.props.objects[0].itemsMetrics);
    //   data = labels.map(label => 0);
    //   colors = getChartColors(labels.length).borders;

    //   // setting the labels
    //   for (var visit of this.props.objects){
    //     for (var metric of Object.keys(visit.itemsMetrics)){
    //       const index = labels.indexOf(metric);
    //       data[index] += visit.itemsMetrics[metric];
    //     }
    //   }

    // }

    // this.setState({data: {
    //     labels: labels,
    //     datasets: [
    //       {
    //         label: 'Percentage %',
    //         data: data,
    //         backgroundColor: colors,
    //         borderColor: colors,
    //         borderWidth: 1,
    //       },
    //     ],
    //   },
    // });

  }

  render(){
    return (
      <>
        { !this.props.objects && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                  </div>
                </div>}

        { this.props.objects && <div>
                 { /*this.state.data &&*/ <Scatter data={data} options={options} /> }
                </div>}
      </>
    );
  }
}