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

/*import './FeedPostCreatOccurCandleStickChart.css'*/
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Colors,
} from 'chart.js';
// import { faker } from '@faker-js/faker';
import 'chartjs-adapter-date-fns';
import { Line, Bar, getElementAtEvent } from 'react-chartjs-2';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ActivityListView from "../ActivityListView";
import {  
  getChartColors,
  dbDataSanitizer,
  appParams,
} from "../../Local_library";
import { DateTime as LuxonDateTime } from "luxon";
import { db } from "../../../db";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, 
  Colors,
);

export default class FeedPostCreatOccurCandleStickChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      barOptions: null,
      barData: null,
      feedPosts: null,
      chartRef: React.createRef(),
      startDateLinePlugin: null,
      postModalShow: false,
      selectedFeedPostIndex: null,
    };

    this.onChartClick = this.onChartClick.bind(this);

  }

  componentDidMount() {

    // Setting the data for the chart
    this.setBarData();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.setBarData();
    }

  }

  async setBarData(){

    var data = [[], []], 
        minDate = LuxonDateTime.now(),
        feedPosts = [],
        labels = [];


    for (var feedPostView of this.props.objects){

      const index = feedPosts.findIndex(p => p.id == feedPostView.feedPostId);
      if (index != -1){
        feedPosts[index].views.push(feedPostView); 
      }
      else{

        var feedPost = await db.feedPosts.where({id: feedPostView.feedPostId}).first();

        if (!feedPost.date){
          continue;
        }

        minDate = LuxonDateTime.fromISO(feedPost.date) < minDate ? LuxonDateTime.fromISO(feedPost.date) : minDate;

        feedPost.views = [feedPostView];
        var firstView = await db.feedPostViews.where({feedPostId: feedPostView.feedPostId}).first()
        feedPost.firstFeedOccurence = firstView.date;
        feedPost.uid = firstView.uid;

        feedPosts.push(feedPost);

        data[0].push({
          x: new Date(feedPost.date).valueOf().toString(),
          y: [feedPost.date.split("T")[0], feedPost.firstFeedOccurence.split("T")[0]], 
        });

        data[1].push({
          x: new Date(feedPost.date).valueOf().toString(),
          y: [feedPost.firstFeedOccurence.split("T")[0], this.props.rangeDates.end], 
        });

        labels.push(new Date(feedPost.date).valueOf().toString());

      }

    }

    this.setState({
      feedPosts: feedPosts,
      barOptions: {
        indexAxis: 'x',
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
            // stacked: true,
          },
          y: {
            position: "left",
            type: "time",
            time:{
                unit: 'day'
            },
            min: minDate.toFormat("yyyy-MM-dd"),
            max: this.props.rangeDates.end,
            // stacked: true,
            reverse: true,
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: {
                // This more specific font property overrides the global property
                font: {
                    weight: "bolder"
                }
            }
          },
          tooltip: {
            callbacks: {
              label: ((tooltipItem, data) => {
                // console.log(tooltipItem);
                return `${tooltipItem.dataset.label} [${tooltipItem.raw.y[0]} - ${tooltipItem.raw.y[1]}]`;
              })
            }
          }
        }
      },
      startDateLinePlugin: {
        id: "startDateLine",
        afterDatasetsDraw: ((chart, args, pluginOptions) => {

          const { ctx, data, chartArea: { top, bottom, left, right }, scales: { x, y } } = chart;

          ctx.save();
          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.strokeStyle = "rgba(255, 99, 132, 1)";
          ctx.setLineDash([6, 6]);
          ctx.moveTo(left, y.getPixelForValue(new Date(this.props.rangeDates.start)));
          ctx.lineTo(right, y.getPixelForValue(new Date(this.props.rangeDates.start)));
          ctx.stroke();

          ctx.setLineDash([]);
        }).bind(this),
      }
    }, () => {

      const datasetLabels = ["Creation -> First occurence", "First occurence -> now"];
      const chartColors = getChartColors(datasetLabels.length);
      const datasets = datasetLabels.map((label, index) => ({
        label: label,
        data: data[index],
        backgroundColor: [chartColors.borders[index]]/*chartColors.backgrounds*/,
        borderColor: [chartColors.borders[index]],
        borderWidth: 1,
        borderSkipped: false,
        // borderRadius: 10,
        barPercentage: .85,
      }))

      this.setState({
        barData: {
          // labels,
          datasets: datasets,
        },
      });

    });

  }

  onChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);
    console.log(elements, (elements[0]).index);

    if (elements.length != 0){
      this.setState({selectedFeedPostIndex: elements[0].index}, () => {
        this.handlePostModalShow();
      });
    }

  }

  handlePostModalClose = () => this.setState({postModalShow: false, selectedFeedPostIndex: null});
  handlePostModalShow = () => this.setState({postModalShow: true});

  render(){
    return (
      <>
        { this.state.barData && <div> 
                                  <Bar 
                                      ref={this.state.chartRef}
                                      options={this.state.barOptions} 
                                      data={this.state.barData} 
                                      plugins={[this.state.startDateLinePlugin]}
                                      onClick={this.onChartClick}
                                      />

                                  <Modal 
                                    show={this.state.postModalShow} 
                                    onHide={this.handlePostModalClose}>
                                    <Modal.Header closeButton>
                                      <Modal.Title>Post</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>

                                      { this.state.selectedFeedPostIndex 
                                          && <ActivityListView 
                                                objects={[{
                                                  user: {
                                                    picture: this.state.feedPosts[this.state.selectedFeedPostIndex].author.picture,
                                                    name: this.state.feedPosts[this.state.selectedFeedPostIndex].author.name,
                                                  },
                                                  link: `${appParams.LINKEDIN_FEED_POST_ROOT_URL()}${this.state.feedPosts[this.state.selectedFeedPostIndex].uid}`,
                                                  // date: views.length ? views[0].date : null,
                                                  text: this.state.feedPosts[this.state.selectedFeedPostIndex].text,
                                                }]}
                                                variant="list"/>}

                                    </Modal.Body>
                                    <Modal.Footer>
                                      <Button variant="secondary" size="sm" onClick={this.handlePostModalClose} className="shadow">
                                        Close
                                      </Button>
                                    </Modal.Footer>
                                  </Modal>

                                </div>}
      </>
    );
  }
}
