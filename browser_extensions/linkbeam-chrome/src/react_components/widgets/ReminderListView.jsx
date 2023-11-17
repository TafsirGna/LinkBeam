/*import './ReminderListView.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

export default class ReminderListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){


  }

  render(){
    return (
      <>

        { !this.props.objects && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                  {/*<span class="visually-hidden">Loading...</span>*/}
                </div>
                <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
              </div>
            </div>}

        { this.props.objects && this.props.objects.length == 0 && <div class="text-center m-5 mt-4">
                  <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <p><span class="badge text-bg-primary fst-italic shadow">No reminders yet</span></p>
                </div>}

        { this.props.objects && this.props.objects.length != 0 && <div class="list-group small mt-1 shadow">
              {this.props.objects.map((reminder, index) =>
                                        (<a key={index} href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                                            <div class="d-flex gap-2 w-100 justify-content-between">
                                              <div>
                                                <h6 class="mb-0">{reminder.profile.fullName}</h6>
                                                <p class="mb-0 opacity-75">{reminder.text}</p>
                                              </div>
                                              <small class="opacity-50 text-nowrap">{moment(reminder.createdOn, moment.ISO_8601).fromNow()}</small>
                                            </div>
                                          </a>)
                                      )}
            </div>}

      </>
    );
  }
}
