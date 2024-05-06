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

/*import './StatisticsView.css'*/
import React from 'react'
import { DateTime as LuxonDateTime } from "luxon";
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import VisitsTimelineChart from "./widgets/charts/VisitsTimelineChart";
import VisitsKeywordsBarChart from "./widgets/charts/VisitsKeywordsBarChart";
import ProfilesGeoMapChart from "./widgets/charts/ProfilesGeoMapChart";
import StatIndicatorsView from "./widgets/StatIndicatorsView";
import ProfilesNetworkMetricsBubbleChart from "./widgets/charts/ProfilesNetworkMetricsBubbleChart";
import ExpEdStackBarChart from "./widgets/charts/ExpEdStackBarChart";
import ProfilesGraphChart from "./widgets/charts/ProfilesGraphChart";
import ProfileVisitsConnectedScatterPlot from "./widgets/charts/ProfileVisitsConnectedScatterPlot";
import Carousel from 'react-bootstrap/Carousel';
import eventBus from "./EventBus";
import { MaximizeIcon, DownloadIcon } from "./widgets/SVGs";
import { db } from "../db";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import { 
  saveCurrentPageTitle, 
  appParams,
  getPeriodVisits,
  setGlobalDataSettings,
  getProfileDataFrom,
} from "./Local_library";
import { liveQuery } from "dexie"; 

