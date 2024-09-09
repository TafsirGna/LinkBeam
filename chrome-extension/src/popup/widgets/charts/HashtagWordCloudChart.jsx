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
import { db } from "../../../db";
import { 
  getHashtagText,
  isReferenceHashtag,
  extractHashtags
} from "../../Local_library";

Chart.register(WordCloudController, WordElement);

export default class HashtagWordCloudChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      chartRef: React.createRef(), 
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

  async setChartData(){

    if (!this.props.objects){
      return;
    }

    const feedPostViews = this.props.objects.filter((value, index, self) => self.findIndex(view => view.feedPostId == value.feedPostId) === index);
    const hashtags = extractHashtags(feedPostViews).map(hashtag => ({
                                                          key: hashtag.text,
                                                          value: feedPostViews.filter(v => v.feedPost.references?.filter(reference => isReferenceHashtag(reference)
                                                                                                                                        && getHashtagText(reference.text) == hashtag.text)
                                                                                                                .length)
                                                                              .length,
                                                      }));


    const chart = new Chart(this.state.chartRef.current.getContext("2d"), {
      type: "wordCloud",
      data: {
        labels: hashtags.map((d) => d.key),
        datasets: [
          {
            label: "",
            data: hashtags.map((d) => 10 + d.value * 10)
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
        <canvas ref={this.state.chartRef}></canvas>
      </>
    );
  }
}