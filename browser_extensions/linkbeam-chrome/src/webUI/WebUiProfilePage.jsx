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
import WebUiCommentReactionView from "./widgets/WebUiCommentReactionView";
import app_full_logo from '../assets/app_full_logo.png';
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
      followersCount: 0,
      followingCount: 0,
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onSettingsDataReceived = this.onSettingsDataReceived.bind(this);
  }

  componentDidMount() {

    this.listenToMessages();

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_OBJECT, dbData.objectStoreNames.SETTINGS, ["productID"]);

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

  async fetchFollowersCount(){

    const query = new Parse.Query("UserRelation");
    // You can also query by using a parameter of an object
    query.equalTo("following", Parse.User.current());
    // query.containsAll('following', [this.state.userObject.getUsername()]);
    const results = await query.find();
    try {

      this.setState({followersCount: results.length});

    } catch (error) {
      console.error('Error while fetching Follower Count', error);
    }

  }

  async fetchFollowingCount(){

    const query = new Parse.Query("UserRelation");
    // You can also query by using a parameter of an object
    query.equalTo("user", Parse.User.current());
    const results = await query.find();
    try {

      this.setState({followingCount: results.length});

    } catch (error) {
      console.error('Error while fetching Following Count', error);
    }

  }

  async fetchUserObject(){

    const User = new Parse.User();
    const query = new Parse.Query(User);
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
        this.fetchFollowersCount();
        this.fetchProfileComments();
        this.fetchProfileReplies();
        this.fetchProfileReactions();
      });

    } catch (error) {
      console.error('Error while fetching User', error);
    }

  }

  async fetchProfileComments(){

    const Comment = Parse.Object.extend('Comment');
    const query = new Parse.Query(Comment);
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

  async followUser(){

    const myNewObject = new Parse.Object('UserRelation');
    myNewObject.set('user', Parse.User.current());
    myNewObject.set('following', this.state.userObject);
    try {
      const result = await myNewObject.save();
      // Access the Parse Object attributes using the .GET method
      console.log('UserRelation created', result);
    } catch (error) {
      console.error('Error while creating UserRelation: ', error);
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

    const query = new Parse.Query('Reaction');
    // You can also query by using a parameter of an object
    query.equalTo('user', this.state.userObject);
    const results = await query.find();
    try {

      this.setState({profileReactions: results});

    } catch (error) {
      console.error('Error while fetching Profile Reactions', error);
    }

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

                    <div class="flex mt-14">
                      <div class="mx-auto">
                        <img src={app_full_logo} alt="twbs" width="40" height="40" class="mx-auto flex-shrink-0"/>
                        <span class="text-lg">{appParams.appName}</span>
                      </div>
                    </div>
        
                    <div class="shadow-md pointer-events-auto mt-4 mb-8 rounded-lg bg-white p-4 text-[0.8125rem] leading-5 ring-1 ring-slate-700/10">

                      <div class="flex justify-between items-center">
                        <div class="flex">
                          <img src={user_icon} alt="twbs" width="40" height="40" class="mx-auto flex-shrink-0"/>
                        </div>
                        <div class="font-medium text-slate-900 ml-4 mr-auto">
                          { this.state.productID == this.state.userObject.get("username") ? "You" : this.state.userObject.get("username") }
                          { this.state.userObject.get("accountVerified") == true && <span>
                                                                                                <Tooltip
                                                                                                      content="Verified user"
                                                                                                    >
                                                                                                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="#198754" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                                                                                </Tooltip>
                                                                                              </span>}
                        </div>
                        { this.state.productID != this.state.userObject.get("username") && <button type="button" onClick={ () => {this.followUser()} } class="ml-auto py-1.5 px-3 mr-2 text-xs text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Follow</button>}
                      </div>
                      <div class="mt-2 text-slate-700">
                        Joined on { LuxonDateTime.fromISO(this.state.userObject.get("createdAt").toISOString()).toLocaleString({ month: 'long', year: 'numeric' })  }
                      </div>
                      <div class="mt-6 font-medium text-slate-900">
                        { this.state.followersCount } <span class="mt-1 text-slate-700 font-light">followers</span>   ·   { this.state.followingCount } <span class="mt-1 text-slate-700 font-light">following</span>
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
                                                                                                        <WebUiCommentItemView object={commentItem} appSettingsData={{productID: this.state.productID}} context="profile" />
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
                                                                                                        <WebUiCommentItemView object={commentItem} appSettingsData={{productID: this.state.productID}} context="profile" />
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

                          { this.state.profileReactions && this.state.profileReactions.map((commentReaction) => (<div class="flex">
                                                                                                        <WebUiCommentReactionView object={commentReaction} appSettingsData={{productID: this.state.productID}} />
                                                                                                      </div>)) }

                        </p>
                      </Tabs.Item>
                    </Tabs.Group>
        
                  </div>
        
                </div>}

      </>
    );
  }
}
