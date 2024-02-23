/*import './StatisticsView.css'*/
import React from 'react'
import moment from 'moment';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import VisitsTimelineChart from "./widgets/charts/VisitsTimelineChart";
import VisitsKeywordsBarChart from "./widgets/charts/VisitsKeywordsBarChart";
import ProfileGeoMapChart from "./widgets/charts/ProfileGeoMapChart";
import StatIndicatorsView from "./widgets/StatIndicatorsView";
import BubbleProfileRelationMetricsChart from "./widgets/charts/BubbleProfileRelationMetricsChart";
import ExpEdStackBarChart from "./widgets/charts/ExpEdStackBarChart";
import RelationshipsChart from "./widgets/charts/RelationshipsChart";
import ConnectedScatterplot from "./widgets/charts/ConnectedScatterplot"; ConnectedScatterplot
import Carousel from 'react-bootstrap/Carousel';
import eventBus from "./EventBus";
import { MaximizeIcon, DownloadIcon } from "./widgets/SVGs";
import { Link } from 'react-router-dom';

import { 
  saveCurrentPageTitle, 
  sendDatabaseActionMessage,
  ack,
  startMessageListener,
  messageParams,
  dbData,
  appParams,
  getPeriodVisits,
} from "./Local_library";

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
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onViewChange = this.onViewChange.bind(this);
    this.onVisitsDataReceived = this.onVisitsDataReceived.bind(this);
    this.handleCarrouselSelect = this.handleCarrouselSelect.bind(this);
    this.downloadChart = this.downloadChart.bind(this);
    this.onChartExpansion = this.onChartExpansion.bind(this);
    this.setRelChartDisplayCrit = this.setRelChartDisplayCrit.bind(this);
  }

  componentDidMount() {

    // Starting the listener
    this.listenToMessages();

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.STATISTICS);

    getPeriodVisits(appParams.COMPONENT_CONTEXT_NAMES.STATISTICS, this.state.view, {moment: moment});
    
    // Requesting the last reset date
    if (!Object.hasOwn(this.props.globalData.settings, "lastDataResetDate")){
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, { context: appParams.COMPONENT_CONTEXT_NAMES.STATISTICS, criteria: { props: ["lastDataResetDate"] }});
    }

  }

  listenToMessages(){
    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.VISITS].join(messageParams.separator), 
        callback: this.onVisitsDataReceived
      },
    ]);
  }

  onVisitsDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var context = message.data.objectData.context; 
    if (context != appParams.COMPONENT_CONTEXT_NAMES.STATISTICS){
      return;
    }

    var visits = message.data.objectData.list, 
        profiles = [];

    for (var visit of visits){
      if (profiles.map(e => e.url).indexOf(visit.url) == -1){
        profiles.push(visit.profile);
      }
    }

    this.setState({ periodVisits: visits, periodProfiles: profiles });

  }

  onViewChange(index){

    this.setState({
      view: index, 
      periodVisits: null,
      periodProfiles: null,
    }, () => {
      getPeriodVisits(appParams.COMPONENT_CONTEXT_NAMES.STATISTICS, index, {moment: moment});
    });

  }

  downloadChart(){
    eventBus.dispatch(eventBus.DOWNLOAD_CHART_IMAGE, { carrouselItemIndex: this.state.carrouselActiveItemIndex });
  }

  handleCarrouselSelect = (selectedIndex) => {

    var controlsVisibility = (selectedIndex == 1) ? false : true;

    this.setState({
      carrouselActiveItemIndex: selectedIndex,
      controlsVisibility: controlsVisibility,
    });

  };

  onChartExpansion(){

    localStorage.setItem('carrouselActiveItemIndex', this.state.carrouselActiveItemIndex);
    localStorage.setItem('carrouselChartView', this.state.view);
    localStorage.setItem('relChartDisplayCrit', this.state.relChartDisplayCrit);

    window.open("/index.html?redirect_to=ChartExpansionView", '_blank');

  }

  setRelChartDisplayCrit(value){

    this.setState({relChartDisplayCrit: value});

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
                          <span title="Expand chart" onClick={this.onChartExpansion} class="handy-cursor mx-1 text-primary">
                            <MaximizeIcon size="16" className=""/>
                          </span>
                          <span onClick={this.downloadChart} title="Download chart" class="handy-cursor mx-1">
                            <DownloadIcon size="16" className=""/>
                          </span>
                        </span> }

            <div class="btn-group float-end">
              <button class="btn btn-primary btn-sm dropdown-toggle fst-italic badge" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                View
              </button>
              <ul class="dropdown-menu shadow">

                { ["days", "month", "year"].map((item, index) => (<li>
                                                                    <a class={"dropdown-item small " + (this.state.view == index ? "active" : "")} href="#" onClick={() => {this.onViewChange(index)}}>
                                                                      Last {item}
                                                                      { this.state.view == index && <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 float-end"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                                    </a>
                                                                  </li>)) }

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
              { this.state.carrouselActiveItemIndex == 0 && <VisitsTimelineChart 
                              objects={this.state.periodVisits} 
                              view={this.state.view} 
                              carrouselIndex={0} />}
            </Carousel.Item>
            <Carousel.Item>
              { this.state.carrouselActiveItemIndex == 1 && <StatIndicatorsView 
                              objects={this.state.periodVisits}
                              carrouselIndex={1} />}
            </Carousel.Item>
            <Carousel.Item>
              { this.state.carrouselActiveItemIndex == 2 && <VisitsKeywordsBarChart 
                              globalData={this.props.globalData} 
                              objects={this.state.periodVisits} 
                              carrouselIndex={2}/>}
            </Carousel.Item>
            <Carousel.Item>
              { this.state.carrouselActiveItemIndex == 3 && <BubbleProfileRelationMetricsChart 
                              objects={this.state.periodVisits} 
                              carrouselIndex={3} />}
            </Carousel.Item>
            <Carousel.Item>
              { this.state.carrouselActiveItemIndex == 4 && <ProfileGeoMapChart 
                              context={appParams.COMPONENT_CONTEXT_NAMES.STATISTICS}
                              globalData={this.props.globalData} 
                              objects={this.state.periodProfiles} 
                              carrouselIndex={4} />}
            </Carousel.Item>
            <Carousel.Item>
              { this.state.carrouselActiveItemIndex == 5 && <ExpEdStackBarChart 
                              objects={this.state.periodVisits} 
                              carrouselIndex={5} />}
            </Carousel.Item>
            <Carousel.Item> 
              { this.state.carrouselActiveItemIndex == 6 && 
                            <div>
                              <RelationshipsChart 
                                objects={this.state.periodProfiles} 
                                displayCriteria={ this.state.relChartDisplayCrit } 
                                profiles={this.state.periodProfiles}
                                carrouselIndex={6} />

                              <div class="dropdown my-2 offset-5">
                                <div data-bs-toggle="dropdown" aria-expanded="false" class="float-start py-0 handy-cursor">
                                  <span class="rounded shadow badge border text-primary border-link">{this.state.relChartDisplayCrit}</span>
                                </div>
                                <ul class="dropdown-menu shadow-lg border border-secondary">
                                  {["suggestions", "experience", "education", "languages", "certifications"].map((value) => (
                                        <li><Link class="dropdown-item small" onClick={() => {this.setRelChartDisplayCrit(value)}}>{value}</Link></li>  
                                    ))}
                                </ul>
                              </div>
                            </div>}
            </Carousel.Item>
            <Carousel.Item> 
              { this.state.carrouselActiveItemIndex == 7 && <ConnectedScatterplot 
                              objects={this.state.periodVisits} 
                              carrouselIndex={7} />}
            </Carousel.Item>
          </Carousel>

          <div class="clearfix">
            <span class="text-muted small float-end fst-italic mt-2 badge">
              Data recorded since {Object.hasOwn(this.props.globalData.settings, "lastDataResetDate") ? moment(this.props.globalData.settings.lastDataResetDate, moment.ISO_8601).format('MMMM Do YYYY, h:mm:ss a') : ""}
            </span>
          </div>
        </div>
      </>
    );
  }

}
