/*import './Reminders.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import { saveCurrentPageTitle, sendDatabaseActionMessage } from "./Local_library";

export default class Reminders extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      reminderList: null,
      reminderListTags: null,
    };
  }

  componentDidMount() {

    // Saving the current page title
    saveCurrentPageTitle("Reminders");

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle="Settings"/>
          <div class="mt-3">
            {this.state.reminderList == null && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                  </div>
                </div>}

            {this.state.reminderList != null && this.state.reminderList.length == 0 && <div class="text-center m-5 mt-4">
                      <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      <p><span class="badge text-bg-primary fst-italic shadow">No reminders yet</span></p>
                    </div>}

            {this.state.reminderList != null && this.state.reminderList.length != 0 && <ul class="list-unstyled mb-0 rounded shadow p-2">
                  {this.state.reminderListTags}
                </ul>}
          </div>
        </div>
      </>
    );
  }
}
