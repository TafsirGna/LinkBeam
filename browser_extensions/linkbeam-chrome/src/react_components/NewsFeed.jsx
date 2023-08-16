/*import './NewsFeed.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { saveCurrentPageTitle } from "./Local_library";

export default class NewsFeed extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    saveCurrentPageTitle("NewsFeed");

  }

  render(){
    return (
		<>
			<div class="p-3">
			 	<BackToPrev prevPageTitle="Activity"/>
		        <div class="list-group list-group-radio d-grid gap-2 border-0 small mt-3">
				    <div class="position-relative shadow rounded">
				      <label class="list-group-item py-3 pe-5" for="listGroupRadioGrid1">
				        <strong class="fw-semibold">First radio</strong>
				        <span class="d-block small opacity-75">With support text underneath to add more detail</span>
				      </label>
				    </div>

				    <div class="position-relative shadow rounded">
				      <label class="list-group-item py-3 pe-5" for="listGroupRadioGrid2">
				        <strong class="fw-semibold">Second radio</strong>
				        <span class="d-block small opacity-75">Some other text goes here</span>
				      </label>
				    </div>

				    <div class="position-relative shadow rounded">
				      <label class="list-group-item py-3 pe-5" for="listGroupRadioGrid3">
				        <strong class="fw-semibold">Third radio</strong>
				        <span class="d-block small opacity-75">And we end with another snippet of text</span>
				      </label>
				    </div>

				    <div class="position-relative shadow rounded">
				      <label class="list-group-item py-3 pe-5" for="listGroupRadioGrid4">
				        <strong class="fw-semibold">Fourth disabled radio</strong>
				        <span class="d-block small opacity-75">This option is disabled</span>
				      </label>
				    </div>
				</div>
			</div>
      	</>
    );
  }
}
