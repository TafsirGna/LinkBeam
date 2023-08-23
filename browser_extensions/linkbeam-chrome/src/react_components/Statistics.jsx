/*import './Statistics.css'*/
import React from 'react'
import moment from 'moment';
import BackToPrev from "./widgets/BackToPrev";
import ViewsTimelineChart from "./widgets/ViewsTimelineChart";
import ViewsKeywordsBarChart from "./widgets/ViewsKeywordsBarChart";
import { saveCurrentPageTitle, sendDatabaseActionMessage } from "./Local_library";

export default class Settings extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      lastDataResetDate: null,
    };

    this.startMessageListener = this.startMessageListener.bind(this);
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
                <li><a class="dropdown-item small" href="#">Last week</a></li>
                <li><a class="dropdown-item small" href="#">Last month</a></li>
                <li><a class="dropdown-item small" href="#">Last year</a></li>
              </ul>
            </div>
          </div>

          <div id="carouselExample" class="carousel slide carousel-dark shadow rounded p-2 border mt-3">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <ViewsTimelineChart />
              </div>
              <div class="carousel-item">
                <ViewsKeywordsBarChart />
              </div>
              <div class="carousel-item">
                <img src="..." class="d-block w-100" alt="..."/>
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
