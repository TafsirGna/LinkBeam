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
  highlightText,
} from "./Local_library";
import ReminderListView from "./widgets/Lists/ReminderListView";
import SearchInputView from "./widgets/SearchInputView";
import { db } from "../db";
import eventBus from "./EventBus";
import { CalendarIcon } from "./widgets/SVGs";

export default class ReminderView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      searchText: null,
    };
    
  }

  componentDidMount() {

    // Saving the current page title
    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.REMINDERS);

    if (!this.props.globalData.reminderList){
      setGlobalDataReminders(db, eventBus);
    }

  }

  onSearchTextChange = (data) => this.setState({searchText: data.searchText});

  getReminders = () => this.props.globalData.reminderList?.filter(reminder => (!this.state.searchText && true)
                                                                                || (this.state.searchText && (reminder.text.toLowerCase().includes(this.state.searchText.toLowerCase())
                                                                                                                || (reminder.object.fullName || reminder.object.profile.name).toLowerCase().includes(this.state.searchText.toLowerCase()))))
                                                          .map(reminder => {
                                                            
                                                            if (!this.state.searchText){
                                                              return reminder;
                                                            }

                                                            var result = {...reminder, text: highlightText((` ${reminder.text}`).slice(1), this.state.searchText)};
                                                            if (Object.hasOwn(result.object, "fullName")){
                                                              result.object = {...result.object, fullName: highlightText((` ${result.object.fullName}`).slice(1), this.state.searchText)};
                                                            }
                                                            else{
                                                              result.object = {...result.object, profile: {...result.object.profile, name: highlightText((` ${result.object.profile.name}`).slice(1), this.state.searchText)}};
                                                            }

                                                            return result;
                                                          });

  componentDidUpdate(prevProps, prevState){

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.REMINDERS}/>

          <SearchInputView 
            objectStoreName={dbData.objectStoreNames.REMINDERS}
            globalData={this.props.globalData}
            searchTextChanged={(data) => this.onSearchTextChange(data)}  />

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
              objects={this.getReminders()}  
            />
          </div>
        </div>
      </>
    );
  }
}
