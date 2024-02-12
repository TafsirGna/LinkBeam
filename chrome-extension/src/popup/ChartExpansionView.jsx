/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import moment from 'moment';
import { 
  appParams,
  startMessageListener,
  dbData,
  messageParams,
  getPeriodSearches,
  ack,
} from "./Local_library";
import { Link } from 'react-router-dom';
import SearchesTimelineChart from "./widgets/charts/SearchesTimelineChart";
import ExpEdStackBarChart from "./widgets/charts/ExpEdStackBarChart";
import ProfileGeoMapChart from "./widgets/charts/ProfileGeoMapChart";
import BubbleProfileRelationMetricsChart from "./widgets/charts/BubbleProfileRelationMetricsChart";
import SearchesKeywordsBarChart from "./widgets/charts/SearchesKeywordsBarChart";
import RelationshipsChart from "./widgets/charts/RelationshipsChart";
import ConnectedScatterplot from "./widgets/charts/ConnectedScatterplot";

export default class ChartExpansionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      periodSearches: null,
      carrouselActiveItemIndex: 0,
      carrouselChartView: 0,
      relChartDisplayCrit: "suggestions",
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSearchesDataReceived = this.onSearchesDataReceived.bind(this);
  }

  componentDidMount() {

    // Starting the listener
    this.listenToMessages();

    var carrouselActiveItemIndex = localStorage.getItem('carrouselActiveItemIndex'),
        carrouselChartView = localStorage.getItem('carrouselChartView'),
        relChartDisplayCrit = localStorage.getItem('relChartDisplayCrit');

    getPeriodSearches(appParams.COMPONENT_CONTEXT_NAMES.STATISTICS, carrouselChartView, {moment: moment});

    this.setState({
      carrouselActiveItemIndex: parseInt(carrouselActiveItemIndex),
      carrouselChartView: parseInt(carrouselChartView),
      relChartDisplayCrit: relChartDisplayCrit,
    });

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

    var searches = message.data.objectData.list, 
        profiles = [];

    for (var search of searches){
      if (profiles.map(e => e.url).indexOf(search.url) == -1){
        profiles.push(search.profile);
      }
    }

    this.setState({ periodSearches: searches, periodProfiles: profiles });

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
                      <SearchesTimelineChart 
                        objects={this.state.periodSearches} 
                        view={this.state.carrouselChartView} 
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true} />}

              { this.state.carrouselActiveItemIndex == 2 && 
                      <SearchesKeywordsBarChart 
                        globalData={this.props.globalData} 
                        objects={this.state.periodSearches} 
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true} />}

              { this.state.carrouselActiveItemIndex == 3 && 
                      <BubbleProfileRelationMetricsChart 
                        objects={this.state.periodSearches} 
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true} />}

              { this.state.carrouselActiveItemIndex == 4 && 
                      <ProfileGeoMapChart 
                        context={appParams.COMPONENT_CONTEXT_NAMES.STATISTICS}
                        globalData={this.props.globalData} 
                        objects={this.state.periodProfiles} 
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true} />}

              { this.state.carrouselActiveItemIndex == 5 && 
                      <ExpEdStackBarChart 
                        objects={this.state.periodSearches} 
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true} />}

              { this.state.carrouselActiveItemIndex == 6 && 
                      <RelationshipsChart 
                        objects={this.state.periodProfiles} 
                        displayCriteria={this.state.relChartDisplayCrit} 
                        profiles={this.state.periodProfiles}
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true} />}

              { this.state.carrouselActiveItemIndex == 7 && 
                      <ConnectedScatterplot 
                        objects={this.state.periodSearches} 
                        carrouselIndex={this.state.carrouselActiveItemIndex}
                        displayLegend={true} />}
    
            </div>
          </div>
        </div>
      </>
    );
  }
}
