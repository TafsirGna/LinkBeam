/*import './KeywordsModalView.css'*/
import React from 'react';
import { appParams, dbDataSanitizer } from "../../popup/Local_library";
import { DateTime as LuxonDateTime } from "luxon";
import default_user_icon from '../../assets/user_icons/default.png';
import gaming_lock_audio from '../../assets/audio/gaming-lock.mp3';

export default class KeywordsModalView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
        keywordsModalShow: false,
    };

    this.startMessageListener = this.startMessageListener.bind(this);

  }

  handleKeywordsModalShow = () => {
    this.setState({keywordsModalShow: true}); 
  }
  handleKeywordsModalClose = () => { this.setState({keywordsModalShow: false}); }
  

  componentDidMount() {

    var audioElement = new Audio(chrome.runtime.getURL("/assets/gaming-lock.mp3"));
    audioElement.play();

  }

  startMessageListener(){

        // Retrieving the tabId variable
        chrome.runtime.onMessage.addListener((function(message, sender, sendResponse) {
        
            if (message.header == messageMeta.header.CS_SETUP_DATA) {

                // Acknowledge the message
                sendResponse({
                    status: "ACK"
                });
                      
                if (Object.hasOwn(message.data, "show")){
                    if (message.data.widget == "KeywordModal"){
                        this.handleKeywordsModalShow();
                    }
                }
            }
            
        }).bind(this));
    }

  render(){
    return (
      <>

        { this.state.keywordsModalShow 
            && <div class={"modal-container-ac84bbb3728 "}>
                  <div class="w-1/2 m-auto divide-y divide-slate-400/20 rounded-lg bg-white text-[0.8125rem] leading-5 text-slate-900 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
        
                    { this.props.objects &&  <>
                                                <div class="font-bold">Keywords: </div>
                                                <div class="my-2.5">
                                                            { this.props.objects.map((keyword, index) => (<span class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                                                                                                                                                        {keyword.name}
                                                                                                                                                                    </span>) ) }
                                                </div>
                                                        </> } 
                    
                    
                    <div class="p-4">
                      <div onClick={this.handleKeywordsModalClose} class="handy-cursor pointer-events-auto rounded-md px-4 py-2 text-center font-medium shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
                        <span>Dismiss</span>
                      </div>
                    </div>

                  </div>
                </div>}
      </>
    );
  }
}
