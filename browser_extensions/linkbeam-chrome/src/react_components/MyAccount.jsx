/*import './Profile.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import { v4 as uuidv4 } from 'uuid';
import user_icon from '../assets/user_icon.png';
import moment from 'moment';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
	saveCurrentPageTitle, 
	sendDatabaseActionMessage,
	ack,
	messageParameters, 
	startMessageListener
} from "./Local_library";

export default class MyAccount extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    	productID: "",
    	installedOn: "",
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSettingsDataReceived = this.onSettingsDataReceived.bind(this);
  }

  componentDidMount() {

  	this.listenToMessages();

  	// Setting the local data with the global ones
  	if (this.props.globalData.productID){
  		this.setState({productID: this.props.globalData.productID});
  	}

  	if (this.props.globalData.installedOn){
  		this.setState({installedOn: this.props.globalData.installedOn});
  	}

  	if (this.props.globalData.productID == null || this.props.globalData.installedOn == null){
  		sendDatabaseActionMessage("get-object", "settings", ["installedOn", "productID"]);
  	}

		// Saving the current page title
		sendDatabaseActionMessage("update-object", "settings", {property: "currentPageTitle", value: "MyAccount"});
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
				if (productID){
					this.setState({productID: productID});
				}
				else{
					// setting the new product ID
					saveCurrentPageTitle("MyAccount");
				}
		  			break;
		  		}
		  	}

  }

  listenToMessages(){

  	startMessageListener([
      {
        param: [messageParameters.actionNames.GET_OBJECT, messageParameters.actionObjectNames.SETTINGS].join(messageParameters.separator), 
        callback: this.onSettingsDataReceived
      },
    ]);

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle="Settings"/>
          <div class="">
            <div class="text-center">
            	<img src={user_icon} alt="twbs" width="60" height="60" class="shadow rounded-circle flex-shrink-0"/>
            </div>
            <div class="mx-auto w-75 mt-4">
            	<OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip1">Your unique identifier</Tooltip>}
              >
                <div class="input-group mb-3 shadow input-group-sm">
								  <span class="input-group-text" id="basic-addon1">ID</span>
								  <input disabled type="text" class="form-control" placeholder="Product ID" aria-label="Username" aria-describedby="basic-addon1" value={this.state.productID}/>
								</div>
              </OverlayTrigger>
            	<hr/>
            	<p class="fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-info-subtle">Installed since {moment(this.state.installedOn).format('MMMM Do YYYY, h:mm:ss a')}</p>
            </div>
          </div>
        </div>
      </>
    );
  }
}
