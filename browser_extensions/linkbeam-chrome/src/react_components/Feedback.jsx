/*import './About.css'*/
import React from 'react'
import BackToPrev from "./widgets/BackToPrev"
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { saveCurrentPageTitle, sendDatabaseActionMessage } from "./Local_library";

export default class Feedback extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      feedback: {
        title: null,
        text: null,
      },
      dataRequestDone: null,
    };

    this.onFeedbackTextInputChange = this.onFeedbackTextInputChange.bind(this);
    this.onFeedbackTitleInputChange = this.onFeedbackTitleInputChange.bind(this);
    this.sendFeedback = this.sendFeedback.bind(this);
  }

  componentDidMount() {

    this.startMessageListener();

    sendDatabaseActionMessage("get-object", "settings", ["feedback"]);

    saveCurrentPageTitle("Feedback");

  }

  startMessageListener(){

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch(message.header){

        case "object-data": {
          
          switch(message.data.objectStoreName){
            case "settings":{

              console.log("Settings Message received Settings data: ", message);
              // sending a response
              sendResponse({
                  status: "ACK"
              });

              // setting the new value
              switch(message.data.objectData.property){
                case "feedback": {
                  var feedback = message.data.objectData.value;

                  if (feedback == null || feedback == undefined){
                    this.setState({feedback: {title: "", text: ""}, dataRequestDone: "N/A"});
                    return;
                  }

                  this.setState({feedback: feedback, dataRequestDone: "AVAIL"});
                  break;
                }
     
              }

              break;
            }
          }

          break;
        }

      }
    });

  }

  sendFeedback(){

    if (this.state.feedback.title == "" || this.state.feedback.text == ""){
      return;
    }

    sendDatabaseActionMessage("update-object", "settings", {property: "feedback", value: this.state.feedback});

  }

  onFeedbackTextInputChange(event){

    this.setState(prevState => {
      let feedback = Object.assign({}, prevState.feedback);
      feedback.text = event.target.value;
      return { feedback };
    });   

  }

  onFeedbackTitleInputChange(event){

    this.setState(prevState => {
      let feedback = Object.assign({}, prevState.feedback);
      feedback.title = event.target.value;
      return { feedback };
    });   
    
  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle="About"/>
          <div class="">

            { this.state.dataRequestDone && this.state.dataRequestDone == "AVAIL" && <div class="small alert alert-success py-1 fst-italic mb-0 mt-3" role="alert">
                          Thank you for your feedback
                          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 float-end"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>}

            <div class="mb-2 mt-2">
              <label for="exampleFormControlInput1" class="form-label text-muted small fst-italic">Subject</label>
              <input type="email" class="form-control shadow-sm" id="exampleFormControlInput1" placeholder="" value={this.state.feedback.title} onChange={this.onFeedbackTitleInputChange} disabled={ this.state.dataRequestDone && this.state.dataRequestDone == "AVAIL" ? "disabled" : "" } />
            </div>
            <div class="mb-3">
              <label for="exampleFormControlTextarea1" class="form-label text-muted small fst-italic">Text</label>
              <textarea class="form-control shadow-sm" id="exampleFormControlTextarea1" rows="3" value={this.state.feedback.text} onChange={this.onFeedbackTextInputChange} disabled={ this.state.dataRequestDone && this.state.dataRequestDone == "AVAIL" ? "disabled" : "" }></textarea>
            </div>

            { this.state.dataRequestDone && this.state.dataRequestDone == "N/A" &&
                <div class="clearfix">
                  <button type="button" class="btn btn-primary btn-sm float-end shadow-sm" onClick={this.sendFeedback}>Send</button>
                </div>}
          </div>
        </div>
      </>
    );
  }
}