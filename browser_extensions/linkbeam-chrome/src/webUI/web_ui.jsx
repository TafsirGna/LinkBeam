import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './WebUiApp.jsx';
import { appParams, messageParams, ack, checkWebPage } from "../react_components/Local_library";
import styles from "./styles.min.css";
import WebUiProfileComments from "./WebUiProfileComments";
import WebUiProfilePage from "./WebUiProfilePage";
import Parse from 'parse/dist/parse.min.js';
import { env } from "../../.env.js";


// Checking first if the user has expanded the comment list modal
// var webUiUrlRegex = /^chrome-extension:\/\/[\w.]+\/web_ui\.html\?profile-url-comment-list=/;
var webUiUrlRegex = /^chrome-extension:\/\/[\w.]+\/web_ui\.html/;

// Parse initialization configuration goes here
Parse.initialize(env.PARSE_APPLICATION_ID, env.PARSE_JAVASCRIPT_KEY);
Parse.serverURL = appParams.PARSE_HOST_URL;

var appSettingsData = null;

const setUpAppWithinWebPage = () => {

  /*
    Inserting the overlay interface
  */

  var shadowHost = document.createElement('div');
  shadowHost.id = appParams.extShadowHostId;
  shadowHost.style.cssText='all:initial';
  document.body.appendChild(shadowHost);

  shadowHost = document.getElementById(appParams.extShadowHostId);
  shadowHost.attachShadow({ mode: 'open' });
  const shadowRoot = shadowHost.shadowRoot;

  /*var styleTag = document.createElement('style');
  styleTag.type = "text/css";
  styleTag.innerText = bootstrap_css;
  document.head.prepend(styleTag);*/

  ReactDOM.createRoot(shadowRoot).render(
    <React.StrictMode>
      <style type="text/css">{styles}</style>
      <App appSettingsData={appSettingsData} />
    </React.StrictMode>
  );

  /*ReactDOM.render(
    <React.StrictMode>
      <style type="text/css">{styles}</style>
      <App />
    </React.StrictMode>,
    shadowWrapper
  );*/

}


const setUpApp = () => {

  if (webUiUrlRegex.test(window.location.href)){

    const urlParams = new URLSearchParams(window.location.search);

    var newDivTag = document.createElement('div');
    newDivTag.id = appParams.extShadowHostId;
    document.body.appendChild(newDivTag);

    var mainParam = urlParams.get("profile-url-comment-list");

    if (mainParam){

      ReactDOM.createRoot(newDivTag).render(
        <React.StrictMode>
          {/*<style type="text/css">{styles}</style>*/}
          <WebUiProfileComments/>
        </React.StrictMode>
      );

    }
    else{

      mainParam = urlParams.get("web-ui-page-profile-id");
      if (mainParam){

        ReactDOM.createRoot(newDivTag).render(
          <React.StrictMode>
            {/*<style type="text/css">{styles}</style>*/}
            <WebUiProfilePage objectId={mainParam} />
          </React.StrictMode>
        );

      }

    }

  }
  else{

    // Setting function to listen to the service worker for messages
    (() => {

      chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

        switch(message.header){

          case messageParams.responseHeaders.WEB_UI_APP_SETTINGS_DATA: {

            // Acknowledge the message
            ack(sendResponse);

            appSettingsData = message.data;
            checkWebPage(setUpAppWithinWebPage);

            break;
            
          }

        }

        return true;
      });

    })();

  }


}

setUpApp();

