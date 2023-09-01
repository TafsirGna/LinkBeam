// Content script designed to make sure the active tab is a linkedin page

function getLinkedinData(){
  return {};
}

var linkedinData = getLinkedinData();

chrome.runtime.sendMessage({header: 'linkedin-data', data: linkedinData}, (response) => {
  console.log('linkedin-data response sent', response, linkedinData);
})
