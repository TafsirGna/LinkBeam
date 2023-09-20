/*import { 
  messageParams,
} from "../react_components/Local_library";*/

// Content script designed to make sure the active tab is a linkedin page

function getLinkedinData(){
  return {};
}

var linkedinData = getLinkedinData();

chrome.runtime.sendMessage({header: /*messageParams.responseHeaders.CS_WEB_PAGE_DATA*/ "sw-web-page-data", data: linkedinData}, (response) => {
  console.log('linkedin-data response sent', response, linkedinData);
})
