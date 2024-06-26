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

/*import './ProfileElementsPeriodShareBarChart.css'*/
import React from 'react';
import { 
  appParams,
  dbDataSanitizer,
  isProfilePropertyLabelInList,
  getChartColors,
  saveCanvas,
  getPeriodLabel
} from "../../Local_library";
import { Bar, getElementAtEvent } from 'react-chartjs-2';
import { stringSimilarity } from "string-similarity-js";
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { Offcanvas } from "react-bootstrap";
import { DateTime as LuxonDateTime } from "luxon";
import { saveAs } from 'file-saver';
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
import ProfileListItemView from "../ProfileListItemView";

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

var barOptions = {
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
      text: 'Bar Chart',
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

export default class ProfileElementsPeriodShareBarChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      chartRef: React.createRef(),
      barData: null,
      items: null,
      offCanvasShow: false,
      selectedChartElementIndex: null,
      uuid: uuidv4(),
    };

    this.setBarData = this.setBarData.bind(this);
    this.getChartTitle = this.getChartTitle.bind(this);
    this.onChartClick = this.onChartClick.bind(this);
  }

  componentDidMount() {

    eventBus.on(eventBus.DOWNLOAD_CHART_IMAGE, (data) =>
      {
        if (data.carrouselItemIndex != this.props.carrouselIndex){
          return;
        }

        saveCanvas(this.state.uuid, "profile-properties-labels-period-share.png", saveAs);
      }
    );

    this.setBarData();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.profiles != this.props.profiles){
      this.setBarData();
    }

  }

  setBarData(){

    if (!this.props.profiles){
      return;
    }

    var items = [];

    for (const profile of this.props.profiles){

      var profileElementList = profile[this.props.profilePropertyName == "jobTitles" 
                                        ? "experience" 
                                        : this.props.profilePropertyName];

      if (!profileElementList){
        continue;
      }

      for (const element of profileElementList){

        var elementName = null;

        if (this.props.profilePropertyName == "languages"){
          elementName = dbDataSanitizer.preSanitize(element.name);
        }
        else{
          if (this.props.profilePropertyName == "jobTitles" || this.props.profilePropertyName == "certifications"){
            elementName = dbDataSanitizer.preSanitize(element.title);
          }
          else{
            if (element != "incomplete"){
              elementName = dbDataSanitizer.preSanitize(element.entity.name);
            }
            else{
              continue;
            }
          } 

          if (!isProfilePropertyLabelInList(elementName, items.map(i => i.label), this.props.profilePropertyName, stringSimilarity)){
            items.push({
              label: elementName,
              profiles: [profile],
            });
          }
          else{
            const index = items.findIndex(i => stringSimilarity(i.label, elementName) > 0.8);
            if (items[index].profiles.findIndex(o => o.url == profile.url) == -1){
              items[index].profiles.push(profile);
            }
          }

        }

      }

    }

    items.sort((a, b) => (b.profiles.length - a.profiles.length));
    var colors = getChartColors(1);
    barOptions.plugins.title.text = `${this.getChartTitle()} bar chart`;

    this.setState({barData: {
        labels: items.map(object => object.label),
        datasets: [
          {
            label: this.getChartTitle(),
            data: items.map((object) => object.profiles.length),
            // data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
            backgroundColor: colors.borders,
            borderColor: colors.borders,
            borderWidth: 1,
          },
        ],
    },
    items: items});

  }

  getChartTitle(){

    var result = null;
    switch(this.props.profilePropertyName){
      case "education":{
        result = "All education institutions";
        break;
      }
      case "experience":{
        result = "All employers";
        break;
      }
      case "jobTitles":{
        result = "All job titles";
        break;
      }
      case "certifications":{
        result = "All certifications";
        break;
      }
      case "languages":{
        result = "All languages";
        break;
      }
    }

    return result;

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

        { !this.state.barData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }

        { this.state.barData && 
                    <div>
                      <Bar 
                        ref={this.state.chartRef}
                        id={"chartTag_"+this.state.uuid} 
                        options={barOptions} 
                        data={this.state.barData} 
                        onClick={this.onChartClick} />
                      { this.props.displayLegend 
                          && this.props.displayLegend == true 
                          && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">
                              Chart of {this.getChartTitle()} ({getPeriodLabel(this.props.view, this.props.periodRangeLimits, LuxonDateTime)})
                            </p> }
                    </div> }

        <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
             { (this.state.selectedChartElementIndex != null) ? this.state.items[this.state.selectedChartElementIndex].label : "Title" }
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>

            { this.state.selectedChartElementIndex == null && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div>}

            { (this.state.selectedChartElementIndex != null && ((this.state.items[this.state.selectedChartElementIndex]).profiles).length == 0) && <div class="text-center m-5 mt-2">
                    <img 
                      src={sorry_icon} 
                      width="80" />
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No corresponding profiles</span></p>
                  </div> }
            
            { (this.state.selectedChartElementIndex != null && ((this.state.items[this.state.selectedChartElementIndex]).profiles).length != 0) && 
                <div class="list-group m-1 shadow-sm small">
                  { (this.state.items[this.state.selectedChartElementIndex]).profiles.map(profile => (<ProfileListItemView profile={profile} />)) }
                </div>}
          </Offcanvas.Body>
        </Offcanvas>

      </>
    );
  }
}
