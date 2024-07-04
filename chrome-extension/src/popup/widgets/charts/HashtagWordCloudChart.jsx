/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

/*import './HashtagWordCloudChart.css'*/
import React from 'react'
import { Chart } from 'chart.js';
import { WordCloudController, WordElement } from 'chartjs-chart-wordcloud';

Chart.register(WordCloudController, WordElement);

export default class HashtagWordCloudChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      chartRef: React.createRef(), 
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

    const chart = new Chart(/*document.getElementById("experience_cloud_word_canvas")*/this.state.chartRef.current.getContext("2d"), {
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
        <canvas ref={this.state.chartRef}></canvas>
      </>
    );
  }
}