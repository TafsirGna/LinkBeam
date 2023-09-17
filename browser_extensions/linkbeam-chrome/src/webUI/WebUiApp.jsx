import React from 'react';
import { 
  appParams,
  messageParams,
  ack,
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
    };

    this.onToastOK = this.onToastOK.bind(this);
  }

  componentDidMount() {

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

  onToastOK(){

    this.handleQueryToastClose();
    
    this.handleOkToastShow(appParams.appName + " activated", () => {
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

        <WebUiCommentListModal show={this.state.modalShow} appSettingsData={this.props.appSettingsData} /*handleClose={this.handleModalClose}*/ />

        <WebUiCommentModal appSettingsData={this.props.appSettingsData}/>

        <WebUiNotificationToast show={this.state.okToastShow} handleClose={this.handleOkToastClose} text={this.state.okToastText} />    

      </>
    );
  }

}
