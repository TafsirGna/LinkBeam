/*import './ViewsGeoMapChart.css'*/
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

export default class ViewsGeoMapChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      countries: null,
    };
  }

  componentDidMount() {

    fetch('https://unpkg.com/world-atlas/countries-50m.json').then((r) => r.json()).then((data) => {
      
      // console.log("********************************************");
      this.setState({countries: ChartGeo.topojson.feature(data, data.objects.countries).features});

    });

  }

  componentDidUpdate(){

  }

  render(){
    return (
      <>
      	{ this.state.countries && <Chart
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
                    }
                  }}
                />}
      </>
    );
  }
}