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

import '../assets/css/ActivityListView.css';
import React from 'react';
import { OverlayTrigger, Tooltip, Popover } from "react-bootstrap";
import { DateTime as LuxonDateTime } from "luxon";
import default_user_icon from '../../assets/user_icons/default.png';
import heart_icon from '../../assets/heart_icon.png';
import share_icon from '../../assets/share_icon.png';
import newspaper_icon from '../../assets/newspaper_icon.png';
import sorry_icon from '../../assets/sorry_icon.png';
import { PictureIcon } from "./SVGs";
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { db } from "../../db";
import { 
  appParams,
} from "../Local_library";


export default class ActivityListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      offCanvasShow: false,
      selectedPost: null,
      imageLoaded: false,
    };

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevState.selectedPost != this.state.selectedPost){
      this.setState({imageLoaded: false});
    }

  }

  handleOffCanvasClose = () => {
    this.setState({offCanvasShow: false, selectedPost: null});
  };

  handleOffCanvasShow = (post) => {
    this.setState({selectedPost: post, offCanvasShow: true});
  };

  render(){
    return (
      <>

        { !this.props.objects 
            && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div> }

        { this.props.objects 
            && <div>

            { this.props.objects.length == 0 
                && <div class="text-center m-5 mt-2">
                    <img 
                      src={sorry_icon} 
                      width="80" />
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No activity to display</span></p>
                  </div> }

            { this.props.objects.length != 0 
                && <div>
                    { this.props.variant == "list" 
                        && <div>
                              <div class="list-group small mt-1 shadow-sm">
                                { this.props.objects.map((object) => (<a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true" href={ !object.link ? null : object.link } target="_blank">
                                  <div class="d-flex gap-2 w-100 justify-content-between">
                                    <div>
                                      <p class="mb-1">
                                        <span 
                                          class="badge align-items-center p-1 pe-3 text-secondary-emphasis rounded-pill">
                                          <img 
                                            class="rounded-circle me-1" 
                                            width="24" 
                                            height="24" 
                                            src={ object.user.picture } 
                                            alt=""/>
                                          { object.user.name }
                                          {/**/}
                                        </span>
                                      </p>
                                      <p class="mb-0 opacity-75 border p-2 rounded shadow" dangerouslySetInnerHTML={{__html: object.text}}></p>
                                    </div>
                                    { object.date && <small class="opacity-50 text-nowrap">{LuxonDateTime.fromISO(object.date).toRelative()}</small>}
                                  </div>
                                </a>))} 
                              </div>
                            </div>}
                     
                    { this.props.variant == "timeline"
                        && <section class="py-4 mx-4 small">
                              <ul class="timeline-with-icons">
                                {this.props.objects.map((object) => (<li class="timeline-item mb-5">
                                    <span class="timeline-icon">
                                      <i class="fas fa-rocket text-primary fa-sm fa-fw"></i>
                                    </span>

                                    <h5 class="fw-bold">
                                      <span class="shadow-sm badge align-items-center p-1 pe-3 text-secondary-emphasis bg-secondary-subtle border border-secondary-subtle rounded-pill">
                                        <img 
                                          class="rounded-circle me-1" 
                                          width="24" 
                                          height="24" 
                                          src={ object.user.picture } 
                                          alt=""/>
                                        { object.user.name }
                                        {/*{object.action 
                                              && <OverlayTrigger
                                                          placement="top"
                                                          overlay={<Tooltip id="tooltip1">{(profileActivityObject.action.toLowerCase().indexOf("liked") != -1 || profileActivityObject.action.toLowerCase().indexOf("aimé") != -1) ? "liked" : ((profileActivityObject.action.toLowerCase().indexOf("shared") != -1 || profileActivityObject.action.toLowerCase().indexOf("partagé") != -1) ? "shared" : null)}</Tooltip>}
                                                        >
                                                  <span>
                                                    { (profileActivityObject.action.toLowerCase().indexOf("liked") != -1 || profileActivityObject.action.toLowerCase().indexOf("aimé") != -1) &&  <img class="mx-1" width="18" height="18" src={heart_icon} alt=""/>}
                                                    { (profileActivityObject.action.toLowerCase().indexOf("shared") != -1 || profileActivityObject.action.toLowerCase().indexOf("partagé") != -1) &&  <img class="mx-2" width="16" height="16" src={share_icon} alt=""/>}
                                                  </span>
                                                </OverlayTrigger>}*/}
                                      </span>
                                    </h5>
                                    <p class="text-muted mb-2 fw-bold">
                                      <span class="small">
                                        Added {LuxonDateTime.fromISO(object.date).toRelative()}
                                      </span>
                                      <span class="border shadow-sm rounded p-1 mx-2">
                                        <a 
                                          title="See post on linkedin" 
                                          class="mx-1" 
                                          href={ object.link }>
                                          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                        </a>
                                        <span title="Image" class="mx-1">
                                          <span class="handy-cursor" onClick={() => {this.handleOffCanvasShow(object);}}>
                                            <PictureIcon size="15" className=""/>
                                          </span>
                                        </span>
                                      </span>
                                    </p>
                                    <p class="text-muted border rounded p-2 shadow-sm">
                                      { object.text }
                                    </p>
                                  </li>))} 
                              </ul>


                              <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
                                <Offcanvas.Header closeButton>
                                  <Offcanvas.Title>Post's Illustration</Offcanvas.Title>
                                </Offcanvas.Header>
                                <Offcanvas.Body>
                                  <div>

                                    { (!this.state.selectedPost || (this.state.selectedPost && !this.state.imageLoaded)) 
                                        && <div class="text-center">
                                              <div class="mb-5 mt-3"><
                                                div class="spinner-border text-primary" role="status"></div>
                                                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                                                </div>
                                              </div> }

                                    { (this.state.selectedPost) 
                                        && <img 
                                              src={(this.state.selectedPost.picture && this.state.selectedPost.picture != "") 
                                                      ? this.state.selectedPost.picture 
                                                      : newspaper_icon} 
                                              class={"img-thumbnail shadow-lg"}
                                              width="350"
                                              alt="..."
                                              onLoad={() => {this.setState({imageLoaded: true});}} 
                                              onerror={() => {console.log("Error loading cover image!")}} />}
                                  </div>
                                </Offcanvas.Body>
                              </Offcanvas>

                            </section>}
                  </div>}
              </div>}

      </>
    );
  }
}
