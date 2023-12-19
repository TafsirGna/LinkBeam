/*import './Reminders.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import { 
  saveCurrentPageTitle, 
  sendDatabaseActionMessage,
  ack,
  startMessageListener, 
  messageParams,
  dbData,
  appParams
} from "./Local_library";
import ReminderListView from "./widgets/ReminderListView";
import SearchInputView from "./widgets/SearchInputView";

export default class ReminderView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
    
  }

  componentDidMount() {

    // Saving the current page title
    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.REMINDERS);

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.REMINDERS, { context: appParams.COMPONENT_CONTEXT_NAMES.REMINDERS });

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.REMINDERS}/>

          <SearchInputView objectStoreName={dbData.objectStoreNames.REMINDERS}/>

          <div class="mt-3">
            <ReminderListView objects={this.props.globalData.reminderList}/>
          </div>
        </div>
      </>
    );
  }
}
