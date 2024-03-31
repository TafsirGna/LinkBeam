/*import './FeedPostCategoryDonutChart.css'*/
import React from 'react'
import * as ChartGeo from "chartjs-chart-geo";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { AlertCircleIcon } from "../SVGs";
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import { 
  getChartColors, 
  categoryVerbMap,
} from "../../Local_library";

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  cutout: 60,
};

export default class FeedPostCategoryDonutChart extends React.Component{

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

    if (!this.props.objects.length){
      return;
    }

    var labels = [], 
        data = [],
        colors = []; 


    labels = Object.keys(categoryVerbMap);
    labels.push("publications");
    
    data = labels.map(label => 0);
    colors = getChartColors(labels.length).borders;

    // setting the labels
    for (var visit of this.props.objects){
      for (var metric in categoryVerbMap){
        const index = labels.indexOf(metric);
        data[index] += visit.feedItemsMetrics[metric] ? visit.feedItemsMetrics[metric] : 0;
      }
    }

    this.setState({data: {
        labels: labels,
        datasets: [
          {
            label: 'Post Count',
            data: data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
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

        { this.props.objects 
          && <div>
              { this.props.objects.length == 0 
                && <div class="text-center m-5 mt-2">
                    <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">Not enough data to show this chart</span></p>
                  </div>}
               { this.props.objects.length != 0 
                  && this.state.data 
                  && <div>
                      { this.state.data.datasets[0].data.reduce((acc, a) => acc + a, 0) != 0 /*if the sum of the values isn't zero*/
                          && <Doughnut data={this.state.data} options={options} />}
                      { this.state.data.datasets[0].data.reduce((acc, a) => acc + a, 0) == 0 /*if the sum of the values is zero*/
                          && <div class="text-center m-5 mt-2">
                              <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                              <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">Not enough data to show this chart</span></p>
                            </div>}
                    </div> }
              </div>}
      </>
    );
  }
}