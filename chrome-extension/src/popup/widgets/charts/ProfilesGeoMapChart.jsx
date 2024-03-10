/*import './ProfilesGeoMapChart.css'*/
import React from 'react'
import * as ChartGeo from "chartjs-chart-geo";
import { Chart, getElementAtEvent } from "react-chartjs-2";
import { countriesNaming } from "../../countriesNamingFile";
import { db } from "../../../db";
import {
  Chart as ChartJS,
  CategoryScale,
  Tooltip,
  Title,
  Legend
} from "chart.js";
import { 
  saveCanvas,
  dbDataSanitizer,
  appParams,
} from "../../Local_library";

import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';
import { Offcanvas } from "react-bootstrap";
import ProfileListItemView from "../ProfileListItemView";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  ChartGeo.ChoroplethController,
  ChartGeo.ProjectionScale,
  ChartGeo.ColorScale,
  ChartGeo.GeoFeature
);

export default class ProfilesGeoMapChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      chartCountries: null,
      uuid: uuidv4(),
      locationsData: null,
      chartRef: React.createRef(),
      offCanvasShow: false,
      selectedChartElementIndex: null,
    };

    this.setChartCountries = this.setChartCountries.bind(this);
    this.onChartClick = this.onChartClick.bind(this);
  }

  componentDidMount() {

    eventBus.on(eventBus.DOWNLOAD_CHART_IMAGE, (data) =>
      {
        if (data.carrouselItemIndex != this.props.carrouselIndex){
          return;
        }

        saveCanvas(this.state.uuid, "Profile-geo-map-chart.png", saveAs);
      }
    );

    // fetch('https://unpkg.com/world-atlas/countries-50m.json').then((r) => r.json()).then((data) => {
    //   this.setState({chartCountries: ChartGeo.topojson.feature(data, data.objects.countries).features});
    // });

    this.setChartCountries();

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.setChartCountries();
    }

  }

  setChartCountries(){

    if (!this.props.objects){
      this.setState({chartCountries: null});
      return;
    }

    var data = appParams.GEO_MAP_DATA;
    var chartCountries = ChartGeo.topojson.feature(data, data.objects.countries).features;

    // initializing locationData
    var locationsData = {};
    for (var object of chartCountries){
      locationsData[object.properties.name] = [];
    }

    // if no objects have been passed as parameter
    if (!this.props.objects){
      this.setState({locationsData: locationsData, chartCountries: chartCountries});
      return;
    }

    // processing all the passed profiles' locations
    var locations = {};
    for (var profile of this.props.objects){

      var location = profile.location ? profile.location : "", 
          domain = "experience", 
          locationIndex = 0;

      while (true) {

        if (location){

          location = dbDataSanitizer.preSanitize(location);

          if (location.indexOf(",") != -1){
            location = location.split(",");
            location = dbDataSanitizer.preSanitize(location[location.length - 1]);
          }
          location = location.replace("Republic of the ", "")
                             .replace("Republic of ", "")
                             .replace("Republic", "") 
                             .replace("République", ""); 

          switch(location.toLowerCase()){
            case "états-unis":{
              location += " d'Amérique";
              break;
            }
          }

          for (var countryObject of countriesNaming){
            if (countryObject.frenchShortName.toLowerCase().indexOf(location.toLowerCase()) != -1){
              location = countryObject.englishShortName.replace(" (the)", "");
              break;
            }
          }

          // var idx = countriesNaming.map(e => e.frenchShortName.slice(0, e.frenchShortName.indexOf(" (")).toLowerCase()).indexOf(location.toLowerCase());
          // if (idx != -1){
          //   location = countriesNaming[idx].englishShortName.replace(" (the)", "");
          // }

          var keys = Object.keys(locations);
          var index = keys.indexOf(location);

          // console.log("eeeeeeeeeeeeeeeeeeeee 3 :", location, index);

          if (index == -1){
            locations[location] = [profile];
          }
          else{
            if (locations[location].map(e => e.url).indexOf(profile.url) == -1){
              locations[location].push(profile);
            }
          }

        }

        if (domain == "experience"){

          if (!profile.experience || locationIndex == profile.experience.length){
            domain = "education";
            locationIndex = 0;
            location = null;
            continue;
          }

          location = (profile.experience[locationIndex]).location ? (profile.experience[locationIndex]).location : "";
        }
        else if (domain == "education"){

          if (!profile.education || locationIndex == profile.education.length){
            break;
          }

          location = (profile.education[locationIndex]).location ? (profile.education[locationIndex]).location : "";

        }

        locationIndex += 1;

      }

    }

    // definitively set the value of the locationsData variable
    for (var object of chartCountries){
      var index = Object.keys(locations).indexOf(object.properties.name);
      if (index != -1){
        locationsData[object.properties.name] = locations[object.properties.name];
      }
    }

    this.setState({locationsData: locationsData, chartCountries: chartCountries});

  }

  onChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);
    console.log(elements, (elements[0]).index/*, this.state.chartCountries[elements[0]).index].properties.name, (this.state.locationsData[this.state.chartCountries[elements[0]).index].properties.name])*/);

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

        { !this.state.chartCountries && <div class="text-center">
                                              <div class="spinner-border text-secondary spinner-border-sm" role="status">
                                                <span class="visually-hidden">Loading...</span>
                                              </div>
                                            </div>}

      	{ this.state.chartCountries && <div><Chart id={"chartTag_"+this.state.uuid} ref={this.state.chartRef}
                  type="choropleth"
                  data={{
                    labels: this.state.chartCountries.map((d) => d.properties.name),
                    datasets: [{
                      label: 'Countries',
                      data: this.state.chartCountries.map((d) => ({feature: d, value: this.state.locationsData[d.properties.name].length/*Math.random()*/})),
                    }]
                  }}
                  options={{
                    showOutline: true,
                    showGraticule: true,
                    plugins: {
                      legend: {
                        display: false
                      },
                    },
                    scales: {
                      projection: {
                        axis: 'x',
                        projection: 'equalEarth'
                      }
                    },
                  }}
                  onClick={this.onChartClick}
                /> 
                { this.props.context == appParams.COMPONENT_CONTEXT_NAMES.PROFILE && <p class="shadow-sm mt-3 border p-2 rounded">
                                  { Object.keys(this.state.locationsData).map((key) => 
                                    (this.state.locationsData[key].length > 0 && <span class="mx-1 shadow badge bg-secondary-subtle border border-secondary-subtle text-secondary-emphasis rounded-pill">{key}</span>)
                                  )}
                                </p>}

                { this.props.displayLegend && this.props.displayLegend == true && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">Chart of visits mapped by country</p> }

                { this.props.context == appParams.COMPONENT_CONTEXT_NAMES.STATISTICS && <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
                                  <Offcanvas.Header closeButton>
                                    <Offcanvas.Title>
                                     { (this.state.selectedChartElementIndex != null) ? ("Location: " + this.state.chartCountries[this.state.selectedChartElementIndex].properties.name) : "Title" }
                                    </Offcanvas.Title>
                                  </Offcanvas.Header>
                                  <Offcanvas.Body>
                
                                    { this.state.selectedChartElementIndex == null && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                                          </div>
                                          <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                                        </div>
                                      </div>}
                
                                    { (this.state.selectedChartElementIndex != null && (this.state.locationsData[this.state.chartCountries[this.state.selectedChartElementIndex].properties.name]).length == 0) && <div class="text-center m-5 mt-2">
                                                    <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No corresponding profiles</span></p>
                                                  </div> }
                                            
                                    { (this.state.selectedChartElementIndex != null && (this.state.locationsData[this.state.chartCountries[this.state.selectedChartElementIndex].properties.name]).length != 0) && 
                                        <div class="list-group m-1 shadow-sm small">
                                          { (this.state.locationsData[this.state.chartCountries[this.state.selectedChartElementIndex].properties.name]).map((profile) => (<ProfileListItemView profile={profile}/>)) }
                                        </div>}

                                  </Offcanvas.Body>
                                </Offcanvas>}

              </div>}
      </>
    );
  }
}