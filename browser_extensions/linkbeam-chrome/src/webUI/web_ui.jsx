import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './WebUiApp.jsx';
import { appParams } from "../react_components/Local_library";
import styles from "./styles.min.css";
import WebUiSectionMenu from "./widgets/WebUiSectionMenu";
import { v4 as uuidv4 } from 'uuid';

/*
  Inserting the warning alerts
*/

try {
  
  const selectedTag = document.getElementsByClassName("js-pinned-items-reorder-container")[0];
  var newDivTag = document.createElement('div');
  newDivTag.id = uuidv4();
  newDivTag.classList.add(appParams.sectionMarkerShadowHostClassName);
  selectedTag.prepend(newDivTag);
  newDivTag.attachShadow({ mode: 'open' });

  ReactDOM.createRoot(newDivTag.shadowRoot).render(
    <React.StrictMode>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
      <link href="https://fonts.googleapis.com/css2?family=Ubuntu&display=swap" rel="stylesheet"/>
      <style type="text/css">{styles}</style>
      <WebUiSectionMenu/>
    </React.StrictMode>
  );

}
catch(err) {
  console.log("An error occured when inserting the section markers ! ", err);
}

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
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu&display=swap" rel="stylesheet"/>
    <style type="text/css">{styles}</style>
    <App />
  </React.StrictMode>
);

/*ReactDOM.render(
  <React.StrictMode>
    <style type="text/css">{styles}</style>
    <App />
  </React.StrictMode>,
  shadowWrapper
);*/
