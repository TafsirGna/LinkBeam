/*import './WebUiProfilePage.css'*/
import React from 'react';
import { 
  appParams,
} from "../react_components/Local_library";
import { Spinner, Tooltip } from 'flowbite-react';
import { DateTime as LuxonDateTime } from "luxon";
import Parse from 'parse/dist/parse.min.js';
// import "./styles.min.css";

export default class WebUiProfilePage extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      userObject: null,
    };
  }

  componentDidMount() {

    this.fetchUserObject();

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
      this.setState({userObject: user});

    } catch (error) {
      console.error('Error while fetching User', error);
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
        
                    <div class="pointer-events-auto mt-14 mb-3 rounded-lg bg-white p-4 text-[0.8125rem] leading-5 shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
                      <div class="flex justify-between">
                        <div class="font-medium text-slate-900">
                          { this.state.userObject.get("username") }
                          { this.state.userObject.get("accountVerified") == true && <span>
                                                                                                <Tooltip
                                                                                                      content="Verified user"
                                                                                                    >
                                                                                                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="#198754" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                                                                                </Tooltip>
                                                                                              </span>}
                        </div>
                        <button type="button" class="ml-auto py-1.5 px-3 mr-2 text-xs text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Follow</button>
                      </div>
                      <div class="mt-2 text-slate-700">
                        Joined on { LuxonDateTime.fromISO(this.state.userObject.get("createdAt").toISOString()).toLocaleString()  }
                      </div>
                      <div class="mt-3 font-medium text-slate-900">
                        1200 <span class="mt-1 text-slate-700 font-light">followers</span>   ·   60 <span class="mt-1 text-slate-700 font-light">following</span>
                      </div>
                    </div>
        
        
                    <div class="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
                      <ul class="flex flex-wrap -mb-px">
                        <li class="mr-2">
                            <a href="#" class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">Comments</a>
                        </li>
                        <li class="mr-2">
                            <a href="#" class="inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500" aria-current="page">Replies</a>
                        </li>
                        <li class="mr-2">
                            <a href="#" class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">Reactions</a>
                        </li>
                        {/*<li class="mr-2">
                            <a href="#" class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">Contacts</a>
                        </li>
                        <li>
                            <a class="inline-block p-4 text-gray-400 rounded-t-lg cursor-not-allowed dark:text-gray-500">Disabled</a>
                        </li>*/}
                      </ul>
                    </div>
        
                    <div>
                    </div>
        
                  </div>
        
                </div>}

      </>
    );
  }
}
