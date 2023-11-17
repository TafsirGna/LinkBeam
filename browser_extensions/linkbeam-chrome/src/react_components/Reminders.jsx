/*import './Reminders.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
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

export default class Reminders extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      reminderList: null,
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onRemindersDataReceived = this.onRemindersDataReceived.bind(this);
    
  }

  componentDidMount() {

    this.listenToMessages();

    if (this.props.globalData.reminderList){
      this.setState({
        reminderList: this.props.globalData.reminderList,
      });
    }

    // Saving the current page title
    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.REMINDERS);

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.REMINDERS, {context: appParams.COMPONENT_CONTEXT_NAMES.REMINDERS});

  }

  onRemindersDataReceived(message, sendResponse){

    var context = message.data.objectData.context; 
    if (context != appParams.COMPONENT_CONTEXT_NAMES.REMINDERS){
      return;
    }

    // acknowledge receipt
    ack(sendResponse);

    var reminders = message.data.objectData;
    this.setState({
      reminderList: reminders,
    });

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.REMINDERS].join(messageParams.separator), 
        callback: this.onRemindersDataReceived
      },
    ]);


  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>
          <div class="mt-3">
            <ReminderListView objects={this.state.reminderList}/>
          </div>
        </div>
      </>
    );
  }
}
