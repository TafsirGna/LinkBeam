import React from 'react'
import HomeMenu from "./widgets/HomeMenu"
import user_icon from '../assets/user_icon.png'
import moment from 'moment';

export default class Activity extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      searchList: null,
      searchListTags: null,
      lastBatchList: [],
      offset: 0,
      processingState: {
        status: "NO", 
        info: "",
      }
    };

    this.setListData = this.setListData.bind(this);
    this.requestNextSearchBatch = this.requestNextSearchBatch.bind(this);
    this.getSearchList = this.getSearchList.bind(this);

  }

  componentDidMount() {

    console.log("Mounting Activity page");

    // setting the local variable with the global data
    if (this.props.globalData.searchList){
      this.setListData(this.props.globalData.searchList);
    }

    this.getSearchList();

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.header == "search-list"){
        console.log("Activity Message received Search List: ", message);
        // sending a response
        sendResponse({
            status: "ACK"
        });

        // setting the new value
        this.setListData(message.data);

        // setting that the process stopped
        this.setState({
          processingState: {
            status: "NO",
            info: ""
          }
        });
      }

    });

  }

  getSearchList(){
    chrome.runtime.sendMessage({header: 'get-search-list', data: this.state.offset}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Search list request sent', response);
    });
  }

  requestNextSearchBatch(){
    this.setState({
      processingState: {
        status: "YES",
        info: "NEXT-BATCH"
      }
    });

    // requesting the next batch
    this.getSearchList()
  }

  setListData(listData){

    if (this.state.searchList == null){
      this.setState({searchList: []}, () => {
        this.setListData(listData);
      });
      return;
    }

    this.setState({lastBatchList: listData}, () => {

      listData = this.state.searchList.concat(listData);

      this.setState({
        searchList: listData,
        searchListTags: listData.map((search) => (<a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                                <img src={user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                                <div class="d-flex gap-2 w-100 justify-content-between">
                                  <div>
                                    <h6 class="mb-0">{search.fullName}</h6>
                                    <p class="mb-0 opacity-75">{search.title}</p>
                                    <p class="fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-info-subtle">{search.nFollowers} followers · {search.nConnections} connections</p>
                                  </div>
                                  <small class="opacity-50 text-nowrap">{moment(search.date, moment.ISO_8601).fromNow()}</small>
                                </div>
                              </a>)),
      }, () => {
        // Setting the new offset
        this.setState((prevState) => ({offset: prevState.offset + listData.length}));
      });

    });
  }

  render(){

    return (
      <>
        <div class="clearfix">
          {/*setting icon*/}
          <HomeMenu switchOnDisplay={this.props.switchOnDisplay} />
        </div>
        <div class="text-center">
          <div class="btn-group btn-group-sm mb-2 shadow-sm" role="group" aria-label="Small button group">
            <button type="button" class="btn btn-primary badge">
              All {(this.state.searchList && this.state.searchList.length != 0) ? "("+this.state.searchList.length+")" : null}
            </button>
            <button type="button" class="btn btn-secondary badge" title="See Bookmarks">Bookmarks</button>
          </div>
        </div>
        {this.state.searchList == null && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                    {/*<span class="visually-hidden">Loading...</span>*/}
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div>}

        {this.state.searchList != null && this.state.searchList.length == 0 && <div class="text-center m-5 mt-2">
                    <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p><span class="badge text-bg-primary fst-italic shadow">No viewed profiles yet</span></p>
                  </div>}

        {this.state.searchList != null && this.state.searchList.length != 0 && <div>
                <div class="list-group m-1 shadow-sm small">
                  {this.state.searchListTags}
                </div>
                <div class="text-center my-2 ">
                    <button class={"btn btn-light rounded-pill btn-sm fst-italic text-muted border badge shadow-sm " + (((this.state.processingState.status == "YES" && this.state.processingState.info ==  "NEXT-BATCH") || (this.state.processingState.status == "NO" && this.state.lastBatchList.length < this.props.globalData.appParams.searchPageLimit)) ? "d-none" : "")} onClick={this.requestNextSearchBatch} type="button">See more</button>
                    <div class={"spinner-border spinner-border-sm text-secondary " + ((this.state.processingState.status == "YES" && this.state.processingState.info ==  "NEXT-BATCH") ? "" : "d-none")} role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
              </div>}
      </>
    )
  }
}

