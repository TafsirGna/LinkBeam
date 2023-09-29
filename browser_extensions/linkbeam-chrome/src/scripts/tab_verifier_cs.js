import { 
  messageParams,
  appParams,
} from "../react_components/Local_library";

// Content script designed to make sure the active tab is a linkedin page

function extractData(){

  var pageData = {};

  // checking if a linkbeam code has already been injected
  var linkBeamRootTag = document.getElementById(appParams.extShadowHostId);
  // var linkBeamRootTag = document.getElementById("linkBeamExtensionMainRoot");
  pageData["codeInjected"] = (linkBeamRootTag ? true : false);

  return pageData;
}

var webPageData = extractData();

chrome.runtime.sendMessage({header: messageParams.responseHeaders.CS_WEB_PAGE_DATA /*"sw-web-page-data"*/, data: webPageData}, (response) => {
  console.log('linkedin-data response sent', response, webPageData);
})
