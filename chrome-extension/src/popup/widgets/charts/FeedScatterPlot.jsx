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
  getVisitPostCount,
} from "../../Local_library";
// import { faker } from '@faker-js/faker';
import moment from 'moment';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export const options = {
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Time spent'
      }
    },
    x: {
      title: {
        display: true,
        text: '# of posts'
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: ((tooltipItem, data) => {
          // console.log(tooltipItem);
          return `${moment(tooltipItem.raw.dateString).format('LLLL')}`;
        })
      }
    }
  }
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

    this.setState({data: {
        datasets: [
          {
            label: '# of posts/Time spent(mins)',
            data: this.props.objects.map(visit => ({
                          x: getVisitPostCount(visit),
                          y: (visit.timeCount / 60),
                          dateString: visit.date,
                        })),
            backgroundColor: getChartColors(1).borders[0],
          },
        ],
      },
    });

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
                 { this.state.data && <Scatter data={this.state.data} options={options} /> }
                </div>}
      </>
    );
  }
}