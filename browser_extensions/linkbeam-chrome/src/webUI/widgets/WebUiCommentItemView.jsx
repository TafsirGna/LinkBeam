import { Spinner, Tooltip } from 'flowbite-react';
import { DateTime as LuxonDateTime } from "luxon";
import React, { useState } from 'react';
import { appParams, messageParams, logInParseUser, registerParseUser } from "../../react_components/Local_library";
import default_user_icon from '../../assets/user_icons/default.png';
import Parse from 'parse/dist/parse.min.js';
import { genPassword } from "../../.private_library";


export default function CommentItemView(props) {

  const [voting, setVoting] = useState(false);
  const [reactions, setReactions] = useState(null);
  const [pageProfileObject, setPageProfileObject] = useState(null);
  const [repliesCount, setRepliesCount] = useState(null);

  const fetchPageProfileObject = () => {
    
    (async () => {
      const PageProfile = Parse.Object.extend('PageProfile');
      const query = new Parse.Query(PageProfile);
      // You can also query by using a parameter of an object
      query.equalTo('objectId', props.object.get("pageProfile").id);
      try {
        const results = await query.find();
        /*for (const object of results) {
          // Access the Parse Object attributes using the .GET method
          const url = object.get('url')
          console.log(url);
        }*/

        setPageProfileObject(results[0]);

      } catch (error) {
        console.error('Error while fetching PageProfile', error);
      }
    })();

  }

  const fetchRepliesCount = () => {
    
    (async () => {
      const query = new Parse.Query('Comment');
      query.equalTo('parentObject', props.object);

      try {
        // Uses 'count' instead of 'find' to retrieve the number of objects
        const count = await query.count();
        setRepliesCount(count);
        console.log(`ParseObjects found: ${count}`);
      } catch (error) {
        console.log(`Error: ${error}`);
      }
    })();

  }

  const fetchReactions = () => {
    
    (async () => {
      const query = new Parse.Query('Reaction');
      query.equalTo('comment', props.object);

      try {
        const results = await query.find();
        setReactions(results);
        console.log('ParseObjects found: ', results);
      } catch (error) {
        console.log(`Error: ${error}`);
      }
    })();

  }

  fetchRepliesCount();

  fetchReactions();

  fetchPageProfileObject();

  const storeReaction = (action) => {

    if (Parse.User.current() == null){

      // log in to the parse
      logInParseUser(
        Parse,
        props.appSettingsData.productID,
        genPassword(props.appSettingsData.productID),
        (parseUser) => {

          storeReaction(action);

        },
        () => {

          // if (error 404)

          registerParseUser(
            Parse, 
            props.appSettingsData.productID,
            genPassword(props.appSettingsData.productID),
            (parseUser) => {

              storeReaction(action);

            },
            () => {
              alert("An error ocurred when registering parse user. Try again later!");
            },
          );
        }
      );

      return;

    }

    // check that this user hasn't voted this comment yet

    for (let index in reactions){
      var reaction = reactions[index];
      if (reaction.get("user").id == Parse.User.current().id){
        return;
      }
    }

    (async () => {

      setVoting(true);

      const myNewObject = new Parse.Object('Reaction');
      myNewObject.set('comment', props.object);
      myNewObject.set('action', action);
      myNewObject.set('user', Parse.User.current());
      try {
        const result = await myNewObject.save();
        // Access the Parse Object attributes using the .GET method
        setVoting(false);
        console.log('Reaction created', result);
      } catch (error) {
        console.error('Error while creating Reaction: ', error);
      }

    })();

  }

  const reactionsCountTooltipText = () => {
    if (reactions == null || reactions.length == 0){
      return "No reactions";
    }

    var text = "";
    for (let index in reactions){
      var reaction = reactions[index];
      if (reaction.get("user").id == Parse.User.current().id){
        text += "You";
      }
    }

    if (reactions.length > 1){
      text += " and " + (reactions.length - 1) + " reacted";
    }
    else{
      text += " reacted";
    }

    return text;
  }

  return (

    <>
      <div class="flex items-center p-4">
        <img src={default_user_icon} alt="twbs" width="40" height="40" class="rounded-circle flex-shrink-0"/>
        <div class="ml-4 flex-auto">
          <div class="font-medium inline-flex items-center">
            <a class="mr-3" href={ props.appSettingsData.productID == props.object.get("createdBy").getUsername() ? "#" :  "/web_ui.html?web-ui-page-profile-id="+props.object.get("createdBy").getUsername() } target="_blank">
              { props.appSettingsData.productID == props.object.get("createdBy").getUsername() ? "You" : props.object.get("createdBy").getUsername() }
            </a>
            { props.object.get("createdBy").get("accountVerified") == true && <span>
                          <Tooltip
                                content="Verified user"
                              >
                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="#198754" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          </Tooltip>
                        </span>}
            { (props.object.get("parentObject") != null && props.object.get("parentObject").get("createdBy") == props.object.get("createdBy")) && <span class="bg-blue-100 text-blue-800 text-xs font-medium mx-1 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Author</span>}
            · 
            <span class="font-light text-xs ml-2">{LuxonDateTime.fromISO(props.object.get("createdAt").toISOString()).toRelative()}</span>
          </div>
          <div class="mt-1 text-slate-700 text-sm">
            {props.object.get("text")}
          </div>
          <div class="mt-2">
            
            <span class="shadow-md rounded-full bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-500">
              <span title="Upvote" onClick={() => {storeReaction("upvote")}} class="handy-cursor"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-1"><polyline points="18 15 12 9 6 15"></polyline></svg></span>
              <span class="px-1 inline-flex">
                { !voting && <Tooltip
                                content={ reactionsCountTooltipText() }
                              >
                              <span>
                                { reactions == null ? "0" : reactions.length }
                              </span>
                            </Tooltip>}
                { voting && <Spinner
                                  aria-label="Extra small spinner example"
                                  className="ml-1"
                                  size="xs"
                                />}
              </span>
              <span title="Downvote" onClick={() => {storeReaction("downvote")}} class="handy-cursor"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-1"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
            </span>
            { (props.object.get("parentObject") == null && props.handleCommentRepliesClick != null) && <span onClick={() => {props.handleCommentRepliesClick(props.object)}} class="shadow-md handy-cursor rounded-full bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-400">
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-1"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                          {repliesCount == null && <Spinner
                                                      aria-label="Extra small spinner example"
                                                      className="ml-1"
                                                      size="xs"
                                                    />}
                          {repliesCount != null && <span>{repliesCount}</span>}
                        </span>}

            { (props.context == "profile" && pageProfileObject) && <a title="See in profile" target="_blank" href={ pageProfileObject.get("url") + "?linkbeam-page-section=" + props.object.get("pageSection").id } class="shadow-md handy-cursor rounded-full bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-400">
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </a>}

          </div>
        </div>
        {/*<div class="pointer-events-auto ml-4 flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
          View
        </div>*/}
      </div>

    </>

  );

}

