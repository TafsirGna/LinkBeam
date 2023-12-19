/*import './NewsFeed.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { saveCurrentPageTitle, appParams } from "./Local_library";

export default class ProfileActivityView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.PROFILE_ACTIVITY.replace(" ", ""));

  }

  render(){
    return (
			<>
				<div class="p-3">
				 	<BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>

					 		<PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.PROFILE_ACTIVITY}/>

			        <div class="list-group list-group-radio d-grid gap-2 border-0 small mt-3">
						    <div class="position-relative shadow rounded">
						      <label class="list-group-item py-3 pe-5" for="listGroupRadioGrid1">
						        <strong class="fw-semibold">First radio</strong>
						        <span class="d-block small opacity-75">With support text underneath to add more detail</span>
						      </label>
						    </div>
							</div>
				</div>
      </>
    );
  }
}
