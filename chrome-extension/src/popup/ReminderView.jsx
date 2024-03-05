/*import './Reminders.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import { 
  saveCurrentPageTitle, 
  appParams,
  dbData,
} from "./Local_library";
import ReminderListView from "./widgets/ReminderListView";
import SearchInputView from "./widgets/SearchInputView";
import { db } from "../db";
import eventBus from "./EventBus";

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

      (async () => {

        const reminders = await db.reminders.toArray();

        await Promise.all (reminders.map (async reminder => {
          [reminder.profile] = await Promise.all([
            db.profiles.where('url').equals(reminder.url).first()
          ]);
        }));

        eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "reminderList", value: {list: reminders, action: "all" }});

      })();

    }

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.REMINDERS}/>

          { (this.props.globalData.reminderList 
                && (this.props.globalData.reminderList.list.length
                    || (!this.props.globalData.reminderList.list.length && this.props.globalData.reminderList.action == "search"))) 
              && <SearchInputView 
                    objectStoreName={dbData.objectStoreNames.REMINDERS}
                    globalData={this.props.globalData}  /> } 

          <div class="mt-3">
            <ReminderListView 
              objects={this.props.globalData.reminderList ? this.props.globalData.reminderList.list : null}  
            />
          </div>
        </div>
      </>
    );
  }
}
