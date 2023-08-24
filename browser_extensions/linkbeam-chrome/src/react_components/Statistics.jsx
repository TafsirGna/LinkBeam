/*import './Statistics.css'*/
import React from 'react'
import moment from 'moment';
import BackToPrev from "./widgets/BackToPrev";
import ViewsTimelineChart from "./widgets/ViewsTimelineChart";
import ViewsKeywordsBarChart from "./widgets/ViewsKeywordsBarChart";
import ViewsGeoMapChart from "./widgets/ViewsGeoMapChart";
import { saveCurrentPageTitle, sendDatabaseActionMessage } from "./Local_library";

export default class Settings extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      lastDataResetDate: null,
      viewChoice: 0,
    };

    this.startMessageListener = this.startMessageListener.bind(this);
    this.onViewParamChoice = this.onViewParamChoice.bind(this);
  }

  componentDidMount() {

    // Setting the local data
    this.setState({lastDataResetDate: this.props.globalData.settings.lastDataResetDate});

    // Starting the listener
    this.startMessageListener();
    
    // Requesting the last reset date
    sendDatabaseActionMessage("get-object", "settings", ["lastDataResetDate"]);

    saveCurrentPageTitle("Statistics");
  }

  startMessageListener(){

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch(message.header){

        case "object-data":{

          switch(message.data.objectStoreName){
            case "settings":{

              switch(message.data.objectData.property){
                case "lastDataResetDate":{

                  console.log("Statistics Message received last reset date: ", message);
                  // sending a response
                  sendResponse({
                      status: "ACK"
                  });
                  this.setState({lastDataResetDate: message.data.objectData.value});

                  break;
                }
              }

              break;
            }
          }

          break;
        }
      }

    });
    
  }

  onViewParamChoice(index){
    this.setState({viewChoice: index});
  }

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle="Activity"/>

          {/*View dropdown*/}
          <div class="clearfix">
            <div class="btn-group float-end">
              <button class="btn btn-primary btn-sm dropdown-toggle fst-italic badge" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                View
              </button>
              <ul class="dropdown-menu shadow">

                { ["days", "month", "year"].map((item, index) => (<li>
                                                                    <a class={"dropdown-item small " + (this.state.viewChoice == index ? "active" : "")} href="#" onClick={() => {this.onViewParamChoice(index)}}>
                                                                      Last {item}
                                                                      { this.state.viewChoice == index && <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 float-end"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                                    </a>
                                                                  </li>)) }

              </ul>
            </div>
          </div>

          <div id="carouselExample" class="carousel slide carousel-dark shadow rounded p-2 border mt-3">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <ViewsTimelineChart viewChoice={this.state.viewChoice} />
              </div>
              <div class="carousel-item">
                <ViewsKeywordsBarChart viewChoice={this.state.viewChoice} />
              </div>
              <div class="carousel-item">
                <ViewsGeoMapChart viewChoice={this.state.viewChoice} />
              </div>
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
            <span class="text-muted small float-end fst-italic mt-2 badge">Data recorded since {moment(this.state.lastDataResetDate, moment.ISO_8601).format('MMMM Do YYYY, h:mm:ss a')}</span>
          </div>
        </div>
      </>
    );
  }

}
