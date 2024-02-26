import styles from "../contentScriptUi/styles.min.css";
import InjectedReminderToastView from "../contentScriptUi/widgets/InjectedReminderToastView";
import InjectedKeywordToastView from "../contentScriptUi/widgets/InjectedKeywordToastView";
import ReactDOM from 'react-dom/client';
import React from 'react';

export class DataExtractorBase {

	tabId = null;
	webPageData = null;

	constructor(){

		// Starting listening to different messages
		this.startMessageListener();

	}

	// Function for sending the page data
	sendTabData(data){

	  chrome.runtime.sendMessage({header: /*messageParams.responseHeaders.CS_WEB_PAGE_DATA*/ "sw-web-page-data", data: {profileData: data, tabId: this.tabId}}, (response) => {
	    console.log('linkedin-data response sent', response, data);
	    this.webPageData = data;
	  });

	}

	extractData(){

	}

	getTabId(messageData, sendResponse){

	  // Acknowledge the message
	  sendResponse({
	      status: "ACK"
	  });

	  this.tabId = messageData.tabId;

	  setInterval(
	    () => {

			// if (this.webPageData == {}){
			//   sendTabData({}, tabId);
			//   return;
			// }

			// var data = extractData();
			// if (data == this.webPageData){
			//   data = {};
			// }
			// sendTabData(data, tabId);
			// this.webPageData = data;

	    	var webPageData = this.extractData();
	    	if (webPageData != this.webPageData){
	    		this.sendTabData(webPageData);
	    	}

	    }, 
	    3000
	  );

	}

	showToast(messageData, property, sendResponse){

	  // Acknowledge the message
	  sendResponse({
	      status: "ACK"
	  });

	  var objects = messageData[property];

	  var shadowHost = document.createElement('div');
	  shadowHost.id = /*appParams.extShadowHostId*/"extShadowHostId";
	  shadowHost.style.cssText='all:initial';
	  document.body.appendChild(shadowHost);

	  shadowHost = document.getElementById(/*appParams.extShadowHostId*/"extShadowHostId");
	  shadowHost.attachShadow({ mode: 'open' });
	  const shadowRoot = shadowHost.shadowRoot;

	  ReactDOM.createRoot(shadowRoot).render(
	    <React.StrictMode>
	      <style type="text/css">{styles}</style>
	      { property == "reminders" && <InjectedReminderToastView objects={objects} />}
	      { property == "detectedKeywords" && <InjectedKeywordToastView objects={objects} />}

	    </React.StrictMode>
	  );

	}

	startMessageListener(){

		// Retrieving the tabId variable
		chrome.runtime.onMessage.addListener((function(message, sender, sendResponse) {

		  if (message.header == "web-ui-app-settings-data") /*messageParams.responseHeaders.WEB_UI_APP_SETTINGS_DATA*/ {
		      
		      if (Object.hasOwn(message.data, "tabId")){
		        this.getTabId(message.data, sendResponse);
		      }
		      else if (Object.hasOwn(message.data, "reminders")){
		        this.showToast(message.data, "reminders", sendResponse);
		      }
		      else if (Object.hasOwn(message.data, "detectedKeywords")){
		        this.showToast(message.data, "detectedKeywords", sendResponse);
		      }

		  }

		}).bind(this));

	}

}