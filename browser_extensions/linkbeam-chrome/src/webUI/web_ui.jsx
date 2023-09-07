import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './WebUiApp.jsx';
import { appParams } from "../react_components/Local_library";
import styles from "./styles.min.css";

var shadowHost = document.createElement('div');
shadowHost.id = appParams.extShadowHostId;
// shadowHost.classList.add("bootstrap");
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
