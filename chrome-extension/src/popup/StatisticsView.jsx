/*import './StatisticsView.css'*/
import React from 'react'
import moment from 'moment';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import SearchesTimelineChart from "./widgets/charts/SearchesTimelineChart";
import ViewsKeywordsBarChart from "./widgets/charts/ViewsKeywordsBarChart";
import ProfileGeoMapChart from "./widgets/charts/ProfileGeoMapChart";
import StatIndicatorsView from "./widgets/StatIndicatorsView";
import BubbleProfileRelationMetricsChart from "./widgets/charts/BubbleProfileRelationMetricsChart";
import ExpEdStackBarChart from "./widgets/charts/ExpEdStackBarChart";

import { 
  saveCurrentPageTitle, 
  sendDatabaseActionMessage,
  ack,
  startMessageListener,
  messageParams,
  dbData,
  appParams,
} from "./Local_library";

export default class StatisticsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      periodSearches: [],
      view: 0,
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onViewChange = this.onViewChange.bind(this);
    this.onSearchesDataReceived = this.onSearchesDataReceived.bind(this);
  }

  componentDidMount() {

    // Starting the listener
    this.listenToMessages();

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.STATISTICS);

    this.getPeriodSearches(this.state.view);
    
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
    ]);
  }

  onSearchesDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var context = message.data.objectData.context; 
    if (context != appParams.COMPONENT_CONTEXT_NAMES.STATISTICS){
      return;
    }

    var searches = message.data.objectData.list

    this.setState({ periodSearches: searches });

  }

  getPeriodSearches(index){

    var startDate = null;
      switch(index){
        case 0: {
          startDate = moment().subtract(6, 'days').toDate();
          break;
        }

        case 1: {
          startDate = moment().subtract(30, 'days').toDate();
          break;
        }

        case 2: {
          startDate = moment().subtract(12, 'months').toDate();
          break;
        }
      }
      var props = { date: [startDate, "to", (new Date())] };
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.SEARCHES, { context: appParams.COMPONENT_CONTEXT_NAMES.STATISTICS, criteria: { props: props }});

  }

  onViewChange(index){

    this.setState({view: index}, () => {

      this.getPeriodSearches(index);

    })

  }

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.STATISTICS}/>

          {/*View dropdown*/}
          <div class="clearfix">
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

          <div id="carouselExample" class="carousel slide carousel-dark shadow rounded p-2 border mt-3">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <SearchesTimelineChart objects={this.state.periodSearches} view={this.state.view} />
              </div>
              {/*<div class="carousel-item">
                <ViewsKeywordsBarChart />
              </div>
              <div class="carousel-item">
                <StatIndicatorsView />
              </div>
              <div class="carousel-item">
                <ProfileGeoMapChart />
              </div>
              <div class="carousel-item">
                <BubbleProfileRelationMetricsChart />
              </div>
              <div class="carousel-item">
                <ExpEdStackBarChart />
              </div>*/}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </button>
          </div>

          <div class="clearfix">
            <span class="text-muted small float-end fst-italic mt-2 badge">Data recorded since {Object.hasOwn(this.props.globalData.settings, "lastDataResetDate") ? moment(this.props.globalData.settings.lastDataResetDate, moment.ISO_8601).format('MMMM Do YYYY, h:mm:ss a') : ""}</span>
          </div>
        </div>
      </>
    );
  }

}
