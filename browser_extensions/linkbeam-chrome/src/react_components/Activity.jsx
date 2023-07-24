import React from 'react'

export default class Activity extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      searchList: null,
    };
  }

  componentDidMount() {

    // console.log("Activity component mounted")
    chrome.runtime.sendMessage({header: 'get-search-list', data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('received search list data', response);
      if (response.status == "SUCCESS"){
        this.setState({searchList: response.data});
      }
    });

  }

  render(){

    return (
      <>
        <div class="clearfix">

          {/*setting icon*/}
          <div class="dropdown float-end m-3 mt-2 bd-gray">
            <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="gray" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <ul class="dropdown-menu shadow-lg">
              <li><a class="dropdown-item small" href="#">Bookmarks</a></li>
              <li><a class="dropdown-item small" href="#" onClick={() => {this.props.switchOnDisplay("Statistics");}}>Statistics</a></li>
              <li><a class="dropdown-item small" href="#" onClick={() => {this.props.switchOnDisplay("Settings");}}>Settings</a></li>
              <li><a class="dropdown-item small" href="#" onClick={() => {this.props.switchOnDisplay("About");}} >About</a></li>
            </ul>
          </div>

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

