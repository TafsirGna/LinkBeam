import React from 'react'
import BackToPrev from "./widgets/BackToPrev"
import { uid } from 'uid';


export default class Keywords extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      keyword: "",
      keywordList: null
    };

    this.handleKeywordInputChange = this.handleKeywordInputChange.bind(this);
    this.addKeyword = this.addKeyword.bind(this);
  }

  componentDidMount() {

    chrome.runtime.sendMessage({header: 'get-keyword-list', data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('received keyword list data', response);
      if (response.status == "SUCCESS"){
        this.setState({keywordList: response.data});
      }
    });

  }

  deleteKeyword(){
    confirm("Do you confirm the deletion of this keyword ?");
  }

  addKeyword(){
    if (this.state.keyword != ""){
      console.log("Adding keyword", this.state.keyword);

      chrome.runtime.sendMessage({header: 'add-keyword', data:[{uid: uid(), name: this.state.keyword}]}, (response) => {
        // Got an asynchronous response with the data from the service worker
        console.log('new keyword added', response);
        if (response.status == "SUCCESS"){
          // this.setState({keywordList: response.data});
        }
      });
    }
  }

  handleKeywordInputChange(event) {
    this.setState({keyword: event.target.value});
  }

  render(){

    return(
      <>

        <div class="p-3">
          <BackToPrev onClick={() => this.props.switchOnDisplay("Settings")}/>
          <div class="mt-3">
            <div class="input-group mb-3">
              <input type="text" class="form-control" placeholder="New keyword" aria-describedby="basic-addon2" value={this.state.keyword} onChange={this.handleKeywordInputChange}/>
              <span class="input-group-text handy-cursor" id="basic-addon2" onClick={this.addKeyword}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#0d6efd" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </span>
            </div>
            {this.state.keywordList == null && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                  </div>
                </div>}

            {this.state.keywordList != null && this.state.keywordList.length == 0 && <div class="text-center m-5 mt-4">
                      <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      <p><span class="badge text-bg-primary fst-italic shadow">No keywords yet</span></p>
                    </div>}

            {this.state.keywordList != null && this.state.keywordList.length != 0 && <ul class="list-unstyled mb-0 rounded shadow p-2">
                  <li><a class="dropdown-item d-flex align-items-center gap-2 py-2" href="#" onClick={this.deleteKeyword}>
                    <span class="d-inline-block bg-success rounded-circle p-1"></span>
                    Action
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="#dc3545" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  </a></li>
                  <li><a class="dropdown-item d-flex align-items-center gap-2 py-2" href="#">
                    <span class="d-inline-block bg-primary rounded-circle p-1"></span>
                    Another action
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="#dc3545" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  </a></li>
                </ul>}
          </div>
        </div>
      </>
    );
  }

}
