/*import './ProfileGeoMapChart.css'*/
import React from 'react'
import { Chart } from 'chart.js';
import { WordCloudController, WordElement } from 'chartjs-chart-wordcloud';

Chart.register(WordCloudController, WordElement);

export default class ExperienceWordCloud extends React.Component{

  constructor(props){
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

    const words = [
      { key: "word", value: 10 },
      { key: "words", value: 8 },
      { key: "sprite", value: 7 },
      { key: "placed", value: 5 },
      { key: "layout", value: 4 },
      { key: "algorithm", value: 4 },
      { key: "area", value: 4 },
      { key: "without", value: 3 },
      { key: "step", value: 3 },
      { key: "bounding", value: 3 },
      { key: "retrieve", value: 3 },
      { key: "operation", value: 3 },
      { key: "collision", value: 3 },
    ];

    const chart = new Chart(document.getElementById("experience_cloud_word_canvas").getContext("2d"), {
      type: "wordCloud",
      data: {
        labels: words.map((d) => d.key),
        datasets: [
          {
            label: "",
            data: words.map((d) => 10 + d.value * 10)
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

  componentDidUpdate(){

  }

  render(){
    return (
      <>
        <div class="shadow border rounded border-1 p-2">
          <canvas id="experience_cloud_word_canvas"></canvas>
        </div>
        <p class="small badge text-muted fst-italic p-0">
          <span>Word cloud of all jobs' title</span>
        </p>
      </>
    );
  }
}