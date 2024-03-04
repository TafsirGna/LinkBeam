/*import './ProfileActivityView.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import ProfileActivityListView from "./widgets/ProfileActivityListView";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Offcanvas } from "react-bootstrap";
import { saveCurrentPageTitle, appParams } from "./Local_library";
import heart_icon from '../assets/heart_icon.png';
import share_icon from '../assets/share_icon.png';
import newspaper_icon from '../assets/newspaper_icon.png';
import default_user_icon from '../assets/user_icons/default.png';
import moment from 'moment';

export default class ProfileActivityView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    	offCanvasShow: false,
    	selectedPost: null,
    	profiles: null,
    };

    this.listenToMessages = this.listenToMessages.bind(this);
    this.onProfilesDataReceived = this.onProfilesDataReceived.bind(this);
  }

  componentDidMount() {

  	this.listenToMessages();

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.PROFILE_ACTIVITY.replace(" ", ""));

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.PROFILES, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE_ACTIVITY });

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

  onProfilesDataReceived(message, sendResponse){

    // acknowledge receipt
    ack(sendResponse);

    var context = message.data.objectData.context;
    if (context != appParams.COMPONENT_CONTEXT_NAMES.PROFILE_ACTIVITY){
    	return;
    }

    var profileList = message.data.objectData.list;

    // Setting the search list here too
    this.setState({profiles: profileList});

  }

  listenToMessages(){

    startMessageListener([
      {
        param: [messageParams.responseHeaders.OBJECT_LIST, dbData.objectStoreNames.PROFILES].join(messageParams.separator), 
        callback: this.onProfilesDataReceived
      },
    ]);
  }


  render(){
    return (
			<>
				<div class="p-3">
				 	<BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>

				 		<PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.PROFILE_ACTIVITY}/>

				 		<div class="mt-3">
							<ProfileActivityListView objects={this.state.profiles} showPost={this.handleOffCanvasShow} variant="list"/> 
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
                                      { this.state.selectedPost.profile.fullName }
                                      { this.state.selectedPost.action && <OverlayTrigger
                                                                                        placement="top"
                                                                                        overlay={<Tooltip id="tooltip1">{this.state.selectedPost.action.toLowerCase().indexOf("liked") != -1 ? "liked" : (this.state.selectedPost.action.toLowerCase().indexOf("shared") != -1 ? "shared" : null)}</Tooltip>}
                                                                                      >
                                                                                      <span>
                                                                                        { (this.state.selectedPost.action.toLowerCase().indexOf("liked") != -1) &&  <img class="mx-1" width="18" height="18" src={heart_icon} alt=""/>}
                                                                                        { (this.state.selectedPost.action.toLowerCase().indexOf("shared")  != -1) &&  <img class="mx-2" width="16" height="16" src={share_icon} alt=""/>}
                                                                                      </span>
                                                                                      </OverlayTrigger>}
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
															        <p class="card-text small">{this.state.selectedPost.title}</p>
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
