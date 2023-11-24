/*import './WebUiCommentModal.css'*/
import React, { useState } from 'react';
import { appParams, logInParseUser, registerParseUser } from "../../popup/Local_library";
import { Spinner } from 'flowbite-react';
import Parse from 'parse/dist/parse.min.js';
import eventBus from "../../popup/EventBus";
import default_user_icon from '../../assets/user_icons/default.png';
import { DateTime as LuxonDateTime } from "luxon";


export default class WebUiCommentReactionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

  }

  render(){
    return (
      <>

        <div class="flex p-4">
          <span>
            <img src={default_user_icon} alt="twbs" width="40" height="40" class="rounded-circle flex-shrink-0"/>
          </span>
          <div class="ml-4 flex-auto">
            <div class="font-medium inline-flex items-center">
              <a class="mr-3" href={ this.props.appSettingsData.productID == this.props.object.get("user").getUsername() ? "#" :  "/web_ui.html?web-ui-page-profile-id="+this.props.object.get("user").getUsername() } target="_blank">
                { this.props.appSettingsData.productID == this.props.object.get("user").getUsername() ? "You" : this.props.object.get("user").getUsername() }
              </a>
              { this.props.object.get("user").get("accountVerified") == true && <span>
                            <Tooltip
                                  content="Verified user"
                                >
                              <svg viewBox="0 0 24 24" width="12" height="12" stroke="#198754" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </Tooltip>
                          </span>}
              · 
              <span class="font-light text-xs ml-2">{LuxonDateTime.fromISO(this.props.object.get("createdAt").toISOString()).toRelative()}</span>
            </div>
            <div class="mt-1 text-slate-700 text-sm">
              {this.props.object.get("action") == "upvote" ?
                                                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                                                            :
                                                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg> }
            </div>


            <div class="flex items-center p-2 shadow-md mt-3 rounded-lg leading-5 ring-1 ring-slate-700/10">
              <img src={user_icon} alt="twbs" width="40" height="40" class="rounded-circle flex-shrink-0"/>
              <div class="ml-4 flex-auto">
                <div class="font-medium inline-flex items-center">
                  <a class="mr-3" href={ this.props.appSettingsData.productID == this.props.object.get("comment").get("createdBy").getUsername() ? "#" :  "/web_ui.html?web-ui-page-profile-id="+this.props.object.get("comment").get("createdBy").getUsername() } target="_blank">
                    { this.props.appSettingsData.productID == this.props.object.get("comment").get("createdBy").getUsername() ? "You" : this.props.object.get("comment").get("createdBy").getUsername() }
                  </a>
                  { this.props.object.get("comment").get("createdBy").get("accountVerified") == true && <span>
                                <Tooltip
                                      content="Verified user"
                                    >
                                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="#198754" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </Tooltip>
                              </span>}
                  · 
                  <span class="font-light text-xs ml-2">{LuxonDateTime.fromISO(this.props.object.get("comment").get("createdAt").toISOString()).toRelative()}</span>
                </div>
                <div class="mt-1 text-slate-700 text-sm">
                  { this.props.object.get("comment").get("text") }
                </div>
              </div>
            </div> 



          </div>
        </div> 

      </>
    );
  }
}
