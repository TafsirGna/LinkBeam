import '../assets/css/ProfileActivityListView.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip, Popover } from "react-bootstrap";
import moment from 'moment';
import default_user_icon from '../../assets/user_icons/default.png';
import heart_icon from '../../assets/heart_icon.png';
import share_icon from '../../assets/share_icon.png';
import newspaper_icon from '../../assets/newspaper_icon.png';
import { PictureIcon, AlertCircleIcon } from "./SVGs";
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';


export default class ProfileActivityListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      posts: null,
      offCanvasShow: false,
      selectedPost: null,
      imageLoaded: false,
    };

    this.setPosts = this.setPosts.bind(this);
  }

  componentDidMount() {

    this.setPosts();

  }

  componentDidUpdate(prevProps, prevState){

    // everytime the view choice is changed, the chart is reset
    if (prevProps.objects != this.props.objects){
      this.setPosts();
    }

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

  setPosts(){

    if (!this.props.objects){
      return;
    }

    var posts = [];
    for (var profile of this.props.objects){

      if (!profile.activity) { continue; }

      for (var post of profile.activity){
        post["date"] = profile.date;
        post["profile"] = {
          fullName: profile.fullName,
          avatar: profile.avatar,
        }
        posts.push(post);
      }
      
    }
    this.setState({posts: posts});

  }

  render(){
    return (
      <>

        { !this.state.posts && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div> }

        { this.state.posts && this.state.posts.length == 0 && <div class="text-center m-5 mt-2">
                    <AlertCircleIcon size="100" className="text-muted"/>
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No profile activity here</span></p>
                    <p><span class="badge text-bg-light fst-italic shadow text-muted border border-warning">Get started by visiting a linkedin profile</span></p>
                  </div> }

        { this.state.posts && this.state.posts.length != 0 && <div>
                    { this.props.variant == "list" && <div class="list-group small mt-1 shadow-sm">
                                          {this.state.posts.map((profileActivityObject) => (<a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true" onClick={() => {this.props.showPost(profileActivityObject);}}>
                                            <div class="d-flex gap-2 w-100 justify-content-between">
                                              <div>
                                                <p class="mb-1">
                                                  <span class="badge align-items-center p-1 pe-3 text-secondary-emphasis rounded-pill">
                                                    <img class="rounded-circle me-1" width="24" height="24" src={profileActivityObject.profile.avatar ? profileActivityObject.profile.avatar : default_user_icon} alt=""/>
                                                    {profileActivityObject.profile.fullName}
                                                    { profileActivityObject.action && <OverlayTrigger
                                                                                        placement="top"
                                                                                        overlay={<Tooltip id="tooltip1">{profileActivityObject.action.toLowerCase().indexOf("liked") != -1 ? "liked" : (profileActivityObject.action.toLowerCase().indexOf("shared") != -1 ? "shared" : null)}</Tooltip>}
                                                                                      >
                                                                                      <span>
                                                                                        { (profileActivityObject.action.toLowerCase().indexOf("liked") != -1) &&  <img class="mx-1" width="18" height="18" src={heart_icon} alt=""/>}
                                                                                        { (profileActivityObject.action.toLowerCase().indexOf("shared")  != -1) &&  <img class="mx-2" width="16" height="16" src={share_icon} alt=""/>}
                                                                                      </span>
                                                                                      </OverlayTrigger>}
                                                  </span>
                                                </p>
                                                <p class="mb-0 opacity-75 border p-2 rounded shadow">{profileActivityObject.title}</p>
                                              </div>
                                              <small class="opacity-50 text-nowrap">{moment(profileActivityObject.date, moment.ISO_8601).fromNow()}</small>
                                            </div>
                                          </a>))} 
                                        </div>}
                     
                    { this.props.variant == "timeline" && <section class="py-4 mx-4 small">
                                        <ul class="timeline-with-icons">
                                          {this.state.posts.map((profileActivityObject) => (<li class="timeline-item mb-5">
                                              <span class="timeline-icon">
                                                <i class="fas fa-rocket text-primary fa-sm fa-fw"></i>
                                              </span>

                                              <h5 class="fw-bold">
                                                <span class="shadow-sm badge align-items-center p-1 pe-3 text-secondary-emphasis bg-secondary-subtle border border-secondary-subtle rounded-pill">
                                                  <img class="rounded-circle me-1" width="24" height="24" src={profileActivityObject.profile.avatar ? profileActivityObject.profile.avatar : default_user_icon} alt=""/>
                                                  {profileActivityObject.profile.fullName}
                                                  {profileActivityObject.action && <OverlayTrigger
                                                                                      placement="top"
                                                                                      overlay={<Tooltip id="tooltip1">{profileActivityObject.action.toLowerCase().indexOf("liked") != -1 ? "liked" : (profileActivityObject.action.toLowerCase().indexOf("shared") != -1 ? "shared" : null)}</Tooltip>}
                                                                                    >
                                                                                      <span>
                                                                                        { (profileActivityObject.action.toLowerCase().indexOf("liked") != -1) &&  <img class="mx-1" width="18" height="18" src={heart_icon} alt=""/>}
                                                                                        { (profileActivityObject.action.toLowerCase().indexOf("shared") != -1) &&  <img class="mx-2" width="16" height="16" src={share_icon} alt=""/>}
                                                                                      </span>
                                                                                    </OverlayTrigger>}
                                                </span>
                                              </h5>
                                              <p class="text-muted mb-2 fw-bold">
                                                <span>
                                                  Added {moment(profileActivityObject.date, moment.ISO_8601).fromNow()}
                                                </span>
                                                <span class="border shadow-sm rounded p-1 mx-2">
                                                  <a title="See post on linkedin" class="mx-1" href={profileActivityObject.link}>
                                                    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                                  </a>
                                                  <span title="Image" class="mx-1">
                                                    <span class="handy-cursor" onClick={() => {this.handleOffCanvasShow(profileActivityObject);}}>
                                                      <PictureIcon size="15" className=""/>
                                                    </span>
                                                  </span>
                                                </span>
                                              </p>
                                              <p class="text-muted border rounded p-2 shadow-sm">
                                                {profileActivityObject.title}
                                              </p>
                                            </li>))} 
                                        </ul>


                                        <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
                                          <Offcanvas.Header closeButton>
                                            <Offcanvas.Title>Post's Illustration</Offcanvas.Title>
                                          </Offcanvas.Header>
                                          <Offcanvas.Body>
                                            <div>

                                              { (!this.state.selectedPost || (this.state.selectedPost && !this.state.imageLoaded)) && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                                                                                </div>
                                                                                <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                                                                              </div>
                                                                            </div>}

                                              { (this.state.selectedPost) && <img 
                                                                                              src={(this.state.selectedPost.picture && this.state.selectedPost.picture != "") ? this.state.selectedPost.picture : newspaper_icon} 
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

      </>
    );
  }
}
