/*import './ProfileGeoMapChart.css'*/
import React from 'react'
import { Chart } from 'chart.js';
import { WordCloudController, WordElement } from 'chartjs-chart-wordcloud';

Chart.register(WordCloudController, WordElement);

export default class JobTitlesWordCloudChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

    this.drawChart();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.data != this.props.data){
      this.drawChart();
    }

  }

  drawChart(){

    console.log('PPPPPPPPPPPPPPPPPP : ', this.props.data);

    if (!this.props.data){
      return;
    }

    const chart = new Chart(document.getElementById("experience_cloud_word_canvas").getContext("2d"), {
      type: "wordCloud",
      data: {
        labels: this.props.data.map((d) => d.label),
        datasets: [
          {
            label: "",
            data: this.props.data.map((d) => (d.value >= 10 ? d.value : 10 )),
          }
        ]
      },
      options: {
        title: {
          display: false,
          text: "Chart.js Word Cloud"
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

  }

  render(){
    return (
      <>
        {this.props.data && <div>
                  <div class="shadow border rounded border-1 p-2">
                    <canvas id="experience_cloud_word_canvas"></canvas>
                  </div>
                  <p class="small badge text-muted fst-italic p-0">
                    <span>Word cloud of all jobs' title</span>
                  </p>
                </div>}
      </>
    );
  }
}