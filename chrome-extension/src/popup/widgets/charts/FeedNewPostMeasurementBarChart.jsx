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

/*import './FeedNewPostMeasurementBarChart.css'*/
import React from 'react';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
// import { faker } from '@faker-js/faker';
import { db } from "../../../db";
import FeedPostFreshnessMeasureTrendChart from "./FeedPostFreshnessMeasureTrendChart";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { 
  getChartColors, 
  dateBetweenRange,
} from "../../Local_library";
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
} from 'chart.js';
import { Colors } from 'chart.js';

// Chart.register(Colors);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
);

const barOptions = {
  responsive: true,
  /*layout: {
    padding: {
      left: 30,
      right: 30
    }
  }*/
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Old/New Posts Bar Chart',
    },
  },
};

export default class FeedNewPostMeasurementBarChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      barData: null,
      freshnessTrendModalShow: false,
      chartRef: React.createRef(),
      selectedCategory: null,
    };

    this.setChartData = this.setChartData.bind(this);
    this.onBarChartClick = this.onBarChartClick.bind(this);
  }

  componentDidMount() {

    this.setChartData()

  }

  handleFreshnessTrendModalClose = () => {this.setState({freshnessTrendModalShow: false});}
  handleFreshnessTrendModalShow = () => {this.setState({freshnessTrendModalShow: true});}

  async setChartData(){

    var periodPostUids = [];
    await db.feedPostViews
            .filter(postView => dateBetweenRange(this.props.rangeDates.start, this.props.rangeDates.end, postView.date))
            .each(postView => {
              if (periodPostUids.indexOf(postView.uid) == -1){
                periodPostUids.push(postView.uid);
              }
            });  

    var results = {
      Old: 0,
      New: 0, 
    }; 

    if (periodPostUids.length){

      // among those posts, how many of them are not only of this period
      var olderPostCount = 0;

      for (var uid of periodPostUids){

        const postView = await db.feedPostViews
                                  .where("uid")
                                  .equals(uid)
                                  .filter(postView => new Date(postView.date.split("T")[0]) < new Date(this.props.rangeDates.start))
                                  .first();

        if (postView){
          olderPostCount++;
        }

      }

      results = {
        Old: ((olderPostCount * 100) / periodPostUids.length).toFixed(1),
        New:(((periodPostUids.length - olderPostCount) * 100) / periodPostUids.length).toFixed(1), 
      };

    }

    var colors = getChartColors(1);

    // setting the bar data
    this.setState({barData: {
        labels: Object.keys(results),
        datasets: [
          {
            label: 'Count Percentage (%)',
            data: Object.keys(results).map((label) => results[label]),
            // data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
            backgroundColor: colors.borders,
            borderColor: colors.borders,
            borderWidth: 1,
          },
        ],
    }});

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.rangeDates != this.props.rangeDates){

      this.setChartData();

    }

  }

  onBarChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);
    console.log(elements, (elements[0]).index);

    if (elements.length != 0){
      this.setState({selectedCategory: this.state.barData.labels[(elements[0]).index]}, () => {
        this.handleFreshnessTrendModalShow();
      });
    }

  }

  render(){
    return (
      <>

        { !this.state.barData 
            && <div class="text-center">
                  <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div> }

        { this.state.barData 
            &&  <div class="p-3">
                  <Bar 
                    options={barOptions} 
                    data={this.state.barData} 
                    ref={this.state.chartRef}
                    onClick={this.onBarChartClick}/>

                  <Modal show={this.state.freshnessTrendModalShow} onHide={this.handleFreshnessTrendModalClose}>
                    <Modal.Header closeButton>
                      <Modal.Title>{this.state.selectedCategory != null ? `Evolution of the ${this.state.selectedCategory.toLowerCase()} posts count` : null}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                      <FeedPostFreshnessMeasureTrendChart
                        category={this.state.selectedCategory}
                        rangeDates={this.props.rangeDates}
                        colors={this.state.barData.datasets[0].borderColor}/>

                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" size="sm" onClick={this.handleFreshnessTrendModalClose} className="shadow">
                        Close
                      </Button>
                    </Modal.Footer>
                  </Modal>
                  {/*{ this.props.displayLegend 
                                        && this.props.displayLegend == true 
                                        && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">
                                            Chart of visits of the days with the spent time
                                          </p> }*/}
                </div> }

      </>
    );
  }
}