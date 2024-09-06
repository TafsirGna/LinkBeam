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

/*import './FeedProfileReactionsSubjectsBarChart.css'*/
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { 
  getChartColors, 
  dbDataSanitizer,
  getProfileDataFrom,
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
import { db } from "../../../db";

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
      display: false,
      text: 'Feed Interactions Bar Chart',
    },
  },
  scales: {
    x: {
      ticks: {
        display: false,
      },
    },
  },
};

export default class FeedProfileReactionsSubjectsBarChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      barData: null,
    };

    this.setChartData = this.setChartData.bind(this);
  }

  componentDidMount() {

    this.setChartData()

  }

  async setChartData(){

    if (!this.props.objects){
      return;
    }

    var data = [],
        feedPosts = [],
        feedPostViews = this.props.objects.filter((value, index, self) => self.findIndex(view => view.htmlElId == value.htmlElId) === index);

    for (var feedPostView of feedPostViews){
      
      if (feedPostView.category
            && feedPostView.profile 
            && feedPostView.profile.uniqueId != this.props.profile.uniqueId){
        const index = data.findIndex(o => o.uniqueId == feedPostView.profile.uniqueId);
        if (index == -1){
          data.push({
            ...feedPostView.profile,
            value: 1,
          });
        }
        else{
          data[index].value++;
        }
      }
      else if (!feedPostView.category 
                  || (feedPostView.category 
                        && feedPostView.profile 
                        && feedPostView.profile.uniqueId == this.props.profile.uniqueId)){

        if (feedPostView.feedPost.profile.uniqueId != this.props.profile.uniqueId){
          const index = data.findIndex(o => o.uniqueId == feedPostView.feedPost.profile.uniqueId);
          if (index == -1){
            data.push({
              ...feedPostView.feedPost.profile,
              value: 1,
            });
          }
          else{
            data[index].value++;
          }
        }

      }

    }

    var colors = getChartColors(1);

    // setting the bar data
    this.setState({barData: {
        labels: data.map(object => object.name),
        datasets: [
          {
            label: `Interactions Count`,
            data: data.map((object) => object.value),
            // data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
            backgroundColor: colors.borders,
            borderColor: colors.borders,
            borderWidth: 1,
          },
        ],
    }});

  }

  componentDidUpdate(prevProps, prevState){
    
    if (prevProps.objects != this.props.objects){
      this.setChartData();
    }

  }

  render(){
    return (
      <>

        { !this.state.barData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }

        { this.state.barData && 
                    <div>
                      <Bar options={barOptions} data={this.state.barData} />
                      {/*{ this.props.displayLegend && this.props.displayLegend == true && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">Chart of visits of the days with the spent time</p> }*/}
                    </div> }

      </>
    );
  }
}