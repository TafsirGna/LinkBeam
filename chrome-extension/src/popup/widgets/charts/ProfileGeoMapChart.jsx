/*import './ProfileGeoMapChart.css'*/
import React from 'react'
import * as ChartGeo from "chartjs-chart-geo";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  Tooltip,
  Title,
  Legend
} from "chart.js";
import { 
  saveCanvas,
} from "../../Local_library";

import { v4 as uuidv4 } from 'uuid';
import eventBus from "../../EventBus";
import { saveAs } from 'file-saver';

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
      countries: null,
      uuid: uuidv4(),
    };
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

    fetch('https://unpkg.com/world-atlas/countries-50m.json').then((r) => r.json()).then((data) => {
      
      this.setState({countries: ChartGeo.topojson.feature(data, data.objects.countries).features});

    });

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.DOWNLOAD_CHART_IMAGE);

  }

  componentDidUpdate(){

  }

  render(){
    return (
      <>

        { !this.state.countries && <div class="text-center">
                                              <div class="spinner-border text-secondary spinner-border-sm" role="status">
                                                <span class="visually-hidden">Loading...</span>
                                              </div>
                                            </div>}

      	{ this.state.countries && <Chart id={"chartTag_"+this.state.uuid}
                  type="choropleth"
                  data={{
                    labels: this.state.countries.map((d) => d.properties.name),
                    datasets: [{
                      label: 'Countries',
                      data: this.state.countries.map((d) => ({feature: d, value: Math.random()})),
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
                />}
      </>
    );
  }
}