import React from 'react';
import { 
  appParams,
  messageParams,
  ack,
} from "../react_components/Local_library";
import WebUiRequestToast from "./widgets/WebUiRequestToast";
import WebUiCommentListModal from "./widgets/WebUiCommentListModal";
import WebUiCommentModal from "./widgets/WebUiCommentModal";
import WebUiCommentRepliesListModal from "./widgets/WebUiCommentRepliesListModal";
import WebUiNotificationToast from "./widgets/WebUiNotificationToast";

export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      commentListModalShow: false,
      commentRepliesListModalShow: true,
      queryToastShow: true,
      okToastShow: false,
      okToastText: "",
    };

    this.onToastOK = this.onToastOK.bind(this);
  }

  componentDidMount() {

  }

  handleCommentListModalClose = () => {this.setState({commentListModalShow: false});}
  handleCommentListModalShow = () => {this.setState({commentListModalShow: true});}

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
      Array.prototype.forEach.call(sectionMarkerShadowHosts, function(sectionMarkerShadowHost) {
        // var sectionMarkerShadowHost = document.getElementById((sectionMarkerShadowHosts[i]).id);
        var sectionMarker = sectionMarkerShadowHost.shadowRoot.getElementById(appParams.sectionMarkerID);
        sectionMarker.classList.remove("hidden");
      });
    }
    catch(err){
      console.log("An error occured when revealing the section markers ! ", err);
    }

  }

  render(){

    return(
      <>

        <WebUiRequestToast show={this.state.queryToastShow} handleClose={this.handleQueryToastClose} onOK={this.onToastOK}/>

        <WebUiCommentListModal show={this.state.commentListModalShow} appSettingsData={this.props.appSettingsData} /*handleClose={this.handleCommentListModalClose}*/ />
        
        <WebUiCommentRepliesListModal show={this.state.commentRepliesListModalShow} appSettingsData={this.props.appSettingsData} /*handleClose={this.handleCommentListModalClose}*/ />

        <WebUiCommentModal appSettingsData={this.props.appSettingsData}/>

        <WebUiNotificationToast show={this.state.okToastShow} handleClose={this.handleOkToastClose} text={this.state.okToastText} />    

      </>
    );
  }

}
