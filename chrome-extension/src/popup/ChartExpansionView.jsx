/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  appParams,
} from "./Local_library";
import { Link } from 'react-router-dom';
import SearchesTimelineChart from "./widgets/charts/SearchesTimelineChart";
import ExpEdStackBarChart from "./widgets/charts/ExpEdStackBarChart";
import ProfileGeoMapChart from "./widgets/charts/ProfileGeoMapChart";
import BubbleProfileRelationMetricsChart from "./widgets/charts/BubbleProfileRelationMetricsChart";
import SearchesKeywordsBarChart from "./widgets/charts/SearchesKeywordsBarChart";
import RelationshipsChart from "./widgets/charts/RelationshipsChart";

export default class ChartExpansionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      periodSearches: null,
      carrouselActiveItemIndex: 0,
      carrouselChartView: 0,
    };
  }

  componentDidMount() {

    var periodSearches = localStorage.getItem('periodSearches'),
        carrouselActiveItemIndex = localStorage.getItem('carrouselActiveItemIndex'),
        carrouselChartView = localStorage.getItem('carrouselChartView');
    periodSearches = JSON.parse(periodSearches);

    this.setState({
      periodSearches: periodSearches,
      carrouselActiveItemIndex: parseInt(carrouselActiveItemIndex),
      carrouselChartView: parseInt(carrouselChartView),
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
                      <SearchesTimelineChart objects={this.state.periodSearches} view={this.state.carrouselChartView} carrouselIndex={this.state.carrouselActiveItemIndex} />}

              { this.state.carrouselActiveItemIndex == 2 && 
                      <SearchesKeywordsBarChart globalData={this.props.globalData} objects={this.state.periodSearches} carrouselIndex={this.state.carrouselActiveItemIndex}/>}

              { this.state.carrouselActiveItemIndex == 3 && 
                      <BubbleProfileRelationMetricsChart objects={this.state.periodSearches} carrouselIndex={this.state.carrouselActiveItemIndex} />}

              { this.state.carrouselActiveItemIndex == 4 && 
                      <ProfileGeoMapChart objects={this.state.periodSearches} carrouselIndex={this.state.carrouselActiveItemIndex} />}

              { this.state.carrouselActiveItemIndex == 5 && 
                      <ExpEdStackBarChart objects={this.state.periodSearches} carrouselIndex={this.state.carrouselActiveItemIndex} />}

              { this.state.carrouselActiveItemIndex == 6 && 
                      <RelationshipsChart objects={this.state.periodSearches.map((search) => search.profile)} carrouselIndex={this.state.carrouselActiveItemIndex} />}
    
            </div>
          </div>
        </div>
      </>
    );
  }
}
