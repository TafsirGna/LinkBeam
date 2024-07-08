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

    var hashtags = [],
        feedPosts = [],
        feedPostViews = this.props.objects.filter((value, index, self) => self.findIndex(view => view.uid == value.uid) === index);

    for (const feedPostView of feedPostViews){

      var index = feedPosts.findIndex(post => post.id == feedPostView.feedPostId);
      var feedPost = null;
      if (index == -1){
        feedPost = await db.feedPosts.where({id: feedPostView.feedPostId}).first();
        feedPosts.push(feedPost);
      }
      else{
        feedPost = feedPosts[index];
      }

      if (!feedPost.references){
        continue;
      }

      for (const reference of feedPost.references){

        if (!isReferenceHashtag(reference)){
          continue;
        }

        index = hashtags.findIndex(h => h.key == getHashtagText(reference.text))
        if (index == -1){
          hashtags.push({
            key: getHashtagText(reference.text),
            value: 1,
          });
        }
        else{
          hashtags[index].value++;
        }
      }

    }

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