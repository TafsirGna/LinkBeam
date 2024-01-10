/*import './StatisticsView.css'*/
import React from 'react'
import moment from 'moment';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import SearchesTimelineChart from "./widgets/charts/SearchesTimelineChart";
import SearchesKeywordsBarChart from "./widgets/charts/SearchesKeywordsBarChart";
import ProfileGeoMapChart from "./widgets/charts/ProfileGeoMapChart";
import StatIndicatorsView from "./widgets/StatIndicatorsView";
import BubbleProfileRelationMetricsChart from "./widgets/charts/BubbleProfileRelationMetricsChart";
import ExpEdStackBarChart from "./widgets/charts/ExpEdStackBarChart";
import RelationshipsChart from "./widgets/charts/RelationshipsChart";
import Carousel from 'react-bootstrap/Carousel';
import eventBus from "./EventBus";

import { 
  saveCurrentPageTitle, 
  sendDatabaseActionMessage,
  ack,
  startMessageListener,
  messageParams,
  dbData,
  appParams,
  getPeriodSearches,
} from "./Local_library";

export default class StatisticsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      periodSearches: null,
      view: 0,
      carrouselActiveItemIndex: 0,
      indicators: {
        profileCount: null,
        profileActivityCount: null,
        timeSpent: null,
        searchCount: null,
      },
      controlsVisibility: true,
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onViewChange = this.onViewChange.bind(this);
    this.onSearchesDataReceived = this.onSearchesDataReceived.bind(this);
    this.onProfilesDataReceived = this.onProfilesDataReceived.bind(this);
    this.onProfileActivityDataReceived = this.onProfileActivityDataReceived.bind(this);
    this.onTimeDataReceived = this.onTimeDataReceived.bind(this);
    this.handleCarrouselSelect = this.handleCarrouselSelect.bind(this);
    this.downloadChart = this.downloadChart.bind(this);
    this.onChartExpansion = this.onChartExpansion.bind(this);
  }

  componentDidMount() {

    // Starting the listener
    this.listenToMessages();

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.STATISTICS);

    getPeriodSearches(appParams.COMPONENT_CONTEXT_NAMES.STATISTICS, this.state.view, {moment: moment});
    
    // Requesting the last reset date
    if (!Object.hasOwn(this.props.globalData.settings, "lastDataResetDate")){
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, { context: appParams.COMPONENT_CONTEXT_NAMES.STATISTICS, criteria: { props: ["lastDataResetDate"] }});
    }

  }

  listenToMessages(){
    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.SEARCHES].join(messageParams.separator), 
        callback: this.onSearchesDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_COUNT, dbData.objectStoreNames.PROFILES].join(messageParams.separator), 
        callback: this.onProfilesDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_COUNT, dbData.objectStoreNames.SEARCHES].join(messageParams.separator), 
        callback: this.onSearchesDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_COUNT, dbData.objectStoreNames.PROFILE_ACTIVITY].join(messageParams.separator), 
        callback: this.onProfileActivityDataReceived
      },
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.SETTINGS].join(messageParams.separator), 
        callback: this.onTimeDataReceived
      }
    ]);
  }

  onSearchesDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var context = message.data.objectData.context; 
    if (context != appParams.COMPONENT_CONTEXT_NAMES.STATISTICS){
      return;
    }

    if (Object.hasOwn(message.data.objectData, "count")){
      var searchCount = message.data.objectData.count;
      this.setState(prevState => {
        let indicators = Object.assign({}, prevState.indicators);
        indicators.searchCount = searchCount;
        return { indicators };
      }); 
      return;
    } 

    var searches = message.data.objectData.list
    this.setState({ periodSearches: searches });

  }

  onViewChange(index){

    this.setState({view: index}, () => {
      getPeriodSearches(appParams.COMPONENT_CONTEXT_NAMES.STATISTICS, index, {moment: moment});
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

    // Statistic indicators carrousel item
    switch(selectedIndex){
      case 1:{

        if (!this.state.indicators.profileCount){
          sendDatabaseActionMessage(messageParams.requestHeaders.GET_COUNT, dbData.objectStoreNames.PROFILES, { context: appParams.COMPONENT_CONTEXT_NAMES.STATISTICS });
        }

        if (!this.state.indicators.searchCount){
          sendDatabaseActionMessage(messageParams.requestHeaders.GET_COUNT, dbData.objectStoreNames.SEARCHES, { context: appParams.COMPONENT_CONTEXT_NAMES.STATISTICS });
        }

        if (!this.state.indicators.profileActivityCount){
          sendDatabaseActionMessage(messageParams.requestHeaders.GET_COUNT, dbData.objectStoreNames.PROFILE_ACTIVITY, { context: appParams.COMPONENT_CONTEXT_NAMES.STATISTICS });
        }

        if (!this.state.indicators.timeSpent){
          sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, { context: appParams.COMPONENT_CONTEXT_NAMES.STATISTICS, criteria: { props: ["timeCount"] } });
        }

        break;
      }
    }

  };

  onTimeDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var settings = message.data.objectData.object;

    if (Object.hasOwn(settings, "timeCount")){
      var timeCount = settings.timeCount;
      this.setState(prevState => {
        let indicators = Object.assign({}, prevState.indicators);
        indicators.timeSpent = timeCount.value;
        return { indicators };
      }); 
    } 

  }
    

  onProfilesDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    var profileCount = message.data.objectData.count;

    this.setState(prevState => {
      let indicators = Object.assign({}, prevState.indicators);
      indicators.profileCount = profileCount;
      return { indicators };
    }); 

  }

  onProfileActivityDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    var profileActivityCount = message.data.objectData.count;

    this.setState(prevState => {
      let indicators = Object.assign({}, prevState.indicators);
      indicators.profileActivityCount = profileActivityCount;
      return { indicators };
    }); 

  }

  onChartExpansion(){

    var periodSearches = JSON.stringify(this.state.periodSearches);
    localStorage.setItem('periodSearches', periodSearches);
    localStorage.setItem('carrouselActiveItemIndex', this.state.carrouselActiveItemIndex);
    localStorage.setItem('carrouselChartView', this.state.view);

    window.open("/index.html?redirect_to=ChartExpansionView", '_blank');

  }
  
  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.STATISTICS}/>

          {/*View dropdown*/}
          { this.state.controlsVisibility && <div class="clearfix">
                      <span class="border shadow-sm rounded p-1 text-muted">
                        <span title="Expand chart" onClick={this.onChartExpansion}>
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 handy-cursor mx-1 text-primary"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                        </span>
                        <span onClick={this.downloadChart} title="Download chart">
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 handy-cursor mx-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </span>
                        {/*<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 handy-cursor"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>*/}
                      </span>
          
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
                    </div>}

          <Carousel 
            className="shadow rounded p-2 mt-2"
            interval={null}
            data-bs-theme="dark"
            indicators={false}
            activeIndex={this.state.carrouselActiveItemIndex} onSelect={this.handleCarrouselSelect}>
            <Carousel.Item>
              <SearchesTimelineChart 
                objects={this.state.periodSearches} 
                view={this.state.view} 
                carrouselIndex={0} />
            </Carousel.Item>
            <Carousel.Item>
              <StatIndicatorsView 
                objects={this.state.periodSearches} 
                indicators={this.state.indicators} 
                carrouselIndex={1} />
            </Carousel.Item>
            <Carousel.Item>
              <SearchesKeywordsBarChart 
                globalData={this.props.globalData} 
                objects={this.state.periodSearches} 
                carrouselIndex={2}/>
            </Carousel.Item>
            <Carousel.Item>
              <BubbleProfileRelationMetricsChart 
                objects={this.state.periodSearches} 
                carrouselIndex={3} />
            </Carousel.Item>
            <Carousel.Item>
              <ProfileGeoMapChart 
                objects={this.state.periodSearches} 
                carrouselIndex={4} />
            </Carousel.Item>
            <Carousel.Item>
              <ExpEdStackBarChart 
                objects={this.state.periodSearches} 
                carrouselIndex={5} />
            </Carousel.Item>
            {/* Connection graph */}
            <Carousel.Item> 
              <RelationshipsChart 
                objects={this.state.periodSearches ? this.state.periodSearches.map((search) => search.profile) : null} 
                carrouselIndex={6} />
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
