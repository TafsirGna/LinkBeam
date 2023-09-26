import { Spinner, Tooltip } from 'flowbite-react';
import { DateTime as LuxonDateTime } from "luxon";
import React, { useState } from 'react';
import { appParams, messageParams } from "../../react_components/Local_library";
import user_icon from '../../assets/user_icon.png';
import Parse from 'parse/dist/parse.min.js';


export default function CommentItemView(props) {

  const [upVoting, setUpVoting] = useState(false);
  const [downVoting, setDownVoting] = useState(false);
  const [repliesCount, setRepliesCount] = useState(null);

  const fetchRepliesCount = () => {
    
    (async () => {
      const query = new Parse.Query('Comment');
      query.equalTo('parentId', props.object.id);

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

  fetchRepliesCount();

  const showSpinner = (property) => {


    if (property == "upvotes"){
      setUpVoting(true);
    }

    if (property == "downvotes"){
      setDownVoting(true);
    }

  }

  const hideSpinner = (property) => {


    if (property == "upvotes"){
      setUpVoting(false);
    }

    if (property == "downvotes"){
      setDownVoting(false);
    }

  }

  const updateCommentItemVote = (property) => {

    if ((props.object.get("upvotes") != null && props.object.get("upvotes").indexOf(props.appSettingsData.productID) != -1)
          || (props.object.get("downvotes") != null && props.object.get("downvotes").indexOf(props.appSettingsData.productID) != -1)){
      return;
    }

    (async () => {
      // const query = new Parse.Query('Comment');
      showSpinner(property);

      // here you put the objectId that you want to update
      // const object = await query.get(objectId);
      // object.set(property, value);

      var votes = props.object.get(property);

      if (votes == null){
        props.object.set(property, [props.appSettingsData.productID]);
      }
      else{
        votes.push(props.appSettingsData.productID);
        props.object.set(property, votes);
      }

      try {
        // const response = await object.save();
        const response = await props.object.save();

        console.log('CommentItem updated', response);
        hideSpinner(property)

      } catch (error) {
        console.error('Error while updating ', error);
      }

    })();

  }

  const getTooltipContent = () => {
    
  }

  return (

    <>
      <div class="flex items-center p-4">
        <img src={user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
        <div class="ml-4 flex-auto">
          <div class="font-medium inline-flex items-center">
            {props.object.get("createdBy")}
            <span>
              <Tooltip
                    content="Verified user"
                  >
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="#198754" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-2 ml-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </Tooltip>
            </span>
            · 
            <span class="font-light text-xs ml-2">{LuxonDateTime.fromISO(props.object.get("createdAt").toISOString()).toRelative()}</span>
          </div>
          <div class="mt-1 text-slate-700 text-sm">
            {props.object.get("text")}
          </div>
          <div class="mt-2">
            
            <span onClick={() => {updateCommentItemVote("upvotes")}} class="handy-cursor rounded-full bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-500">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-1"><polyline points="18 15 12 9 6 15"></polyline></svg>
              { !upVoting && <span>{ props.object.get("upvotes") == null ? "0" : props.object.get("upvotes").length }</span>}
              { upVoting && <Spinner
                                aria-label="Extra small spinner example"
                                className="ml-1"
                                size="xs"
                              />}
            </span>
            
            <span class="inline-flex">
              <Tooltip
                  content={ !downVoting ? "You and 3 users" : "" }
                >
                <span onClick={() => {updateCommentItemVote("downvotes")}} class="handy-cursor rounded-full bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-400">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-1"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  { 
                    !downVoting &&  
                                      <span>
                                        { props.object.get("downvotes") == null ? "0" : props.object.get("downvotes").length }
                                      </span>
                  }
                  { 
                    downVoting && <Spinner
                                    aria-label="Extra small spinner example"
                                    className="ml-1"
                                    size="xs"
                                  />
                  }
                </span>
              </Tooltip>
            </span>
            <span onClick={() => {props.handleCommentRepliesClick(props.object)}} class="handy-cursor rounded-full bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-400">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mr-1"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
              {repliesCount == null && <Spinner
                                          aria-label="Extra small spinner example"
                                          className="ml-1"
                                          size="xs"
                                        />}
              {repliesCount != null && <span>{repliesCount}</span>}
            </span>

          </div>
        </div>
        {/*<div class="pointer-events-auto ml-4 flex-none rounded-md px-2 py-[0.3125rem] font-medium text-slate-700 shadow-sm ring-1 ring-slate-700/10 hover:bg-slate-50">
          View
        </div>*/}
      </div>

    </>

  );

}

