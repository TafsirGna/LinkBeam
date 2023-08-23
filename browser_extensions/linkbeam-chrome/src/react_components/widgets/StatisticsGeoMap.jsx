/*import './StatisticsGeoMap.css'*/
import React from 'react'
/*import { saveCurrentPageTitle } from "./Local_library";
import { Link } from 'react-router-dom';*/
import * as ChartGeo from "chartjs-chart-geo";
import {
  Chart as ChartJS,
  CategoryScale,
  Tooltip,
  Title,
  Legend
} from "chart.js";
import Map from "./geo-map";

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

export default class StatisticsGeoMap extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  render(){
    return (
      <>
      	<Map chosenKey="world" />
      </>
    );
  }
}