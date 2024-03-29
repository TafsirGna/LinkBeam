/*import './ReminderListView.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import { AlertCircleIcon } from "./SVGs";

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
                  <AlertCircleIcon size="100" className="mb-3 text-muted" />
                  <p><span class="badge text-bg-primary fst-italic shadow">No reminder to display</span></p>
                </div>}

        { this.props.objects && this.props.objects.length > 0 && <div class="list-group small mt-1 shadow-sm">
              {this.props.objects.map((reminder, index) =>
                                        (<a key={index} class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                                            <div class="d-flex gap-2 w-100 justify-content-between">
                                              <div>
                                                <h6 class="mb-0 d-flex gap-2 w-100">
                                                  <a href={"/index.html?view=Profile&data=" + reminder.profile.url} target="_blank" class="text-decoration-none text-muted w-100">{reminder.profile.fullName}</a>
                                                  <span class="text-muted">·</span>
                                                  <OverlayTrigger
                                                    placement="top"
                                                    overlay={<ReactTooltip id="tooltip1">Visit Linkedin Page</ReactTooltip>}
                                                  >
                                                    <a href={reminder.profile.url} target="_blank" class="">
                                                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                                    </a>
                                                  </OverlayTrigger>
                                                </h6>
                                                <p class="mb-0 opacity-75 fst-italic" dangerouslySetInnerHTML={{__html: reminder.text}}></p>
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
