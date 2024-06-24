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
  getPeriodLabel,
} from "../../Local_library";
import { AlertCircleIcon } from "../SVGs";
import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';
import { Offcanvas } from "react-bootstrap";
import ProfileListItemView from "../ProfileListItemView";
import sorry_icon from '../../../assets/sorry_icon.png';
import { DateTime as LuxonDateTime } from "luxon";
import { OverlayTrigger, Popover } from "react-bootstrap";

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
    var locations = [];
    for (var profile of this.props.objects){

      var location = profile.location ? profile.location : "", 
          domain = "experience", 
          locationIndex = 0;

      while (true) {

        if (location){

          location = dbDataSanitizer.location(location);

          // if the term for the country is in french instead of english, then I look for the corresponding english term
          for (var countryObject of countriesNaming){

            if (countryObject.frenchShortName
                             .slice(0, countryObject.frenchShortName.indexOf(" ("))
                             .toLowerCase() == location.toLowerCase()){
              location = countryObject.englishShortName.indexOf(" (the") != -1 
                          ? countryObject.englishShortName.slice(0, countryObject.englishShortName.indexOf(" (the"))
                          : countryObject.englishShortName;
              break;
            }
          }

          const index = locations.map(i => i.label).indexOf(location);
          if (index == -1){
            locations.push({
              label: location,
              profiles: [profile],
            });
          }
          else{
            if (locations[index].profiles.map(e => e.url).indexOf(profile.url) == -1){
              locations[index].profiles.push(profile);
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
    const labels = locations.map(i => i.label);
    for (var object of chartCountries){
      const index = labels.indexOf(object.properties.name);
      if (index != -1){
        locationsData[object.properties.name] = locations[index].profiles;
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
                { this.props.context == appParams.COMPONENT_CONTEXT_NAMES.PROFILE 
                    && <p class="shadow-sm mt-3 border p-2 rounded">
                        { Object.keys(this.state.locationsData).map((key) => 
                          (this.state.locationsData[key].length > 0 
                            && <OverlayTrigger 
                                  trigger="click" 
                                  placement="left" 
                                  overlay={<Popover id="popover-basic">
                                            <Popover.Header as="h3">Details</Popover.Header>
                                            <Popover.Body>
                                              And here's some <strong>amazing</strong> content. It's very engaging.
                                              right?
                                            </Popover.Body>
                                          </Popover>}>
                                  <span 
                                    class="mx-1 shadow badge bg-secondary-subtle border border-secondary-subtle text-secondary-emphasis rounded-pill"
                                    title="Click to see details">
                                    {key}
                                    <AlertCircleIcon size="16" className="rounded-circle mx-1"/>
                                </span>
                              </OverlayTrigger>)
                        )}
                      </p>}

                { this.props.displayLegend 
                    && this.props.displayLegend == true 
                    && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">
                        Chart of visits mapped by country ({getPeriodLabel(this.props.view, this.props.periodRangeLimits, LuxonDateTime)})
                      </p> }

                { this.props.context == appParams.COMPONENT_CONTEXT_NAMES.STATISTICS && <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
                                  <Offcanvas.Header closeButton>
                                    <Offcanvas.Title>
                                     { (this.state.selectedChartElementIndex != null) ? ("Location: " + this.state.chartCountries[this.state.selectedChartElementIndex].properties.name) : "Title" }
                                    </Offcanvas.Title>
                                  </Offcanvas.Header>
                                  <Offcanvas.Body>
                
                                    { this.state.selectedChartElementIndex == null 
                                        && <div class="text-center">
                                              <div class="mb-5 mt-3">
                                                <div class="spinner-border text-primary" role="status"></div>
                                                <p>
                                                  <span class="badge text-bg-primary fst-italic shadow">
                                                    Loading...
                                                  </span>
                                                </p>
                                              </div>
                                            </div>}
                
                                    { this.state.selectedChartElementIndex != null 
                                        && <div>

                                          {(this.state.locationsData[this.state.chartCountries[this.state.selectedChartElementIndex].properties.name]).length == 0
                                              && <div class="text-center m-5 mt-2">
                                                <img 
                                                  src={sorry_icon} 
                                                  width="80" />
                                                <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No corresponding profiles</span></p>
                                              </div>}

                                          {(this.state.locationsData[this.state.chartCountries[this.state.selectedChartElementIndex].properties.name]).length != 0
                                              &&  <div class="list-group m-1 shadow-sm small">
                                                    { (this.state.locationsData[this.state.chartCountries[this.state.selectedChartElementIndex].properties.name]).map(profile => (<ProfileListItemView profile={profile}/>)) }
                                                  </div>}

                                        </div> }

                                  </Offcanvas.Body>
                                </Offcanvas>}

              </div>}
      </>
    );
  }
}