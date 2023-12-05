/*import './ProfileViewReminderModal.css'*/
import React from 'react';
import { OverlayTrigger } from "react-bootstrap";
import { appParams } from "../Local_library";
import Collapse from 'react-bootstrap/Collapse';
import ProfileAboutSectionBubbleChart from './charts/ProfileAboutSectionBubbleChart';
import { dbDataSanitizer } from "../Local_library";


export default class ProfileAboutSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      collapseInfoOpen: false,
      uniqueWordsCount: null,
      oneUseWordCount: 0,
      profileAbout: "",
    };

    this.setOneUseWordCount = this.setOneUseWordCount.bind(this);
    // this.getChartData = this.getChartData.bind(this);
  }

  componentDidMount() {

    // setting profileAbout
    var profileAbout = dbDataSanitizer.profileAbout(this.props.profile.info);
    // console.log("****************** 1 : ", this.props.profile.info);
    // console.log("****************** 2 : ", profileAbout);

    this.setState({profileAbout: profileAbout}, () => {
      this.setOneUseWordCount();
    });

  }

  componentDidUpdate(prevProps, prevState){

  }

  characterCount(){

    return this.state.profileAbout.length;

  }

  averageWordLength(){

    var words = this.state.profileAbout.split(" "), 
        sum = 0;

    for (var word of words){
      sum += word.length;
    }

    return (sum / words.length).toFixed(2);

  }

  setOneUseWordCount(){

    if (!this.state.uniqueWordsCount){
     
      this.wordsFrequency(this.setOneUseWordCount);
      return;

    }

    var count = 0;
    for (var wordCount of this.state.uniqueWordsCount){
      if (wordCount.count == 1){
        count += 1;
      }
    }

    count /= this.state.profileAbout.split(" ").length;
    count = (count * 100).toFixed(2);
    this.setState({oneUseWordCount: count});

  }

  wordsFrequency(callback = null){

    if (this.state.uniqueWordsCount){
      return;
    }

    var words = this.state.profileAbout.split(" "),
        uniqueWordsCount = [];

    for (var word of words){
      var wordIndex = uniqueWordsCount.map(e => e.word).indexOf(word.toLowerCase());
      if (wordIndex >= 0){
        (uniqueWordsCount[wordIndex]).count += 1;
      }
      else{
        uniqueWordsCount.push({word: word.toLowerCase(), count: 1});
      }
    }

    this.setState({uniqueWordsCount: uniqueWordsCount}, () => {
      console.log("*************** : ", uniqueWordsCount);
      if (callback){
        callback();
      }
    });

  }

  wordCount(){

    return this.state.profileAbout.split(" ").length;

  }

  render(){
    return (
      <>
        { !this.props.profile.info && <div class="text-center m-5 mt-2">
                   <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                   <p class="mb-2"><span class="badge text-bg-warning fst-italic shadow text-muted">No "About" section available for this profile</span></p>
                 </div> } 

        { this.props.profile.info && <div class="m-4">

                                      <div class="row">
                                        <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1">
                                          <div class="card-body">
                                            <h5 class="card-title">{this.wordCount()}</h5>
                                            <p class="card-text">Word count</p>
                                          </div>
                                        </div>
                                        <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1">
                                          <div class="card-body">
                                            <h5 class="card-title">{this.characterCount()}</h5>
                                            <p class="card-text">Character count</p>
                                          </div>
                                        </div>
                                        <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1">
                                          <div class="card-body">
                                            <h5 class="card-title">{this.averageWordLength()}</h5>
                                            <p class="card-text">Average word length</p>
                                          </div>
                                        </div>
                                        <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1">
                                          <div class="card-body">
                                            <h5 class="card-title">{this.state.oneUseWordCount}%</h5>
                                            <p class="card-text">Unique words</p>
                                          </div>
                                        </div>
                                      </div>

                                      {this.state.uniqueWordsCount && <div class="border border-1 mb-3 mt-2 shadow rounded">
                                                                              <ProfileAboutSectionBubbleChart objectData={this.state.uniqueWordsCount} />
                                                                            </div>}

                                      <div>
                                        <div>
                                          
                                          { !this.state.collapseInfoOpen && <svg
                                                                                      onClick={() => {this.setState({collapseInfoOpen: !this.state.collapseInfoOpen})}}
                                                                                      aria-controls="collapseInfo"
                                                                                      aria-expanded={this.state.collapseInfoOpen} 
                                                                                      viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 ms-2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                                          
                                          { this.state.collapseInfoOpen && <svg 
                                                                                      onClick={() => {this.setState({collapseInfoOpen: !this.state.collapseInfoOpen})}}
                                                                                      aria-controls="collapseInfo"
                                                                                      aria-expanded={this.state.collapseInfoOpen} 
                                                                                      viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 ms-2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>}
                                        </div>
                                        <Collapse in={this.state.collapseInfoOpen}>
                                          <div id="collapseInfo">
                                            <div class="border fw-light border-1 text-muted rounded shadow p-3 small mt-2">
                                              {this.props.profile.info}
                                            </div>
                                          </div>
                                        </Collapse>
                                      </div>
                                     </div> } 
      </>
    );
  }
}