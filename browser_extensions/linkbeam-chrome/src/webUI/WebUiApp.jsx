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
import Parse from 'parse/dist/parse.min.js';
import ReactDOM from 'react-dom/client';
import styles from "./styles.min.css";
import WebUiSectionMenu from "./widgets/WebUiSectionMenu";

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
      currentParseUser: null,
      pageProfileObject: null,
    };

    this.onToastOK = this.onToastOK.bind(this);
    // this.setCurrentParseUser = this.setCurrentParseUser.bind(this);
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
        this.handleCommentListModalClose();
      }

      const $targetEl2 = document.getElementById(appParams.extShadowHostId).shadowRoot.getElementById(appParams.commentModalContainerID);
      if (event.composedPath()[0] == $targetEl2) {
        this.handleCommentModalClose();
      }

      const $targetEl3 = document.getElementById(appParams.extShadowHostId).shadowRoot.getElementById(appParams.commentRepliesListModalContainerID);
      if (event.composedPath()[0] == $targetEl3) {
        this.handleCommentRepliesListModalClose(this.handleCommentListModalShow);
      }
    }).bind(this);

  }

  handleCommentListModalClose = (callback = null) => {this.setState({commentListModalShow: false}, callback);}
  handleCommentListModalShow = () => {this.setState({commentListModalShow: true});}

  handleCommentModalClose = (callback = null) => {this.setState({commentModalShow: false}, callback);}
  handleCommentModalShow = () => {this.setState({commentModalShow: true});}

  handleCommentRepliesListModalClose = (callback = null) => {this.setState({commentRepliesListModalShow: false}, callback);}
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

    if (this.state.pageProfileObject == null){

      // Querying the current wab page object
      (async () => {
        // Creates a new Query object to help us fetch MyCustomClass objects
        const query = new Parse.Query('PageProfile');
        var pageProfileUrlRoot = (window.location.href.split("?"))[0];
        query.equalTo('identifier', pageProfileUrlRoot);
        try {
          // Executes the query, which returns an array of MyCustomClass
          const results = await query.find();

          if (results.length == 0){
            this.createPageProfileObject(this.onToastOK);
          }
          else // results.length == 1
          {
            var pageProfileObject = results[0];
            this.setState({pageProfileObject: pageProfileObject}, () => {
              this.onToastOK();
            });
          }

          // this.setState({pageProfileObject: results[0]})
          console.log(`ParseObjects found: ${JSON.stringify(results)}`);
        } catch (error) {
          console.log(`Error: ${JSON.stringify(error)}`);
        }
      })();

      return;

    }


    this.handleQueryToastClose();
    
    this.handleOkToastShow(appParams.appName + " activated", () => {
      setTimeout(() => {
        this.handleOkToastClose();
      }, appParams.TIMER_VALUE);
    });

    // this.showSectionWidgets();
    this.insertSectionWidgets();

  }

  /*setCurrentParseUser(currentParseUser){

  }*/

  createPageProfileObject(callback = null){

    (async () => {
      const myNewObject = new Parse.Object('PageProfile');
      var pageProfileUrlRoot = (window.location.href.split("?"))[0];
      myNewObject.set('identifier', pageProfileUrlRoot);
      try {
        const result = await myNewObject.save();
        this.setState({pageProfileObject: result});
        // Access the Parse Object attributes using the .GET method
        console.log('PageProfile created', result);

        if (callback){
          callback();
        }

      } catch (error) {
        console.error('Error while creating PageProfile: ', error);
      }
    })();

  }

  insertSectionWidgets(){
  
    try {
    
      var sectionContainerClassName = (/github.com/.test((window.location.href.split("?"))[0]) ? appParams.GITHUB_SECTION_MARKER_CONTAINER_CLASS_NAME : appParams.LINKEDIN_SECTION_MARKER_CONTAINER_CLASS_NAME);

      var selectedTags = document.getElementsByClassName(sectionContainerClassName);
      // var selectedTags = document.getElementsByClassName(appParams.GITHUB_SECTION_MARKER_CONTAINER_CLASS_NAME);
      
      Array.from(selectedTags).forEach((selectedTag) => {

        var newDivTag = document.createElement('div');
        selectedTag.prepend(newDivTag);
        newDivTag.attachShadow({ mode: 'open' });

        ReactDOM.createRoot(newDivTag.shadowRoot).render(
          <React.StrictMode>
            {/*<link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
            <link href="https://fonts.googleapis.com/css2?family=Ubuntu&display=swap" rel="stylesheet"/>*/}
            <style type="text/css">{styles}</style>
            <WebUiSectionMenu pageProfile={this.state.pageProfileObject} sectionTag={selectedTag}/>
          </React.StrictMode>
        );

      });

    }
    catch(err) {
      console.log("An error occured when inserting the section markers ! ", err);
    }    

  }

  /*showSectionWidgets(){

    // Array.prototype.forEach.call(sectionMarkerShadowHosts, function(sectionMarkerShadowHost) { // TODO});

    eventBus.dispatch("showSectionWidgets", {pageProfileObject: this.state.pageProfileObject});

  }
*/
  render(){

    return(
      <>

        <WebUiRequestToast show={this.state.queryToastShow} handleClose={this.handleQueryToastClose} onOK={this.onToastOK}/>

        <WebUiCommentListModal show={this.state.commentListModalShow} showOnMount={false} pageProfile={this.state.pageProfileObject} appSettingsData={this.props.appSettingsData} currentParseUser={this.state.currentParseUser} handleCommentRepliesClick={this.onCommentRepliesClicked} setCurrentParseUser={(currentParseUser) => {this.setState({currentParseUser: currentParseUser});}}/>
        
        <WebUiCommentRepliesListModal commentObject={this.state.commentObject} show={this.state.commentRepliesListModalShow} appSettingsData={this.props.appSettingsData} pageProfile={this.state.pageProfileObject} currentParseUser={this.state.currentParseUser} setCurrentParseUser={(currentParseUser) => {this.setState({currentParseUser: currentParseUser});}} />

        <WebUiCommentModal show={this.state.commentModalShow} currentParseUser={this.state.currentParseUser} pageProfile={this.state.pageProfileObject} appSettingsData={this.props.appSettingsData} handleClose={this.handleCommentModalClose} setCurrentParseUser={(currentParseUser) => {this.setState({currentParseUser: currentParseUser});}}/>

        <WebUiNotificationToast show={this.state.okToastShow} handleClose={this.handleOkToastClose} text={this.state.okToastText} />    

      </>
    );
  }

}
