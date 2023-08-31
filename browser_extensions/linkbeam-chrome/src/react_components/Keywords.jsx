import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import KeywordListView from "./widgets/KeywordListView";
// import { uid } from 'uid';
import { 
  saveCurrentPageTitle, 
  sendDatabaseActionMessage,
  startMessageListener, 
  ack, messageParams,
  dbData,
  appParams
} from "./Local_library";


export default class Keywords extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      keyword: "",
      keywordList: null,
      processingState:{
        status: "NO",
        info: ""
      },
      alertBadgeContent: "",
      keywordCountLimit: 0,
    };

    this.handleKeywordInputChange = this.handleKeywordInputChange.bind(this);
    this.addKeyword = this.addKeyword.bind(this);
    this.deleteKeyword = this.deleteKeyword.bind(this);
    this.onKeywordsDataReceived = this.onKeywordsDataReceived.bind(this);
    this.checkInputKeyword = this.checkInputKeyword.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
  }

  componentDidMount() {

    // setting the keyword count limit
    this.setState({
      keywordCountLimit: appParams.keywordCountLimit
    }); 

    // setting the local variable with the global data
    if (this.props.globalData.keywordList){
      this.setState({keywordList: this.props.globalData.keywordList});
    }

    this.listenToMessages();

    saveCurrentPageTitle("Keywords");

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.KEYWORDS, null);

  }

  onKeywordsDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    // setting the new value
    var keywords = message.data.objectData;
    this.setState({keywordList: keywords});

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
    , 3000);

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

    /*case "add-keyword-error":{
      alert(message.data);
      break;
    }*/
    
  }

  // Function for initiating the deletion of a keyword
  deleteKeyword(keyword){
    const response = confirm("Do you confirm the deletion of the keyword ("+keyword.name+") ?");
    if (response){
      // Displaying the spinner
      this.setState({processingState: {status: "YES", info: "DELETING"}});

      if (response){
        sendDatabaseActionMessage(messageParams.requestHeaders.DEL_OBJECT, dbData.objectStoreNames.KEYWORDS, keyword.name);
      }
    }
  }

  // Function for initiating the insertion of a keyword
  addKeyword(){
    if (this.state.keyword != ""){

      if (this.checkInputKeyword() == false){
        console.log("exiting function ");
        return;
      }

      // Displaying the spinner
      this.setState({processingState: {status: "YES", info: "ADDING"}});

      console.log("Adding keyword", this.state.keyword);

      // cleaning the keyword input
      this.setState({keyword: ""});
      
      sendDatabaseActionMessage(messageParams.requestHeaders.ADD_OBJECT, dbData.objectStoreNames.KEYWORDS, this.state.keyword)
    }
  }

  checkInputKeyword(){

    // Enforcing the limit constraint on the list length
    if (this.state.keywordList.length == this.state.keywordCountLimit){
      alert("You can not add more than "+this.state.keywordCountLimit+" keywords !");
      return false;
    }

    // Making sure that there's no duplicates
    for (let i = 0; i < this.state.keywordList.length; i++){
      let keyword = this.state.keywordList[i];
      if (keyword.name === this.state.keyword){
        alert("Duplicated keywords are not allowed !");
        return false;
      }
    }

    console.log("returning true");
    return true;
  }

  handleKeywordInputChange(event) {
    this.setState({keyword: event.target.value});
  }

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle="Settings"/>
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
            <div class="input-group mb-3 shadow-sm">
              <input type="text" class="form-control" placeholder="New keyword" aria-describedby="basic-addon2" value={this.state.keyword} onChange={this.handleKeywordInputChange}/>
              <span class="input-group-text handy-cursor" id="basic-addon2" onClick={this.addKeyword}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#0d6efd" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </span>
            </div>
            
            {/* Keyword list view */}

            <KeywordListView objects={this.state.keywordList} onItemDeletion={this.deleteKeyword} />

          </div>
        </div>
      </>
    );
  }

}
