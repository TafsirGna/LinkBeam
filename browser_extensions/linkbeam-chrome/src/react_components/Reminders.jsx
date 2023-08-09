/*import './Reminders.css'*/
import React from 'react'
import BackToPrev from "./widgets/BackToPrev"

export default class Reminders extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    // Saving the current page title
    chrome.runtime.sendMessage({header: 'set-settings-data', data: {property: "currentPageTitle", value: "Reminders"}}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log('Save page title request sent', response);
    });

  }

  render(){
    return (
      <>
        <BackToPrev prevPageTitle="Settings"/>
      </>
    );
  }
}
