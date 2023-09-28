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
import eventBus from "./widgets/EventBus";

export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      commentListModalShow: false,
      commentRepliesListModalShow: false,
      commentModalShow: false,
      queryToastShow: true,
      okToastShow: false,
      okToastText: "",
      commentObject: null,
    };

    this.onToastOK = this.onToastOK.bind(this);
  }

  componentWillUnmount() {
    eventBus.remove("showCommentModal");
    eventBus.remove("showCommentListModal");
  }

  componentDidMount() {

    eventBus.on("showCommentModal", (data) =>
      // this.setState({ message: data.message });
      {this.handleCommentModalShow();}
    );

    eventBus.on("showCommentListModal", (data) =>
      // this.setState({ message: data.message });
      {this.handleCommentListModalShow();}
    );

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = (function(event) {
      
      const $targetEl1 = document.getElementById(appParams.extShadowHostId).shadowRoot.getElementById(appParams.commentListModalContainerID);
      if (event.composedPath()[0] == $targetEl1) {
        // if (!this.props.show){
          this.handleCommentListModalClose();
        // }
      }

      const $targetEl2 = document.getElementById(appParams.extShadowHostId).shadowRoot.getElementById(appParams.commentModalContainerID);
      if (event.composedPath()[0] == $targetEl2) {
        this.handleCommentModalClose();
      }

      const $targetEl3 = document.getElementById(appParams.extShadowHostId).shadowRoot.getElementById(appParams.commentRepliesListModalContainerID);
      if (event.composedPath()[0] == $targetEl3) {
        this.handleCommentRepliesListModalClose();
      }
    }).bind(this);

  }

  handleCommentListModalClose = (callback = null) => {this.setState({commentListModalShow: false}, callback);}
  handleCommentListModalShow = () => {this.setState({commentListModalShow: true});}

  handleCommentModalClose = (callback = null) => {this.setState({commentModalShow: false}, callback);}
  handleCommentModalShow = () => {this.setState({commentModalShow: true});}

  handleCommentRepliesListModalClose = () => {this.setState({commentRepliesListModalShow: false});}
  handleCommentRepliesListModalShow = (comment) => {

    this.setState(
    {
      commentObject: comment, 
      commentRepliesListModalShow: true,
    });
  }

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

  onCommentRepliesClicked = (comment) => {

    this.handleCommentListModalClose(this.handleCommentRepliesListModalShow(comment));

  }

  onToastOK(){

    this.handleQueryToastClose();
    
    this.handleOkToastShow(appParams.appName + " activated", () => {
      setTimeout(() => {
        this.handleOkToastClose();
      }, appParams.TIMER_VALUE);
    });

    this.showSectionWidgets();

  }

  showSectionWidgets(){

    /*try{
      const sectionMarkerShadowHosts = document.getElementsByClassName(appParams.sectionMarkerShadowHostClassName);
      Array.prototype.forEach.call(sectionMarkerShadowHosts, function(sectionMarkerShadowHost) {
        // var sectionMarkerShadowHost = document.getElementById((sectionMarkerShadowHosts[i]).id);
        var sectionMarker = sectionMarkerShadowHost.shadowRoot.getElementById(appParams.sectionMarkerID);
        sectionMarker.classList.remove("hidden");
      });
    }
    catch(err){
      console.log("An error occured when revealing the section markers ! ", err);
    }*/

    eventBus.dispatch("showSectionWidgets", null);

  }

  render(){

    return(
      <>

        <WebUiRequestToast show={this.state.queryToastShow} handleClose={this.handleQueryToastClose} onOK={this.onToastOK}/>

        <WebUiCommentListModal show={this.state.commentListModalShow} showOnMount={false} appSettingsData={this.props.appSettingsData} /*handleClose={this.handleCommentListModalClose}*/ handleCommentRepliesClick={this.onCommentRepliesClicked}/>
        
        <WebUiCommentRepliesListModal commentObject={this.state.commentObject} show={this.state.commentRepliesListModalShow} appSettingsData={this.props.appSettingsData} /*handleClose={this.handleCommentListModalClose}*/ />

        <WebUiCommentModal show={this.state.commentModalShow} appSettingsData={this.props.appSettingsData}/>

        <WebUiNotificationToast show={this.state.okToastShow} handleClose={this.handleOkToastClose} text={this.state.okToastText} />    

      </>
    );
  }

}
