/*import './ProfileActivityView.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import ProfileActivityListView from "./widgets/ProfileActivityListView";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Offcanvas } from "react-bootstrap";
import { saveCurrentPageTitle, appParams, sendDatabaseActionMessage, messageParams, dbData } from "./Local_library";

export default class ProfileActivityView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    	offCanvasShow: false,
    };
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.PROFILE_ACTIVITY.replace(" ", ""));

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.PROFILE_ACTIVITY, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE_ACTIVITY });

  }

  handleOffCanvasClose = () => {this.setState({offCanvasShow: false})};

  handleOffCanvasShow = () => {
      this.setState({offCanvasShow: true}
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
	              
	            </Offcanvas.Body>
	          </Offcanvas>
				</div>
      </>
    );
  }
}
