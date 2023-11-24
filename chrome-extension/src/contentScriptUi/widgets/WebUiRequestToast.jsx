/*import './WebUiRequestToast.css'*/
import React from 'react';
import { appParams, messageParams } from "../../popup/Local_library";
import { Spinner } from 'flowbite-react';

export default class WebUiRequestToast extends React.Component{

  constructor(props){
    super(props);
    this.state = {
        processing: false,
    };

    this.onOK = this.onOK.bind(this);
  }

  componentDidMount() {

    // Send message to the background
    chrome.runtime.sendMessage({header: messageParams.requestHeaders.CS_NOTIFY_LOAD_ACTION, data: null}, (response) => {
      // Got an asynchronous response with the data from the service worker
      console.log("Notify load Request sent !");
    });

  }

  onOK = () => {

    this.setState({processing: true});

    this.props.onOK();

  }

  render(){
    return (
      <>
        
        { this.props.show && 
            <div class="toast-container-ac84bbb3728">
                <div id="toast-interactive" class="fixed bottom-5 right-5 w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:bg-gray-800 dark:text-gray-400" role="alert">
                    <div class="flex">
                        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:text-blue-300 dark:bg-blue-900">
                            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97"/>
                            </svg>
                            <span class="sr-only">Refresh icon</span>
                        </div>
                        <div class="ml-3 text-sm font-normal">
                            <span class="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{appParams.appName}</span>
                            <div class="mb-2 text-sm font-normal">Activate {appParams.appName} Extension ? </div> 
                            <div class="grid grid-cols-2 gap-2">
                                { !this.state.processing && <>
                                                                <div>
                                                                    <a onClick={() => {this.onOK()}} /*href="#"*/ class="handy-cursor inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">
                                                                      Yes
                                                                    </a>
                                                                </div>
                                                                <div>
                                                                    <a onClick={() => {this.props.handleClose()}} /*href="#"*/ class="handy-cursor inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700">
                                                                      No
                                                                    </a> 
                                                                </div>
                                                            </>}
                                { this.state.processing && <Spinner aria-label="Default status example" />}
                            </div>    
                        </div>
                        <button onClick={() => {this.props.handleClose()}} type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-interactive" aria-label="Close">
                            <span class="sr-only">Close</span>
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        }
      </>
    );
  }
}
