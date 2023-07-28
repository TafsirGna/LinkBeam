import React from 'react'
import HomeMenu from "./widgets/HomeMenu"

export default class Activity extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      searchList: null
    };
  }

  componentDidMount() {

    // setting the local variable with the global data
    this.setState({searchList: this.props.globalData.searchList})

    chrome.runtime.sendMessage({header: 'get-search-list', data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Search list request sent', response);
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.header == "search-list"){
        console.log("Message received : ", message);
        // sending a response
        sendResponse({
            status: "ACK"
        });
        // setting the new value
        this.setState({searchList: message.data});

        // setting the global variable with the local data
        this.props.globalData.searchList = message.data;
      }

    });

  }

  render(){

    return (
      <>
        <div class="clearfix">

          {/*setting icon*/}
          <HomeMenu switchOnDisplay={this.props.switchOnDisplay} />

        </div>
        <div>
          {this.state.searchList == null && <div class="text-center"><div class="mb-5"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                  </div>
                </div>}

          {this.state.searchList != null && this.state.searchList.length == 0 && <div class="text-center m-5 mt-2">
                      <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      <p><span class="badge text-bg-primary fst-italic shadow">No viewed profiles yet</span></p>
                    </div>}

          {this.state.searchList != null && this.state.searchList.length != 0 && <div class="list-group m-1 shadow">
            <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
              <img src="https://github.com/twbs.png" alt="twbs" width="32" height="32" class="rounded-circle flex-shrink-0"/>
              <div class="d-flex gap-2 w-100 justify-content-between">
                <div>
                  <h6 class="mb-0">List group item heading</h6>
                  <p class="mb-0 opacity-75">Some placeholder content in a paragraph.</p>
                </div>
                <small class="opacity-50 text-nowrap">now</small>
              </div>
            </a>
            <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
              <img src="https://github.com/twbs.png" alt="twbs" width="32" height="32" class="rounded-circle flex-shrink-0"/>
              <div class="d-flex gap-2 w-100 justify-content-between">
                <div>
                  <h6 class="mb-0">Another title here</h6>
                  <p class="mb-0 opacity-75">Some placeholder content in a paragraph that goes a little longer so it wraps to a new line.</p>
                </div>
                <small class="opacity-50 text-nowrap">3d</small>
              </div>
            </a>
          </div>}
        </div>
      </>
    )
  }
}

