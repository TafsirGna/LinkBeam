/*import './WebUiProfilePage.css'*/
import React from 'react';
import { 
  appParams,
  sendDatabaseActionMessage,
  startMessageListener,
  messageParams,
  dbData,
  ack,
} from "../react_components/Local_library";
import { Spinner, Tooltip } from 'flowbite-react';
import { DateTime as LuxonDateTime } from "luxon";
import Parse from 'parse/dist/parse.min.js';
import user_icon from '../assets/user_icon.png';
import { Tabs } from 'flowbite-react';
import WebUiCommentItemView from "./widgets/WebUiCommentItemView";
// import "./styles.min.css";

export default class WebUiProfilePage extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      userObject: null,
      productID:  null,
      profileReplies: null,
      profileComments: null,
      profileReactions: null,
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSettingsDataReceived = this.onSettingsDataReceived.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["productID"]);

    // this.fetchUserObject();

  }

  onSettingsDataReceived(message, sendResponse){

    switch(message.data.objectData.property){

      case "productID":{

        // acknowledge receipt
        ack(sendResponse);

        let productID = message.data.objectData.value;
        this.setState({productID: productID}, () => {
          this.fetchUserObject();
        });
        break;
      }

    }

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_DATA, dbData.objectStoreNames.SETTINGS].join(messageParams.separator), 
        callback: this.onSettingsDataReceived
      },
    ]);

  }

  async fetchUserObject(){

    const query = new Parse.Query('User');
    // You can also query by using a parameter of an object
    query.equalTo('username', this.props.objectId);
    const results = await query.find();
    try {

      if (results.length == 0){
        console.log("No user with such username");
        return;
      }

      var user = results[0];
      this.setState({userObject: user}, () => {
        this.fetchProfileComments();
        this.fetchProfileReplies();
        this.fetchProfileReactions();
      });

    } catch (error) {
      console.error('Error while fetching User', error);
    }

  }

  async fetchProfileComments(){

    const query = new Parse.Query('Comment');
    // You can also query by using a parameter of an object
    query.equalTo('createdBy', this.state.userObject);
    query.equalTo('parentObject', null);
    const results = await query.find();
    try {

      this.setState({profileComments: results});

    } catch (error) {
      console.error('Error while fetching Profile Comments', error);
    }

  }

  async fetchProfileReplies(){

    const query = new Parse.Query('Comment');
    // You can also query by using a parameter of an object
    query.equalTo('createdBy', this.state.userObject);
    query.notEqualTo('parentObject', null);
    const results = await query.find();
    try {

      this.setState({profileReplies: results});

    } catch (error) {
      console.error('Error while fetching Profile Replies', error);
    }


  }

  async fetchProfileReactions(){

  }

  render(){
    return (
      <>

        { this.state.userObject == null && <div class="mt-14 flex">
                                            <div class="mx-auto">
                                              <Spinner aria-label="Default status example" />
                                            </div>
                                          </div> }


        { this.state.userObject &&  <div class="grid grid-cols-12 gap-4">
                  <div class="col-start-4 col-span-6">
        
                    <div class="pointer-events-auto mt-14 mb-8 rounded-lg bg-white p-4 text-[0.8125rem] leading-5 ring-1 ring-slate-700/10">

                      <div class="flex justify-between items-center">
                        <div class="flex">
                          <img src={user_icon} alt="twbs" width="40" height="40" class="mx-auto flex-shrink-0"/>
                        </div>
                        <div class="font-medium text-slate-900 ml-4">
                          { this.state.productID == this.state.userObject.get("username") ? "You" : this.state.userObject.get("username") }
                          { this.state.userObject.get("accountVerified") == true && <span>
                                                                                                <Tooltip
                                                                                                      content="Verified user"
                                                                                                    >
                                                                                                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="#198754" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                                                                                </Tooltip>
                                                                                              </span>}
                        </div>
                        { this.state.productID != this.state.userObject.get("username") && <button type="button" class="ml-auto py-1.5 px-3 mr-2 text-xs text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Follow</button>}
                      </div>
                      <div class="mt-2 text-slate-700">
                        Joined on { LuxonDateTime.fromISO(this.state.userObject.get("createdAt").toISOString()).toLocaleString()  }
                      </div>
                      <div class="mt-6 font-medium text-slate-900">
                        1200 <span class="mt-1 text-slate-700 font-light">followers</span>   ·   60 <span class="mt-1 text-slate-700 font-light">following</span>
                      </div>
                    </div>
        
        
                    <Tabs.Group
                      aria-label="Default tabs"
                      style="default"
                    >
                      <Tabs.Item
                        active
                        // icon={HiUserCircle}
                        title="Comments"
                      >
                        <p>
                          
                          { this.state.profileComments == null && <div class="flex mt-6">
                                                                    <div class="mx-auto">
                                                                      <Spinner aria-label="Default status example" />
                                                                    </div>
                                                                  </div> }

                          { this.state.profileComments && this.state.profileComments.map((commentItem) => (<div class="flex">
                                                                                                        <WebUiCommentItemView object={commentItem} appSettingsData={{productID: this.state.productID}} />
                                                                                                      </div>)) }

                        </p>
                      </Tabs.Item>
                      <Tabs.Item
                        // icon={MdDashboard}
                        title="Replies"
                      >
                        <p>
                          { this.state.profileReplies == null && <div class="flex mt-6">
                                                                    <div class="mx-auto">
                                                                      <Spinner aria-label="Default status example" />
                                                                    </div>
                                                                  </div> }

                          { this.state.profileReplies && this.state.profileReplies.map((commentItem) => (<div class="flex">
                                                                                                        <WebUiCommentItemView object={commentItem} appSettingsData={{productID: this.state.productID}} />
                                                                                                      </div>)) }
                        </p>
                      </Tabs.Item>
                      <Tabs.Item
                        // icon={HiAdjustments}
                        title="Reactions"
                      >
                        <p>
                          { this.state.profileReactions == null && <div class="flex mt-6">
                                                                    <div class="mx-auto">
                                                                      <Spinner aria-label="Default status example" />
                                                                    </div>
                                                                  </div> }
                        </p>
                      </Tabs.Item>
                    </Tabs.Group>
        
                  </div>
        
                </div>}

      </>
    );
  }
}
