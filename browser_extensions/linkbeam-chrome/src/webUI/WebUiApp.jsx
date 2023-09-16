import React from 'react';
import { 
  appParams,
  messageParams,
  dbData,
  sendDatabaseActionMessage,
  ack,
  startMessageListener,
} from "../react_components/Local_library";
import WebUiRequestToast from "./widgets/WebUiRequestToast";
import WebUiCommentListModal from "./widgets/WebUiCommentListModal";
import WebUiCommentModal from "./widgets/WebUiCommentModal";
import WebUiNotificationToast from "./widgets/WebUiNotificationToast";

export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      modalShow: false,
      queryToastShow: true,
      okToastShow: false,
      okToastText: "",
      productID: null,
      // viewTabIndex: 0,
    };

    this.onToastOK = this.onToastOK.bind(this);
    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSettingsDataReceived = this.onSettingsDataReceived.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();
    
    sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["productID"]);

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.SETTINGS].join(messageParams.separator), 
        callback: this.onSettingsDataReceived
      },
    ]);

  }

  onSettingsDataReceived(message, sendResponse){

    switch(message.data.objectData.property){

      case "productID":{

        // acknowledge receipt
        ack(sendResponse);

        let productID = message.data.objectData.value;
        this.setState({productID: productID});
        break;
      }
    }

  }

  handleModalClose = () => {this.setState({modalShow: false});}
  handleModalShow = () => {this.setState({modalShow: true});}

  handleQueryToastClose = () => {this.setState({queryToastShow: false});}
  handleQueryToastShow = () => {this.setState({queryToastShow: true});}

  handleOkToastClose = () => {
    this.setState({
      okToastShow: false,
      okToastText: "",
    });
  }

  handleOkToastShow = (okToastText, callback = null) => {
    this.setState({
      okToastShow: true,
      okToastText: okToastText,
    }, callback);
  }

  /*switchViewTabIndex(){

  }*/

  onToastOK(){

    this.handleQueryToastClose();
    
    this.handleOkToastShow(appParams.appName + "activated", () => {
      setTimeout(() => {
        this.handleOkToastClose();
      }, appParams.TIMER_VALUE);
    });

    this.showSectionMarkers();

  }

  showSectionMarkers(){

    try{
      const sectionMarkerShadowHosts = document.getElementsByClassName(appParams.sectionMarkerShadowHostClassName);
      for (var i = 0; i < sectionMarkerShadowHosts.length; i++){
        var sectionMarkerShadowHost = document.getElementById((sectionMarkerShadowHosts[i]).id);
        var sectionMarker = sectionMarkerShadowHost.shadowRoot.getElementById(appParams.sectionMarkerID);
        sectionMarker.classList.remove("hidden");
      }
    }
    catch(err){
      console.log("An error occured when revealing the section markers ! ", err);
    }

  }

  render(){

    return(
      <>

        <WebUiRequestToast show={this.state.queryToastShow} handleClose={this.handleQueryToastClose} onOK={this.onToastOK}/>

        <WebUiCommentListModal show={this.state.modalShow} /*handleClose={this.handleModalClose}*/ />

        <WebUiCommentModal productID={this.state.productID}/>

        <WebUiNotificationToast show={this.state.okToastShow} handleClose={this.handleOkToastClose} text={this.state.okToastText} />    

      </>
    );
  }

}
