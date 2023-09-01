import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './WebUiApp.jsx'
// import './index.css'
/*import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';*/
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Frame from "react-frame-component";

const extensionRoot = document.createElement('div');
extensionRoot.id = 'linkBeamExtensionRoot';
document.body.appendChild(extensionRoot);

ReactDOM.createRoot(document.getElementById('linkBeamExtensionRoot')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/*ReactDOM.render(
  <React.StrictMode>
    <Frame
      scrolling="no"
      head={[
        <link
          key="0"
          type="text/css"
          rel="stylesheet"
          href={chrome.runtime.getURL("/assets/web_ui.css")}
          />,
        ]}>
      <App />
    </Frame>
  </React.StrictMode>,
  document.getElementById('linkBeamExtensionRoot')
);*/
