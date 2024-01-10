/*import './ProfileActivityView.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import ProfileActivityListView from "./widgets/ProfileActivityListView";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Offcanvas } from "react-bootstrap";
import { saveCurrentPageTitle, appParams, sendDatabaseActionMessage, messageParams, dbData } from "./Local_library";
import heart_icon from '../assets/heart_icon.png';
import newspaper_icon from '../assets/newspaper_icon.png';
import default_user_icon from '../assets/user_icons/default.png';
import moment from 'moment';

export default class ProfileActivityView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    	offCanvasShow: false,
    	selectedPost: null,
    };
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.PROFILE_ACTIVITY.replace(" ", ""));

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.PROFILE_ACTIVITY, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE_ACTIVITY });

  }

  handleOffCanvasClose = () => {
  	this.setState({
  		offCanvasShow: false, 
  		selectedPost: null,
  	});
  };

  handleOffCanvasShow = (post) => {
      this.setState({
      	selectedPost: post,
      	offCanvasShow: true,
      }
    )
  };

  render(){
    return (
			<>
				<div class="p-3">
				 	<BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>

				 		<PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.PROFILE_ACTIVITY}/>

		        {/*<div class="list-group list-group-radio d-grid gap-2 border-0 small mt-3">
					    <div class="position-relative shadow rounded">
					      <label class="list-group-item py-3 pe-5" for="listGroupRadioGrid1">
					        <strong class="fw-semibold">First radio</strong>
					        <span class="d-block small opacity-75">With support text underneath to add more detail</span>
					      </label>
					    </div>
						</div>*/}

				 		<div class="mt-3">
							<ProfileActivityListView objects={this.props.globalData.profileActivityList} showPost={this.handleOffCanvasShow} variant="list"/> 
						</div>

	          <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
	            <Offcanvas.Header closeButton>
	              <Offcanvas.Title>Post Details</Offcanvas.Title>
	            </Offcanvas.Header>
	            <Offcanvas.Body>
	              { this.state.selectedPost && <div>
	              									<p class="my-1">
                                    <span class="badge align-items-center p-1 pe-3 text-secondary-emphasis rounded-pill">
                                      <img class="rounded-circle me-1" width="24" height="24" src={this.state.selectedPost.profile.avatar ? this.state.selectedPost.profile.avatar : default_user_icon} alt=""/>
                                      {this.state.selectedPost.profile.fullName}
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip id="tooltip1">Liked</Tooltip>}
                                      >
                                        <img class="mx-1" width="18" height="18" src={heart_icon} alt=""/>
                                      </OverlayTrigger>
                                    </span>
                                  </p>
                                  <div class="card h-100 shadow-lg">
															      <img 
																      src={(this.state.selectedPost.picture && this.state.selectedPost.picture != "") ? this.state.selectedPost.picture : newspaper_icon} 
																      class="card-img-top" 
																      height="250"
																      alt="..."/>
															      <div class="card-body">
															        {/*<h5 class="card-title">Card title</h5>*/}
															        <p class="card-text">{this.state.selectedPost.title}</p>
															      </div>
															      <div class="card-footer">
															        <small class="text-body-secondary">
															        	Added on {moment(this.state.selectedPost.date, moment.ISO_8601).format('lll')}
															        	<a class="border shadow-sm rounded p-1 mx-2" href={this.state.selectedPost.link}>
                                          <span title="See post on linkedin">
                                            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                          </span>
                                        </a>
															        </small>
															      </div>
															    </div>
	              	              </div>}
	            </Offcanvas.Body>
	          </Offcanvas>
				</div>
      </>
    );
  }
}
