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

/*import './ExpEdStackBarChart.css'*/
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';
import { 
  dbDataSanitizer,
  saveCanvas,
  computePeriodTimeSpan,
  getPeriodLabel,
} from "../../Local_library";
import { DateTime as LuxonDateTime } from "luxon";
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import { db } from "../../../db";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  plugins: {
    title: {
      display: true,
      text: 'Education/Experience Bar Chart - Stacked',
    },
  },
  responsive: true,
  indexAxis: 'y',
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
      ticks: {
           display: false,
      },
    },
  },
};

export default class ExpEdStackBarChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      chartRef: React.createRef(),
      stackData: null,
      uuid: uuidv4(),
      incompleteProfiles: null,
      displayedProfiles: null,
    };

    this.onChartClick = this.onChartClick.bind(this);

  }

  componentDidMount() {

    eventBus.on(eventBus.DOWNLOAD_CHART_IMAGE, (data) =>
      {
        if (data.carrouselItemIndex != this.props.carrouselIndex){
          return;
        }

        saveCanvas(this.state.uuid, "Experience-education-stack-chart.png", saveAs);
      }
    );

    this.setChartData();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.setChartData();
    }

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

  async setChartData(){

    if (!this.props.objects){
      this.setState({stackData: null});
      return;
    }

    var labels = [], 
        expTimeData = [], 
        edTimeData = [], 
        incompleteProfiles = [],
        displayedProfiles = [];
    for (var profile of this.props.objects){

      var index = labels.map(e => e.url).indexOf(profile.url);
      if (index == -1){

        const fullName = dbDataSanitizer.preSanitize(profile.fullName);
        var experienceTime = computePeriodTimeSpan(profile.experience, "experience", LuxonDateTime),
            educationTime = computePeriodTimeSpan(profile.education, "education", LuxonDateTime);

        if (!experienceTime && !educationTime){
          incompleteProfiles.push(profile);
          continue;
        }

        displayedProfiles.push(profile);

        labels.push({url: profile.url, fullName: fullName});
        
        experienceTime = Math.ceil(experienceTime / (1000 * 60 * 60 * 24)) // diff days
        var y = Math.floor(experienceTime / 365);
        expTimeData.push(y.toFixed(2));

        educationTime = Math.ceil(educationTime / (1000 * 60 * 60 * 24)) // diff days
        y = Math.floor(educationTime / 365);
        edTimeData.push(-(y.toFixed(2)));
      }

    }

    this.setState({
      incompleteProfiles: incompleteProfiles,
      displayedProfiles: displayedProfiles,
      stackData: {
        labels: labels.map(label => label.fullName),
        datasets: [
          {
            label: 'Experience Time (years)',
            data: expTimeData, // labels.map(() => faker.datatype.number({ min: -20, max: 20 })),
            backgroundColor: 'rgb(255, 99, 132)',
          },
          {
            label: 'Education Time (years)',
            data: edTimeData, // labels.map(() => faker.datatype.number({ min: -20, max: 0 })),
            backgroundColor: 'rgb(75, 192, 192)',
          },
        ],
      }
    });

    this.setState({
    });

  }

  onChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);

    if (elements.length){
      console.log(elements, (elements[0]).index);
      window.open(`/index.html?view=Profile&data=${this.state.displayedProfiles[(elements[0]).index].url}`, '_blank');
    }

  }

  render(){
    return (
      <>
        <div class="">

          { !this.state.stackData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }

          { this.state.stackData && 
                              <div>
                                <div class="text-center">
                                  <Bar 
                                    ref={this.state.chartRef}
                                    id={"chartTag_"+this.state.uuid} 
                                    options={options} 
                                    data={this.state.stackData}
                                    onClick={this.onChartClick} />
                                </div>
                                { this.props.displayLegend 
                                    && this.props.displayLegend == true 
                                    && <div>
                                          { this.state.incompleteProfiles
                                              && this.state.incompleteProfiles.length != 0
                                              && <p class="shadow-sm mt-3 border p-2 rounded">
                                            { this.state.incompleteProfiles.map((profile) => (<OverlayTrigger
                                                                                              placement="top"
                                                                                              overlay={<ReactTooltip id="tooltip1">Incomplete profile</ReactTooltip>}
                                                                                            >
                                                                                              <span class="mx-1 shadow badge bg-secondary-subtle border border-secondary-subtle text-secondary-emphasis rounded-pill">{dbDataSanitizer.preSanitize(profile.fullName)}</span>
                                                                                            </OverlayTrigger>)
                                            )}
                                          </p>}
                                          <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">
                                            Chart of profiles by experience and education time lengths ({getPeriodLabel(this.props.view, this.props.periodRangeLimits, LuxonDateTime)})
                                          </p>
                                      </div> }
                              </div>}
          
        </div>
      </>
    );
  }
}