export default class StatisticsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      periodVisits: null,
      periodProfiles: null,
      view: 0,
      carrouselActiveItemIndex: 0,
      controlsVisibility: true,
      relChartDisplayCrit: "suggestions",
      offCanvasShow: false,
      offCanvasFormStartDate: (new Date()).toISOString().split("T")[0],
      offCanvasFormEndDate: (new Date()).toISOString().split("T")[0],
    };

    this.onViewChange = this.onViewChange.bind(this);
    this.handleCarrouselSelect = this.handleCarrouselSelect.bind(this);
    this.downloadChart = this.downloadChart.bind(this);
    this.onChartExpansion = this.onChartExpansion.bind(this);
    this.setRelChartDisplayCrit = this.setRelChartDisplayCrit.bind(this);
    this.setObjects = this.setObjects.bind(this);
    this.handleOffCanvasFormStartDateInputChange = this.handleOffCanvasFormStartDateInputChange.bind(this);
    this.handleOffCanvasFormEndDateInputChange = this.handleOffCanvasFormEndDateInputChange.bind(this);
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.STATISTICS);

    this.setObjects(); 
    
    // Requesting the last reset date
    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

  }

  handleOffCanvasClose = () => {this.setState({offCanvasShow: false, offCanvasFormSelectValue: "1"})};
  handleOffCanvasShow = () => {this.setState({offCanvasShow: true})};

  onViewChange(index){

    this.setState({
      view: index, 
      periodVisits: null,
      periodProfiles: null,
    }, () => {

      if (index == 3){
        this.handleOffCanvasShow();
      }
      else{
        this.setObjects();
      }

    });

  }

  async setObjects(){

    if (this.state.offCanvasShow){
      this.handleOffCanvasClose();
    }

    var periodValue = this.state.view;
    if (this.state.view == 3){
      periodValue = {
        start: this.state.offCanvasFormStartDate,
        end: this.state.offCanvasFormEndDate,      
      };
    }
      
    var visits = await getPeriodVisits(periodValue, LuxonDateTime, db, "profiles");
    
    var profiles = [];
    for (var visit of visits){
      if (profiles.map(e => e.url).indexOf(visit.url) == -1){

        var profile = null;
        
        try{

          profile = await getProfileDataFrom(db, visit.url);
          profile.url = visit.url;
          profile.date = profileVisits[0].date;

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

  }

  downloadChart(){
    eventBus.dispatch(eventBus.DOWNLOAD_CHART_IMAGE, { carrouselItemIndex: this.state.carrouselActiveItemIndex });
  }

  handleCarrouselSelect = (selectedIndex) => {

    var controlsVisibility = (selectedIndex != 1);

    this.setState({
      carrouselActiveItemIndex: selectedIndex,
      controlsVisibility: controlsVisibility,
    });

  };

  onChartExpansion(){

    /*localStorage*/sessionStorage.setItem('carrouselActiveItemIndex', this.state.carrouselActiveItemIndex);
    /*localStorage*/sessionStorage.setItem('carrouselChartView', this.state.view);
    /*localStorage*/sessionStorage.setItem('relChartDisplayCrit', this.state.relChartDisplayCrit);
    sessionStorage.setItem('offCanvasFormStartDate', this.state.offCanvasFormStartDate);
    sessionStorage.setItem('offCanvasFormEndDate', this.state.offCanvasFormEndDate);

    window.open("/index.html?view=ChartExpansion", '_blank');

  }

  setRelChartDisplayCrit(value){

    this.setState({relChartDisplayCrit: value});

  }

  handleOffCanvasFormStartDateInputChange(event) {

    this.setState({offCanvasFormStartDate: event.target.value}); 

  }

  handleOffCanvasFormEndDateInputChange(event) {

    this.setState({offCanvasFormEndDate: event.target.value}, () => {
      if (new Date(this.state.offCanvasFormEndDate) < new Date(this.state.offCanvasFormStartDate)){
        this.setState({offCanvasFormStartDate: this.state.offCanvasFormEndDate});
      }
    }); 

  }
  
  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.STATISTICS}/>

          {/*View dropdown*/}
          <div class="clearfix">
            { this.state.controlsVisibility && <span class="border shadow-sm rounded p-1 text-muted">
                          <span 
                            title="Expand chart" 
                            onClick={this.onChartExpansion} 
                            class="handy-cursor mx-1 text-primary">
                            <MaximizeIcon size="16" className=""/>
                          </span>
                          <span 
                            onClick={this.downloadChart} 
                            title="Download chart" 
                            class="handy-cursor mx-1">
                            <DownloadIcon size="16" className=""/>
                          </span>
                        </span> }

            <div class="btn-group float-end">
              <button 
                class="btn btn-primary btn-sm dropdown-toggle fst-italic badge" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false">
                View
              </button>
              <ul class="dropdown-menu shadow">

                { ["days", "month", "year"].map((item, index) => (<li>
                                                                    <a 
                                                                      class={`dropdown-item small ${this.state.view == index ? "active" : ""}`} 
                                                                      href="#" 
                                                                      onClick={() => {this.onViewChange(index)}}>
                                                                      Last {item}
                                                                      { this.state.view == index 
                                                                          && <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 float-end"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                                    </a>
                                                                  </li>)) }

                <li>
                  <a 
                    class={`dropdown-item small ${this.state.view == 3 ? "active" : ""}`}
                    onClick={() => {this.onViewChange(3)}}
                    href="#"
                    title={this.state.view == 3 ? `${LuxonDateTime.fromISO(this.state.offCanvasFormStartDate).toFormat('MMMM dd, yyyy')} - ${LuxonDateTime.fromISO(this.state.offCanvasFormEndDate).toFormat('MMMM dd, yyyy')}` : null}>
                    Specific dates
                    {this.state.view == 3 && <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 float-end"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </a>
                </li>
                <li>
                  <a 
                    class="dropdown-item small" 
                    href="/index.html?view=Calendar&dataType=ProfileVisits" 
                    target="_blank">
                    Show calendar
                  </a>
                </li>

              </ul>
            </div>
          </div>

          <Carousel 
            className="shadow rounded p-2 mt-2"
            interval={null}
            data-bs-theme="dark"
            indicators={false}
            activeIndex={this.state.carrouselActiveItemIndex} onSelect={this.handleCarrouselSelect}>
            <Carousel.Item>
              { this.state.carrouselActiveItemIndex == 0 
                  && <VisitsTimelineChart 
                              objects={this.state.periodVisits} 
                              view={this.state.view} 
                              periodRangeLimits={{
                                start: this.state.offCanvasFormStartDate,
                                end: this.state.offCanvasFormEndDate,
                              }}
                              carrouselIndex={0} />}
            </Carousel.Item>
            <Carousel.Item>
              { this.state.carrouselActiveItemIndex == 1 
                  && <StatIndicatorsView 
                              objects={this.state.periodVisits}
                              carrouselIndex={1} />}
            </Carousel.Item>
            <Carousel.Item>
              { this.state.carrouselActiveItemIndex == 2 
                  && <VisitsKeywordsBarChart 
                              globalData={this.props.globalData} 
                              objects={this.state.periodProfiles} 
                              carrouselIndex={2}/>}
            </Carousel.Item>
            <Carousel.Item>
              { this.state.carrouselActiveItemIndex == 3 
                  && <ProfilesNetworkMetricsBubbleChart 
                              objects={this.state.periodVisits} 
                              profiles={this.state.periodProfiles}
                              carrouselIndex={3} />}
            </Carousel.Item>
            <Carousel.Item>
              { this.state.carrouselActiveItemIndex == 4 
                  && <ProfilesGeoMapChart 
                              context={appParams.COMPONENT_CONTEXT_NAMES.STATISTICS}
                              objects={this.state.periodProfiles} 
                              carrouselIndex={4} />}
            </Carousel.Item>
            <Carousel.Item>
              { this.state.carrouselActiveItemIndex == 5 
                  && <ExpEdStackBarChart 
                              objects={this.state.periodProfiles} 
                              carrouselIndex={5} />}
            </Carousel.Item>
            <Carousel.Item> 
              { this.state.carrouselActiveItemIndex == 6 
                  && <div>
                              <ProfilesGraphChart 
                                objects={this.state.periodProfiles} 
                                displayCriteria={ this.state.relChartDisplayCrit } 
                                profiles={this.state.periodProfiles}
                                carrouselIndex={6} />

                              { this.state.periodProfiles 
                                  && this.state.periodProfiles.length != 0 
                                  && <div class="dropdown my-2 offset-5">
                                        <div 
                                          data-bs-toggle="dropdown" 
                                          aria-expanded="false" 
                                          class="float-start py-0 handy-cursor">
                                          <span 
                                            class="rounded shadow badge border text-primary border-link">
                                            {this.state.relChartDisplayCrit}
                                          </span>
                                        </div>
                                        <ul class="dropdown-menu shadow-lg border border-secondary">
                                          {["suggestions", "experience", "education", "languages", "certifications"].map((value) => (
                                                <li>
                                                  <a 
                                                    class="dropdown-item small" 
                                                    onClick={() => {this.setRelChartDisplayCrit(value)}}>
                                                    {value}
                                                  </a>
                                                </li>  
                                            ))}
                                        </ul>
                                      </div>}
                            </div>}
            </Carousel.Item>
            <Carousel.Item> 
              { this.state.carrouselActiveItemIndex == 7 
                  && <ProfileVisitsConnectedScatterPlot 
                        objects={this.state.periodVisits} 
                        profiles={this.state.periodProfiles}
                        carrouselIndex={7} />}
            </Carousel.Item>
          </Carousel>

          <div class="clearfix">
            <span class="text-muted small float-end fst-italic mt-2 badge">
              {"Data recorded since "}
              {this.props.globalData.settings 
                ? LuxonDateTime.fromISO(this.props.globalData.settings.lastDataResetDate).toFormat('MMMM dd yyyy, hh:mm a') 
                : ""}
            </span>
          </div>
        </div>

        <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Specific dates</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>

            <Form noValidate validated={this.state.offCanvasFormValidated} id="offcanvas_form" className="small text-muted">
              <Form.Group className="my-3" controlId="reminderForm.scheduledForControlInput1">
                <Form.Label>Starting</Form.Label>
                <Form.Control
                  type="date"
                  autoFocus
                  max={(new Date(this.state.offCanvasFormEndDate)).toISOString().split("T")[0]}
                  min={this.props.globalData.settings ? this.props.globalData.settings.lastDataResetDate.split("T")[0] : this.state.offCanvasFormStartDate}
                  value={this.state.offCanvasFormStartDate}
                  onChange={this.handleOffCanvasFormStartDateInputChange}
                  className=""
                  required
                  size="sm"
                />
                <Form.Control.Feedback type="invalid">
                  Please choose a valid date.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="reminderForm.scheduledForControlInput2">
                <Form.Label>Ending</Form.Label>
                <Form.Control
                  type="date"
                  autoFocus
                  max={new Date().toISOString().slice(0, 10)}
                  min={(new Date(this.state.offCanvasFormStartDate)).toISOString().split("T")[0]}
                  value={this.state.offCanvasFormEndDate}
                  onChange={this.handleOffCanvasFormEndDateInputChange}
                  className=""
                  required
                  size="sm"
                />
                <Form.Control.Feedback type="invalid">
                  Please choose a valid date.
                </Form.Control.Feedback>
              </Form.Group>
            </Form>

            <div class="d-flex">
              <button type="button" class="shadow btn btn-primary btn-sm ms-auto" onClick={this.setObjects}>Apply</button>
            </div>

          </Offcanvas.Body>
        </Offcanvas>
      </>
    );
  }

}
