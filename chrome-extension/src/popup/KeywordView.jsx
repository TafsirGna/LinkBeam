import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import KeywordListView from "./widgets/KeywordListView";
import { 
  saveCurrentPageTitle, 
  appParams,
  setGlobalDataKeywords,
} from "./Local_library";
import eventBus from "./EventBus";
import { db } from "../db";

export default class KeywordView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      keyword: "",
      processing: false,
      alertBadgeContent: "",
    };

    this.handleKeywordInputChange = this.handleKeywordInputChange.bind(this);
    this.addKeyword = this.addKeyword.bind(this);
    this.deleteKeyword = this.deleteKeyword.bind(this);
    this.checkInputKeyword = this.checkInputKeyword.bind(this);
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.KEYWORDS);

    if (!this.props.globalData.keywordList){

      setGlobalDataKeywords(db, eventBus);

    }

  }

  // Function for initiating the insertion of a keyword
  addKeyword(){

    if (this.state.keyword == ""){
      return;
    }

    if (this.state.keyword.indexOf(" ") != -1){
      alert("The keyword should consist of only one word !");
      return;
    }

    if (!this.checkInputKeyword()){
      console.log("Check of input returned false");
      return;
    }

    // Displaying the spinner and cleaning the keyword input
    this.setState({processing: true}, () => {
      
      (async () => {

        await db.keywords.add({
                                name: this.state.keyword,
                                createdOn: (new Date()).toISOString(),
                              });

        this.setState({processing: false, keyword: "", alertBadgeContent: "Added !"}, () => {

          // Setting a timeout for the alertBadge to disappear
          setTimeout(() => {
            this.setState({alertBadgeContent: ""});
          }
          , appParams.TIMER_VALUE);

        });

        setGlobalDataKeywords(db, eventBus);

      }).bind(this)();

    });

  }

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.addKeyword();
    }
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

  deleteKeyword(keyword){

    this.setState({processing: true}, () => {

      (async () => {

        await db.keywords.delete(keyword.id);

        this.setState({processing: false, keyword: "", alertBadgeContent: "Deleted !"}, () => {

          // Setting a timeout for the alertBadge to disappear
          setTimeout(() => {
            this.setState({alertBadgeContent: ""});
          }
          , appParams.TIMER_VALUE);

        });

        var index = this.props.globalData.keywordList.map(e => e.id).indexOf(keyword.id);
        var keywords = this.props.globalData.keywordList;
        keywords.splice(index, 1);
        eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "keywordList", value: keywords});

      }).bind(this)();

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

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.KEYWORDS}/>

          <div class="clearfix">
            <div class={"spinner-grow float-end spinner-grow-sm text-secondary " + (this.state.processing ? "" : "d-none")} role="status">
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
              <input onKeyDown={this.handleKeyDown} type="text" class="form-control" placeholder="New keyword" aria-describedby="basic-addon2" value={this.state.keyword} onChange={this.handleKeywordInputChange}/>
              <span class="input-group-text handy-cursor" id="basic-addon2" onClick={this.addKeyword}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 text-muted"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </span>
            </div>
            
            {/* Keyword list view */}

            <KeywordListView 
              objects={this.props.globalData.keywordList} 
              deleteKeyword={this.deleteKeyword} />

          </div>
        </div>
      </>
    );
  }

}
