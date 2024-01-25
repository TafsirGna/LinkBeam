/*import './ProfileGeoMapChart.css'*/
import React from 'react'
import * as ChartGeo from "chartjs-chart-geo";
import { Chart, getElementAtEvent } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  Tooltip,
  Title,
  Legend
} from "chart.js";
import { 
  saveCanvas,
  messageParams, 
  dbData,
  dbDataSanitizer,
  sendDatabaseActionMessage,
  appParams,
} from "../../Local_library";
import moment from 'moment';
import default_user_icon from '../../../assets/user_icons/default.png';

import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';
import { Offcanvas } from "react-bootstrap";

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

export default class ProfileGeoMapChart extends React.Component{

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

    if (!Object.hasOwn(this.props.globalData.settings, "geoMapData")){
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, { context: this.props.context, criteria: { props: ["geoMapData"] }});
    }
    else{
      this.setChartCountries();
    }

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.setChartCountries();
    }

    if (prevProps.globalData != this.props.globalData){
      this.setChartCountries();
    }

  }

  setChartCountries(){

    var data = this.props.globalData.settings.geoMapData;
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

      if (!profile.location){
        continue;
      }
      var location = profile.location.split(",");
      location = dbDataSanitizer.preSanitize(location[location.length - 1]);
      location = location.replace("Republic of the ", "")
                         .replace("Republic of ", ""); 

      var keys = Object.keys(locations);
      var index = keys.indexOf(location);
      if (index == -1){
        locations[location] = [profile];
      }
      else{
        locations[location].push(profile);
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
                                    (this.state.locationsData[key].length > 0 && <span class="shadow badge bg-secondary-subtle border border-secondary-subtle text-secondary-emphasis rounded-pill">{key}</span>)
                                  )}
                                </p>}

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
                                          { (this.state.locationsData[this.state.chartCountries[this.state.selectedChartElementIndex].properties.name]).map((profile) => (<a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                                                            <img src={profile.avatar ? profile.avatar : default_user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                                                            <div class="d-flex gap-2 w-100 justify-content-between">
                                                              <div>
                                                                <div class="d-flex gap-2 align-items-center">
                                                                  <h6 class="mb-0 d-flex align-items-center gap-1">
                                                                    <a class="text-decoration-none text-black" href={"/index.html?redirect_to=ProfileView&data=" + profile.url} target="_blank">{profile.fullName}</a> 
                                                                  </h6>
                                                                  
                                                                  <small class="opacity-50 text-nowrap ms-auto">{moment(profile.date, moment.ISO_8601).format("L")}</small>
                                                                </div>
                                                                <p class="mb-0 opacity-75 small">{profile.title}</p>
                                                                <p class="shadow-sm fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-warning">{profile.nFollowers} · {profile.nConnections}</p>
                                                              </div>
                                                            </div>
                                                          </a>)) }
                                        </div>}

                                  </Offcanvas.Body>
                                </Offcanvas>}

              </div>}
      </>
    );
  }
}