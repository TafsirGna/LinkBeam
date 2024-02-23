/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import import_icon from '../assets/import_icon.png';
import party_popper_icon from '../assets/party-popper_icon.png';
import new_icon from '../assets/new_icon.png';
import Alert from 'react-bootstrap/Alert';
import { 
  appParams, 
  messageParams,
  startMessageListener,
  sendDatabaseActionMessage,
  ack,
} from "./Local_library";

export default class About extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      alertMessage: "",
      alertTagShow: false,
      alertVariant: "warning",
      opDone: false,
      processing: false,
    };

    this.onNewInstanceSetUp = this.onNewInstanceSetUp.bind(this);
  }

  componentDidMount() {

    // Starting the message listener
    this.listenToMessages();

    // listening for an input change event
    const formFileElement = document.getElementById("formFile");
    formFileElement.onchange = (e => { 
    
      this.setState({processing: true}, () => {

        var file = e.target.files[0]; 

        // setting up the reader
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');

        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
          var content = readerEvent.target.result; // this is the content!

          try{
            content = JSON.parse(content);
          } catch (error) {

            this.setState({processing: false}, () => {

              var message = "Something wrong happent with the uploaded file. Check the file and try again! ";
              console.error(message+': ', error);
              
              this.setState({alertMessage: message, alertTagShow: true, alertVariant: "warning"}, () => {
                  setTimeout(() => {
                    this.setState({alertMessage: "", alertTagShow: false});
                  }, appParams.TIMER_VALUE);
              });

            });

            return;
          }

          // Sending the content for initializing the db
          // Send message to the background
          chrome.runtime.sendMessage({header: messageParams.requestHeaders.SW_CREATE_DB, data: content}, (response) => {
            // Got an asynchronous response with the data from the service worker
            console.log("Create db Request sent !");
          });

        }

      });

    }).bind(this);

  }

  onNewInstanceClicked(){

    // Send message to the background
    this.setState({processing: true}, () => {

      chrome.runtime.sendMessage({header: messageParams.requestHeaders.SW_CREATE_DB, data: null}, (response) => {
        // Got an asynchronous response with the data from the service worker
        console.log("Create db Request sent !");
      });

    });

  }

  onSwResponseReceived(message, sendResponse){
    // acknowledge receipt
    ack(sendResponse);

    this.setState({processing: false});

    switch(message.data.objectData){

      case messageParams.contentMetaData.SW_PROCESS_FAILED: {
        var message = "Failed to initialized the app. Try again later!";
        this.setState({alertMessage: message, alertTagShow: true, alertVariant: "danger"});
        break;
      }
      
    }
  }

  onNewInstanceSetUp(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);
    
    this.setState({opDone: true, processing: false});

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_DB_CREATED].join(messageParams.separator), 
        callback: this.onNewInstanceSetUp
      },
      {
        param: [messageParams.responseHeaders.SW_CS_MESSAGE_SENT, messageParams.contentMetaData.SW_PROCESS_FAILED].join(messageParams.separator), 
        callback: this.onSwResponseReceived
      },
    ]);
    
  }

  onImportDataClicked(){

    const formFileElement = document.getElementById("formFile");
    formFileElement.click();

  }

  render(){
    return (
      <>
        
        <div class="row">
          <div class="col-6 offset-3">
            <div class="text-center mt-5">
              <img src={app_logo} alt="twbs" width="40" height="40" class=""/>
              <h6 class="mt-3">{appParams.appName}</h6>
            </div>
            <h5 class="mt-4 text-center">Thank you for installing <b>{appParams.appName}</b>. Let's get you started</h5>

            { this.state.alertTagShow && <Alert className="my-3 small fst-italic" key={this.state.alertVariant} variant={this.state.alertVariant} dismissible>
                                            {this.state.alertMessage}
                                          </Alert>}

            { !this.state.opDone && !this.state.processing && <div class="mt-5 text-center row">
                          <div onClick={() => {this.onImportDataClicked()}} class="col shadow rounded mx-2 py-5 handy-cursor border border-secondary-subtle">
                            <img src={import_icon} alt="twbs" width="40" height="40" class=""/>
                            <p class="mt-3">Import data</p>
                          </div>
                          <div onClick={() => {this.onNewInstanceClicked()}} class="col shadow rounded mx-2 py-5 handy-cursor border border-secondary-subtle">
                            <img src={new_icon} alt="twbs" width="40" height="40" class=""/>
                            <p class="mt-3">New Instance</p>
                          </div>
                        </div>}

            { !this.state.opDone && this.state.processing && <div class="text-center mt-5"><div class="spinner-border text-primary" role="status">
                                                        <span class="visually-hidden">Loading...</span>
                                                      </div></div>}

            { this.state.opDone && <div class="mt-5 text-center row">
                          <div onClick={() => {this.onImportDataClicked()}} class="col shadow rounded mx-2 py-5 border border-secondary-subtle">
                            <img src={party_popper_icon} alt="twbs" width="40" height="40" class=""/>
                            <p class="mt-3">Your app is ready for use</p>
                          </div>
                        </div>}

          </div>

          <div class="mb-3 d-none">
            <label for="formFile" class="form-label">Default file input example</label>
            <input class="form-control" type="file" id="formFile"/>
          </div>

        </div>

      </>
    );
  }
}
