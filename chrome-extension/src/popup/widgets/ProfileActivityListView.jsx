import '../assets/css/ProfileActivityListView.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import moment from 'moment';

export default class ProfileActivityListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  render(){
    return (
      <>

        { !this.props.objects && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div> }

        { this.props.objects && this.props.objects.length == 0 && <div class="text-center m-5 mt-2">
                    <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No profile activity here</span></p>
                    <p><span class="badge text-bg-light fst-italic shadow text-muted border border-warning">Get started by visiting a linkedin profile</span></p>
                  </div> }

        { this.props.objects && this.props.objects.length != 0 && <div>
                    { this.props.variant == "list" && <div class="list-group small mt-1 shadow-sm">
                                          {this.props.objects.map((profileActivityObject) => (<a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true" onClick={() => {this.props.showPost(profileActivityObject);}}>
                                            <div class="d-flex gap-2 w-100 justify-content-between">
                                              <div>
                                                <h6 class="mb-0">List group item heading</h6>
                                                <p class="mb-0 opacity-75">Some placeholder content in a paragraph.</p>
                                              </div>
                                              <small class="opacity-50 text-nowrap">{moment(profileActivityObject.date, moment.ISO_8601).fromNow()}</small>
                                            </div>
                                          </a>))} 
                                        </div>}
                     
                    { this.props.variant == "timeline" && <section class="py-5 mx-5 small">
                                        <ul class="timeline-with-icons">
                                          {this.props.objects.map((profileActivityObject) => (<li class="timeline-item mb-5">
                                              <span class="timeline-icon">
                                                <i class="fas fa-rocket text-primary fa-sm fa-fw"></i>
                                              </span>

                                              <h5 class="fw-bold">Our company starts its operations</h5>
                                              <p class="text-muted mb-2 fw-bold">{moment(profileActivityObject.date, moment.ISO_8601).fromNow()}</p>
                                              <p class="text-muted">
                                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit
                                                necessitatibus adipisci, ad alias, voluptate pariatur officia
                                                repellendus repellat inventore fugit perferendis totam dolor
                                                voluptas et corrupti distinctio maxime corporis optio?
                                              </p>
                                            </li>))} 
                                        </ul>
                                      </section>}
                  </div>}

      </>
    );
  }
}
