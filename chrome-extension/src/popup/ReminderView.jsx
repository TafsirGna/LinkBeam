/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

/*import './Reminders.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import { 
  saveCurrentPageTitle, 
  appParams,
  dbData,
  setGlobalDataReminders,
} from "./Local_library";
import ReminderListView from "./widgets/ReminderListView";
import SearchInputView from "./widgets/SearchInputView";
import { db } from "../db";
import eventBus from "./EventBus";
import { CalendarIcon } from "./widgets/SVGs";

export default class ReminderView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
    
  }

  componentDidMount() {

    // Saving the current page title
    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.REMINDERS);

    if (!this.props.globalData.reminderList){
      setGlobalDataReminders(db, eventBus);
    }

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.REMINDERS}/>

          { (this.props.globalData.reminderList 
                && (this.props.globalData.reminderList.list.length
                    || (!this.props.globalData.reminderList.list.length 
                          && this.props.globalData.reminderList.action == "search"))) 
              && <SearchInputView 
                    objectStoreName={dbData.objectStoreNames.REMINDERS}
                    globalData={this.props.globalData}  /> } 

          <span class="handy-cursor border shadow rounded p-1">
            <a 
              title="Show on calendar" 
              class="mx-1 text-muted"
              href="/index.html?view=Calendar&dataType=Reminders" 
              target="_blank">
              <CalendarIcon 
                size="16"/>
            </a>
          </span>

          <div class="mt-2">
            <ReminderListView 
              objects={this.props.globalData.reminderList ? this.props.globalData.reminderList.list : null}  
            />
          </div>
        </div>
      </>
    );
  }
}
