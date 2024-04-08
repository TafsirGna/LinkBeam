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


/*import './VisitsKeywordsBarChart.css'*/
import React from 'react';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { Offcanvas } from "react-bootstrap";
import { 
  getChartColors, 
  appParams, 
  saveCanvas, 
  setGlobalDataKeywords,
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
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { db } from "../../../db";
import { saveAs } from 'file-saver';
import { AlertCircleIcon } from "../SVGs";
import ProfileListItemView from "../ProfileListItemView";
import { liveQuery } from "dexie";
import sorry_icon from '../../../assets/sorry_icon.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
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
      text: 'Keywords Chart',
    },
  },
};

export default class VisitsKeywordsBarChart extends React.Component{

	constructor(props){
		super(props);
		this.state = {
      chartRef: React.createRef(),
			barData: null,
      uuid: uuidv4(),
      offCanvasShow: false,
      selectedChartElementIndex: null,
      labelsData: null,
		};
    this.setChartData = this.setChartData.bind(this);
    this.onChartClick = this.onChartClick.bind(this);

	}

	componentDidMount() {

    eventBus.on(eventBus.DOWNLOAD_CHART_IMAGE, (data) =>
      {
        if (data.carrouselItemIndex != this.props.carrouselIndex){
          return;
        }

        saveCanvas(this.state.uuid, "visits-keywords-bar-chart.png", saveAs);
      }
    );

    if (this.props.globalData.keywordList){
      this.setChartData();
    }
    else{
      setGlobalDataKeywords(db, eventBus, liveQuery);
    }

	}

  componentDidUpdate(prevProps, prevState){
    
    if (prevProps.objects != this.props.objects){
      this.setChartData();
    }

    if (prevProps.globalData != this.props.globalData){
      if (prevProps.globalData.keywordList != this.props.globalData.keywordList){
        this.setChartData();
      }
    }

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

	async setChartData(){

    if (!this.props.objects){
      this.setState({barData: null});
      return;
    }

    var barData = [];
    for (var keyword of this.props.globalData.keywordList){ 
      var profiles = [];
      for (var profile of this.props.objects){
        if (profiles.map(e => e.url).indexOf(profile.url) == -1){

          if (JSON.stringify(profile).toLowerCase().indexOf(keyword.name.toLowerCase()) != -1){
            profiles.push(profile);
          }

        }
      }
      barData.push({label: keyword.name, profiles: profiles}); 
    }

  	var colors = getChartColors(barData.length);

  	this.setState({
      barData: {
    		labels: barData.map((obj) => obj.label),
    		datasets: [
	        {
	          label: 'Keyword occurences',
	          data: barData.map((obj) => obj.profiles.length),
	          backgroundColor: colors.backgrounds,
            borderColor: colors.borders,
            borderWidth: 2,
	        },
      	],
      },
      labelsData: barData,
    });
  }

  onChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);
    console.log(elements, (elements[0]).index);

    if (elements.length != 0){
      this.handleOffCanvasShow((elements[0]).index);
    }

  }

  handleOffCanvasClose = () => { 
    this.setState({offCanvasShow: false}, 
    () => { this.setState({selectedChartElementIndex: null}); });
  };

  handleOffCanvasShow = (elementIndex) => { 
    this.setState({selectedChartElementIndex: elementIndex}, 
    () => { 
      this.setState({offCanvasShow: true});
    }
  )};

	render(){
		return (
			<>
        <div class="text-center">

          { !this.state.barData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }

          { this.state.barData && this.state.labelsData.length == 0 && <div class="text-center m-5 mt-4">
                      <AlertCircleIcon size="100" className="text-muted"/>
                      <p><span class="badge text-bg-primary fst-italic shadow">No keywords yet</span></p>
                    </div>}

				  { this.state.barData && this.state.labelsData.length != 0 && 
                                <div>
                                  <Bar 
                                    ref={this.state.chartRef}
                                    id={"chartTag_"+this.state.uuid} 
                                    options={barOptions} 
                                    data={this.state.barData}
                                    onClick={this.onChartClick} />
                                  { this.props.displayLegend && this.props.displayLegend == true && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">Chart of visits distributed by keywords</p> }
                                </div> }

        </div>

        <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
             { (this.state.selectedChartElementIndex != null) ? ("Keyword: " + this.state.labelsData[this.state.selectedChartElementIndex].label) : "Title" }
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>

            { this.state.selectedChartElementIndex == null && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div>}

            { (this.state.selectedChartElementIndex != null && ((this.state.labelsData[this.state.selectedChartElementIndex]).profiles).length == 0) && <div class="text-center m-5 mt-2">
                    <img 
                      src={sorry_icon} 
                      width="80" />
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No corresponding profiles</span></p>
                  </div> }
            
            { (this.state.selectedChartElementIndex != null && ((this.state.labelsData[this.state.selectedChartElementIndex]).profiles).length != 0) && 
                <div class="list-group m-1 shadow-sm small">
                  { (this.state.labelsData[this.state.selectedChartElementIndex]).profiles.map(profile => (<ProfileListItemView profile={profile} />)) }
                </div>}
          </Offcanvas.Body>
        </Offcanvas>
			</>
		);
	}
}
