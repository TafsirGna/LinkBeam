import React from 'react'
/*import './Settings.css'*/
import BackToPrev from "./widgets/BackToPrev"

export default class Settings extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      keywordCount: 0,
    };
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
      if (message.header == "keyword-count"){
        console.log("Message received : ", message);
        // sending a response
        sendResponse({
            status: "ACK"
        });
        // setting the new value
        this.setState({keywordCount: message.data});
      }

    });
  }

  deleteAll(){
    const response = confirm("Do you confirm the erase of all your data ?");
    if (response){
      // Initiate data removal
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
                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" checked />
                    <label class="form-check-label" for="flexSwitchCheckChecked"></label>
                  </div>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Keywords <span class="badge text-bg-primary ms-1">{this.state.keywordCount}</span></strong>
                  <a href="#" class="text-primary badge" title="Add new keyword" onClick={() => this.props.switchOnDisplay("Keywords")}>Add</a>
                </div>
                {/*<span class="d-block">@username</span>*/}
              </div>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                <div class="d-flex justify-content-between">
                  <strong class="text-gray-dark">Erase all data</strong>
                  <a href="#" class="text-danger badge" onClick={this.deleteAll}>Delete</a>
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
