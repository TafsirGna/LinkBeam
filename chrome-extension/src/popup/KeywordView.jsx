import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import KeywordListView from "./widgets/KeywordListView";
import { 
  saveCurrentPageTitle, 
  sendDatabaseActionMessage,
  startMessageListener, 
  ack, messageParams,
  dbData,
  appParams
} from "./Local_library";
import eventBus from "./EventBus";

export default class KeywordView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      keyword: "",
      processingState:{
        status: "NO",
        info: ""
      },
      alertBadgeContent: "",
    };

    this.handleKeywordInputChange = this.handleKeywordInputChange.bind(this);
    this.addKeyword = this.addKeyword.bind(this);
    this.onPreDeletion = this.onPreDeletion.bind(this);
    this.checkInputKeyword = this.checkInputKeyword.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onKeywordsDataReceived = this.onKeywordsDataReceived.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.KEYWORDS);

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.KEYWORDS, null);

  }

  onKeywordsDataReceived(message, sendResponse){

    // acknowledge receipt
    // ack(sendResponse);

    // Displaying the alertBadge
    if (this.state.processingState.status == "YES"){
      switch(this.state.processingState.info){
        case "ADDING":{
          this.setState({alertBadgeContent: "Added !"});
          break
        }
        case "DELETING":{
          this.setState({alertBadgeContent: "Deleted !"});
          break
        }
      }
    }

    // Setting a timeout for the alertBadge to disappear
    setTimeout(() => {
      this.setState({alertBadgeContent: ""});
    }
    , appParams.TIMER_VALUE);

    // vanishing the spinner
    this.setState({processingState: {status: "NO", info: ""}});

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.KEYWORDS].join(messageParams.separator), 
        callback: this.onKeywordsDataReceived
      }
    ]);
    
  }

  // Function for initiating the insertion of a keyword
  addKeyword(){

    if (this.state.keyword == ""){
      return;
    }

    if (!this.checkInputKeyword()){
      console.log("Check of input returned false");
      return;
    }

    // Displaying the spinner and cleaning the keyword input
    this.setState({processingState: {status: "YES", info: "ADDING"}}, () => {
      sendDatabaseActionMessage(messageParams.requestHeaders.ADD_OBJECT, dbData.objectStoreNames.KEYWORDS, this.state.keyword);
      this.setState({keyword: ""});
    });

  }

  checkInputKeyword(){

    // Enforcing the limit constraint on the list length
    if (this.props.globalData.keywordList.length == appParams.keywordCountLimit){
      alert("You can not add more than " + appParams.keywordCountLimit + " keywords !");
      return false;
    }

    // Making sure that there's no duplicates
    for (let keyword of this.props.globalData.keywordList){
      
      if (keyword.name === this.state.keyword){
        alert("Duplicated keywords are not allowed !");
        return false;
      }

    }

    return true;
  }

  onPreDeletion(keyword){

    // Displaying the spinner
    this.setState({processingState: {status: "YES", info: "DELETING"}}, () => {
      eventBus.dispatch("deleteKeyword", {payload: keyword});
    });

  }

  handleKeywordInputChange(event) {
    this.setState({keyword: event.target.value});
  }

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>
          <div class="clearfix">
            <div class={"spinner-grow float-end spinner-grow-sm text-secondary " + (this.state.processingState.status == "YES" ? "" : "d-none")} role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div class={"float-end " + (this.state.alertBadgeContent == "" ? "d-none" : "")}>
              <span class="badge text-bg-success fst-italic shadow-sm">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {this.state.alertBadgeContent}
              </span>
            </div>
          </div>
          <div class="mt-3">
            <div class="input-group mb-3 shadow">
              <input type="text" class="form-control" placeholder="New keyword" aria-describedby="basic-addon2" value={this.state.keyword} onChange={this.handleKeywordInputChange}/>
              <span class="input-group-text handy-cursor" id="basic-addon2" onClick={this.addKeyword}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 text-muted"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </span>
            </div>
            
            {/* Keyword list view */}

            <KeywordListView objects={this.props.globalData.keywordList} onPreDeletion={this.onPreDeletion} />

          </div>
        </div>
      </>
    );
  }

}
