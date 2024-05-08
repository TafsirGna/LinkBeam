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

/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  appParams,
  getPeriodVisits,
  getProfileDataFrom,
} from "./Local_library";
import { DateTime as LuxonDateTime } from "luxon";
import VisitsTimelineChart from "./widgets/charts/VisitsTimelineChart";
import ExpEdStackBarChart from "./widgets/charts/ExpEdStackBarChart";
import ProfilesGeoMapChart from "./widgets/charts/ProfilesGeoMapChart";
import ProfilesNetworkMetricsBubbleChart from "./widgets/charts/ProfilesNetworkMetricsBubbleChart";
import VisitsKeywordsBarChart from "./widgets/charts/VisitsKeywordsBarChart";
import ProfilesGraphChart from "./widgets/charts/ProfilesGraphChart";
import ProfileVisitsConnectedScatterPlot from "./widgets/charts/ProfileVisitsConnectedScatterPlot";
import { db } from "../db";

export default class ChartExpansionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      periodVisits: null,
      carrouselActiveItemIndex: 0,
      carrouselChartView: 0,
      relChartDisplayCrit: "suggestions",
      offCanvasFormStartDate: null,
      offCanvasFormEndDate: null,
    };

  }

  componentDidMount() {

    var carrouselActiveItemIndex = parseInt(sessionStorage.getItem('carrouselActiveItemIndex')),
        carrouselChartView = parseInt(sessionStorage.getItem('carrouselChartView')),
        relChartDisplayCrit = sessionStorage.getItem('relChartDisplayCrit'),
        offCanvasFormStartDate = sessionStorage.getItem('offCanvasFormStartDate'),
        offCanvasFormEndDate = sessionStorage.getItem('offCanvasFormEndDate');

    (async () => {

      var periodValue = carrouselChartView;
      if (periodValue == 3){
        periodValue = {
          start: offCanvasFormStartDate,
          end: offCanvasFormEndDate,      
        };
      }

      var visits = await getPeriodVisits(periodValue, LuxonDateTime, db, "profiles"),
          profiles = [];

      for (var visit of visits){
        if (profiles.map(e => e.url).indexOf(visit.url) == -1){

          var profile = null;
          try{
            profile = await getProfileDataFrom(db, visit.url);
          }
          catch(error){
            console.error("Error : ", error);
          }

          if (profile){
            profiles.push(profile);
          }

        }
      }

      this.setState({ periodVisits: visits, periodProfiles: profiles });

    }).bind(this)();

    this.setState({
      carrouselActiveItemIndex: carrouselActiveItemIndex,
      carrouselChartView: carrouselChartView,
      relChartDisplayCrit: relChartDisplayCrit,
      offCanvasFormStartDate: offCanvasFormStartDate,
      offCanvasFormEndDate: offCanvasFormEndDate,
    });

  }

  render(){
    return (
      <>
        <div class="row">
          <div class="col-8 offset-2 mt-5 pb-5 ">

            <div class="text-center mb-5 mt-3">
              <img src={app_logo}  alt="" width="40" height="40"/>
              <p class="fw-bold mt-2">
                {appParams.appName}
                <span class="badge text-bg-primary ms-1 shadow">{appParams.appVersion}</span>
              </p>
            </div>

            <div class="rounded shadow-lg border p-5">
              { this.state.carrouselActiveItemIndex == 0 && 
                      <VisitsTimelineChart 
                        objects={this.state.periodVisits} 
                        view={this.state.carrouselChartView} 
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true}
                        periodRangeLimits={{
                          start: this.state.offCanvasFormStartDate,
                          end: this.state.offCanvasFormEndDate,
                        }} />}

              { this.state.carrouselActiveItemIndex == 2 && 
                      <VisitsKeywordsBarChart 
                        globalData={this.props.globalData} 
                        objects={this.state.periodProfiles}
                        view={this.state.carrouselChartView}  
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true} 
                        periodRangeLimits={{
                          start: this.state.offCanvasFormStartDate,
                          end: this.state.offCanvasFormEndDate,
                        }}/>}

              { this.state.carrouselActiveItemIndex == 3 && 
                      <ProfilesNetworkMetricsBubbleChart 
                        objects={this.state.periodVisits} 
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        profiles={this.state.periodProfiles}
                        displayLegend={true}
                        view={this.state.carrouselChartView}  
                        periodRangeLimits={{
                          start: this.state.offCanvasFormStartDate,
                          end: this.state.offCanvasFormEndDate,
                        }} />}

              { this.state.carrouselActiveItemIndex == 4 && 
                      <ProfilesGeoMapChart 
                        context={appParams.COMPONENT_CONTEXT_NAMES.STATISTICS}
                        objects={this.state.periodProfiles} 
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true}
                        view={this.state.carrouselChartView}  
                        periodRangeLimits={{
                          start: this.state.offCanvasFormStartDate,
                          end: this.state.offCanvasFormEndDate,
                        }} />}

              { this.state.carrouselActiveItemIndex == 5 && 
                      <ExpEdStackBarChart 
                        objects={this.state.periodProfiles} 
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true}
                        view={this.state.carrouselChartView}  
                        periodRangeLimits={{
                          start: this.state.offCanvasFormStartDate,
                          end: this.state.offCanvasFormEndDate,
                        }} />}

              { this.state.carrouselActiveItemIndex == 6 && 
                      <ProfilesGraphChart 
                        objects={this.state.periodProfiles} 
                        displayCriteria={this.state.relChartDisplayCrit} 
                        profiles={this.state.periodProfiles}
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true}
                        view={this.state.carrouselChartView}  
                        periodRangeLimits={{
                          start: this.state.offCanvasFormStartDate,
                          end: this.state.offCanvasFormEndDate,
                        }} />}

              { this.state.carrouselActiveItemIndex == 7 && 
                      <ProfileVisitsConnectedScatterPlot 
                        objects={this.state.periodVisits} 
                        profiles={this.state.periodProfiles}
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true} 
                        view={this.state.carrouselChartView}  
                        periodRangeLimits={{
                          start: this.state.offCanvasFormStartDate,
                          end: this.state.offCanvasFormEndDate,
                        }}/>}
    
            </div>
          </div>
        </div>
      </>
    );
  }
}
