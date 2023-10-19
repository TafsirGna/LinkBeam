/*import './About.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
/*import 'bootstrap/dist/css/bootstrap.min.css';*/
import { 
  saveCurrentPageTitle, 
  sendDatabaseActionMessage,
  ack,
  messageParams,
  startMessageListener,
  dbData,
  logInParseUser, 
  registerParseUser,
  appParams,
} from "./Local_library";
import { env } from "../../.env.js";
import Parse from 'parse/dist/parse.min.js';
import { genPassword } from "../.private_library";

// Parse initialization configuration goes here
Parse.initialize(env.PARSE_APPLICATION_ID, env.PARSE_JAVASCRIPT_KEY);
Parse.serverURL = appParams.PARSE_HOST_URL;

export default class Feedback extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      feedback: {
        title: null,
        text: null,
        createdAt: null, // new Date().toISOString(),
      },
      productID: null,
      dataRequestDone: null,
      sending: false,
    };

    this.onFeedbackTextInputChange = this.onFeedbackTextInputChange.bind(this);
    this.onFeedbackTitleInputChange = this.onFeedbackTitleInputChange.bind(this);
    this.onSendButtonClick = this.onSendButtonClick.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSettingsDataReceived = this.onSettingsDataReceived.bind(this);
    this.storeObjectInParse = this.storeObjectInParse.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();

    this.setState({productID: this.props.globalData.settings.productID});

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["feedback"/*, "productID"*/]);

    saveCurrentPageTitle("Feedback");

  }

  onSettingsDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

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

      /*case "productID": {
        var productID = message.data.objectData.value;

        this.setState({productID: productID});
        break;
      }*/

    }

  }

  listenToMessages(){

    startMessageListener([,
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.SETTINGS].join(messageParams.separator), 
        callback: this.onSettingsDataReceived
      },
    ]);

  }

  onSendButtonClick(){

    if (this.state.feedback.title == "" || this.state.feedback.text == "" || this.state.productID == null){
      console.log("Missing data for processing");
      return;
    }

    this.setState({sending: true});

    if (Parse.User.current() == null){

      // log in to the parse
      logInParseUser(
        Parse,
        this.state.productID,
        genPassword(this.state.productID),
        (parseUser) => {

          this.props.handleParseUserLoggedIn(parseUser);

          this.storeObjectInParse();

        },
        () => {

          // if (error 404)
          
          registerParseUser(
            Parse, 
            this.state.productID,
            genPassword(this.state.productID),
            (parseUser) => {

              this.props.handleParseUserLoggedIn(parseUser);

              this.storeObjectInParse();

            },
            () => {
              alert("An error ocurred when sending the feedback. Try again later!");
            },
          );
        }
      );

    }
    else{

      this.storeObjectInParse();

    }

  }

  storeObjectInParse = () => {

    (async () => {
      const myNewObject = new Parse.Object('UsageFeedback');
      myNewObject.set('createdBy', Parse.User.current());
      myNewObject.set('text', this.state.feedback.text);
      myNewObject.set('subject', this.state.feedback.title);
      try {
        const result = await myNewObject.save();
        // Access the Parse Object attributes using the .GET method
        console.log('UsageFeedback created', result);

        var feedbackObject = this.state.feedback;
        feedbackObject.createdAt = new Date().toISOString();
        sendDatabaseActionMessage(messageParams.requestHeaders.UPDATE_OBJECT, dbData.objectStoreNames.SETTINGS, {property: "feedback", value: feedbackObject});

        this.setState({sending: false});

      } catch (error) {
        console.error('Error while creating UsageFeedback: ', error);
      }
    })();

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
              <input type="email" class="form-control shadow border border-primary" id="exampleFormControlInput1" placeholder="" value={this.state.feedback.title} onChange={this.onFeedbackTitleInputChange} disabled={ this.state.dataRequestDone && this.state.dataRequestDone == "AVAIL" ? "disabled" : "" } />
            </div>
            <div class="mb-3">
              <label for="exampleFormControlTextarea1" class="form-label text-muted small fst-italic">Text</label>
              <textarea class="form-control shadow border border-primary" id="exampleFormControlTextarea1" rows="3" value={this.state.feedback.text} onChange={this.onFeedbackTextInputChange} disabled={ this.state.dataRequestDone && this.state.dataRequestDone == "AVAIL" ? "disabled" : "" }></textarea>
            </div>

            { this.state.dataRequestDone && this.state.dataRequestDone == "N/A" &&
                <div class="clearfix">
                  <button type="button" class="btn btn-primary btn-sm float-end shadow-sm" onClick={this.onSendButtonClick}>
                    { !this.state.sending && <span>Send</span>}
                    { this.state.sending && <div class="spinner-border spinner-border-sm" role="status">
                                              <span class="visually-hidden">Loading...</span>
                                            </div>}
                  </button>
                </div>}
          </div>
        </div>
      </>
    );
  }
}
