// Listening for messages

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // If the received message has the expected format...
    if (message.header === 'check-linkedin-page') {
        // sending a response
        sendResponse({
            status: "ACK"
        });

        let linkedInData = extractLinkedInData();

        chrome.runtime.sendMessage({header: 'linkedin-data', data: linkedInData}, (response) => {
          console.log('linkedin-data response sent', response);
        });
    }
});

// Extract data from the page to be sent back to the background

function extractData(){
    return null;
}