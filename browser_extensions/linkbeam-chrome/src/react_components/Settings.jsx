import React from 'react'
/*import './Settings.css'*/
import BackToPrev from "./widgets/BackToPrev"

export default class Settings extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      keywordCount: 0,
      processingState: {
        status: "NO",
        info: ""
      }
    };

    this.deleteAll = this.deleteAll.bind(this);
  }

  componentDidMount() {

    // setting the local variable with the global data
    if (this.props.globalData.keywordList){
      this.setState({keywordCount: this.props.globalData.keywordList.length});
    }

    chrome.runtime.sendMessage({header: 'get-keyword-count', data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Keyword count request sent', response);
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch(message.header){
        case "keyword-count": {
          console.log("Message received : ", message);
          // sending a response
          sendResponse({
              status: "ACK"
          });
          // setting the new value
          this.setState({keywordCount: message.data});
          break;
        }
        case "all-data-erased": {
          // sending a response
          sendResponse({
              status: "ACK"
          });

          // Displaying the validation sign
          this.setState({processingState: {status: "NO", info: "ERASING"}});

          // Updating the global data
          this.props.onGlobalDataUpdate("ALL", "");

          // updating local value
          this.setState({keywordCount: 0});

          // Setting a timer to reset all of this
          setTimeout(() => {
            this.setState({processingState: {status: "NO", info: ""}});
          }, 3000);

          break;
        }
      }

    });
  }

  deleteAll(){
    const response = confirm("Do you confirm the erase of all your data ?");
    if (response){
      // Displaying the spinner
      this.setState({processingState: {status: "YES", info: "ERASING"}});

      // Initiate data removal
      chrome.runtime.sendMessage({header: 'erase-all-data', data: null}, (response) => {
        // Got an asynchronous response with the data from the service worker
        console.log('Erase all data request sent', response);
      });
    }
  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev onClick={() => this.props.switchOnDisplay("Activity")}/>
          <div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Activate notifications</strong>
                  <div class="form-check form-switch">
                    <input class="form-check-input shadow" type="checkbox" role="switch" id="flexSwitchCheckChecked" checked />
                    <label class="form-check-label" for="flexSwitchCheckChecked"></label>
                  </div>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Keywords <span class="badge text-bg-primary ms-1 shadow">{this.state.keywordCount}</span></strong>
                  <a href="#" class="text-primary badge" title="Add new keyword" onClick={() => this.props.switchOnDisplay("Keywords")}>Add</a>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Erase all data</strong>
                  <a href="#" class={"text-danger badge " + (this.state.processingState.status == "NO" && this.state.processingState.info == ""  ? "" : "d-none")} onClick={this.deleteAll}>Delete</a>
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="#198754" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class={"css-i6dzq1 " + (this.state.processingState.status == "NO" && this.state.processingState.info != "" ? "" : "d-none")}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <div class={"spinner-border spinner-border-sm " + (this.state.processingState.status == "YES" ? "" : "d-none")} role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
          </div>
        </div>

      </>
    )
  }
}
