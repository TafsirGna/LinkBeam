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

/*import './DailyVisitsBarChart.css'*/
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { 
  getChartColors, 
  dbDataSanitizer,
  getProfileDataFrom,
  getVisitsTotalTime,
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
      display: true,
      text: 'Visits Bar Chart',
    },
  },
};

export default class DailyVisitsBarChart extends React.Component{

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

    var results = [];
    for (const visit of this.props.objects){
      const index = results.findIndex(r => r.url == visit.url),
            time = Object.hasOwn(visit, "profileData") ? (visit.timeCount / 60) : getVisitsTotalTime(await db.feedPostViews.where({visitId: visit.uniqueId}).toArray());

      if (index != -1){
        results[index].time += time;
        continue;
      }

      if (!Object.hasOwn(visit, "profileData")){ // a feed visit
        results.push({
          url: visit.url,
          label: "Feed",
          time: time,
        });
        continue;
      }

      var profile = null;
      try{
        profile = await getProfileDataFrom(db, visit.url);
      }
      catch(error){
        console.error("Error : ", error);
      }

      if (!profile){
        continue;
      }

      results.push({
        url: visit.url,
        label: dbDataSanitizer.preSanitize(profile.fullName).split(" ")[0],
        time: time,
      });

    }

    const colors = getChartColors(1);

    // setting the bar data
    this.setState({barData: {
        labels: results.map(object => object.label),
        datasets: [
          {
            label: 'Time spent (minutes)',
            data: results.map((object) => object.time),
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
                      { this.props.displayLegend && this.props.displayLegend == true && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">Chart of visits of the days with the spent time</p> }
                    </div> }

      </>
    );
  }
}