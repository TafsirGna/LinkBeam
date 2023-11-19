/*import './Profile.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import default_user_icon from '../assets/user_icons/default.png';
import boy_user_icon from '../assets/user_icons/boy.png';
import gamer_user_icon from '../assets/user_icons/gamer.png';
import man_user_icon from '../assets/user_icons/man.png';
import mom_user_icon from '../assets/user_icons/mom.png';
import lady_user_icon from '../assets/user_icons/lady.png';
import woman_user_icon from '../assets/user_icons/woman.png';
import moment from 'moment';
import { OverlayTrigger, Tooltip, Offcanvas } from "react-bootstrap";
import { 
	saveCurrentPageTitle, 
	sendDatabaseActionMessage,
	ack,
	messageParams,
  dbData, 
	startMessageListener,
  appParams,
} from "./Local_library";
// import Offcanvas from 'react-bootstrap/Offcanvas';

const productIdOverlayText = "Your unique identifier";

export default class MyAccount extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    	productID: "",
    	installedOn: "",
      userIcon: "default",
      userIconOffCanvasShow: false,
      productIdOverlayText: productIdOverlayText,
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSettingsDataReceived = this.onSettingsDataReceived.bind(this);
  }

  handleOffCanvasClose = () => {this.setState({userIconOffCanvasShow: false})};
  handleOffCanvasShow = () => {this.setState({userIconOffCanvasShow: true})};

  componentDidMount() {

  	this.listenToMessages();

    // Saving the current page title
    saveCurrentPageTitle("MyAccount");

  	// Setting the local data with the global ones
  	if (this.props.globalData.productID){
  		this.setState({productID: this.props.globalData.productID});
  	}

  	if (this.props.globalData.installedOn){
  		this.setState({installedOn: this.props.globalData.installedOn});
  	}

  	if (this.props.globalData.productID == null || this.props.globalData.installedOn == null){
  		sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["installedOn", "productID"]);
  	}

    // Getting the user icon to display
    sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["userIcon"]);

  }

  changeUserIcon(icon_title){

    sendDatabaseActionMessage(messageParams.requestHeaders.UPDATE_OBJECT, dbData.objectStoreNames.SETTINGS, {property: "userIcon", value: icon_title});

  }

  onSettingsDataReceived(message, sendResponse){

  	switch(message.data.objectData.property){
  		case "installedOn":{

  			// acknowledge receipt
  			ack(sendResponse);

				// setting the value
				let installedOn = message.data.objectData.value;
				this.setState({installedOn: installedOn});
		  	break;
		  }
  		case "productID":{

  			// acknowledge receipt
  			ack(sendResponse);

				let productID = message.data.objectData.value;
				this.setState({productID: productID});
		  	break;
		  }

    case "userIcon":{

        // acknowledge receipt
        ack(sendResponse);

        let userIcon = message.data.objectData.value;
        this.setState({userIcon: userIcon});

        this.handleOffCanvasClose();

        break;
      }
		}

  }

  listenToMessages(){

  	startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.SETTINGS].join(messageParams.separator), 
        callback: this.onSettingsDataReceived
      },
    ]);

  }

  verifyAccount(){

  }

  copyToClipboard(){

    if (!navigator.clipboard) {
      console.error('Async: Could not copy text: 1');
      // fallbackCopyTextToClipboard(text);
      return;
    }

    navigator.clipboard.writeText(this.state.productID).then((function() {
      this.setState({productIdOverlayText: "Copied!"}, () => {
          setTimeout(() => {
              this.setState({productIdOverlayText: productIdOverlayText});
            }, appParams.TIMER_VALUE
          );
        });
      }).bind(this), 
      function(err) {
        console.error('Async: Could not copy text: ', err);
      }
    );

  }

  getUserIcon(){

    var userIcon = null;

    switch(this.state.userIcon){
      case "default":
        userIcon = default_user_icon;
        break;
      case "man":
        userIcon = man_user_icon;
        break;
      case "boy":
        userIcon = boy_user_icon;
        break;
      case "lady":
        userIcon = lady_user_icon;
        break;
      case "woman":
        userIcon = woman_user_icon;
        break;
      case "gamer":
        userIcon = gamer_user_icon;
        break;
      case "mom":
        userIcon = mom_user_icon;
        break;
    }

    return userIcon;
  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle="Settings"/>
          <div class="">
            <div class="text-center">
            	<img src={this.getUserIcon()} onClick={() => {this.handleOffCanvasShow()}} alt="twbs" width="60" height="60" class="handy-cursor shadow rounded-circle flex-shrink-0" title="Click to change"/>
            </div>
            <div class="mx-auto w-75 mt-4">
            	<OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip1">{this.state.productIdOverlayText}</Tooltip>}
              >
                <div class="input-group mb-3 shadow input-group-sm" onClick={() => {this.copyToClipboard();}}>
								  <span class="input-group-text handy-cursor" id="basic-addon1">ID</span>
								  <input disabled type="text" class="form-control" placeholder="Product ID" aria-label="Username" aria-describedby="basic-addon1" value={this.state.productID} />
								</div>
              </OverlayTrigger>
            	<hr/>
            	<p class="fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-info-subtle">Installed since {moment(this.state.installedOn).format('MMMM Do YYYY, h:mm:ss a')}</p>

              {/*<div class="text-center">
                <button type="button" class="btn btn-primary badge mt-3" onClick={() => {this.verifyAccount()}} >
                  Verify my account
                </button>
              </div>*/}
            </div>
          </div>
        </div>

        <Offcanvas show={this.state.userIconOffCanvasShow} onHide={this.handleOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>User Icons</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div class="row">
              <div class="col text-center">
                <img width="60" height="60" src={default_user_icon} onClick={() => {this.changeUserIcon("default")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 mb-3" title="Default"/>
                <img width="60" height="60" src={boy_user_icon} onClick={() => {this.changeUserIcon("boy")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 my-3" title="Boy"/>
                <img width="60" height="60" src={gamer_user_icon} onClick={() => {this.changeUserIcon("gamer")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 my-3" title="Gamer"/>
              </div>
              <div class="col text-center">
                <img width="60" height="60" src={man_user_icon} onClick={() => {this.changeUserIcon("man")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 mb-3" title="Man"/>
                <img width="60" height="60" src={mom_user_icon} onClick={() => {this.changeUserIcon("mom")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 my-3" title="Mom"/>
              </div>
              <div class="col text-center">
                <img width="60" height="60" src={lady_user_icon} onClick={() => {this.changeUserIcon("lady")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 mb-3" title="Lady"/>
                <img width="60" height="60" src={woman_user_icon} onClick={() => {this.changeUserIcon("woman")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 my-3" title="Woman"/>
              </div>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
      </>
    );
  }
}
