/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import { LockIcon, GithubIcon, SendIcon, TagIcon } from "./widgets/SVGs";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  appParams,
} from "./Local_library";
import PageTitleView from "./widgets/PageTitleView";
import Form from 'react-bootstrap/Form';
import moment from 'moment';

export default class FeedDashView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      selectedDate: (new Date()).toISOString().split('T')[0],
    };

    this.handleDateInputChange = this.handleDateInputChange.bind(this);

  }

  componentDidMount() {

    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get("data");

    if (date){
      this.setState({selectedDate: date.split("T")[0]});
    }

  }

  handleDateInputChange(event){

    this.setState({selectedDate: event.target.value});

  }

  render(){
    return (
      <>
        <div class="mt-5 pb-5 pt-3">

          	<div class="text-center">
	            <img src={app_logo}  alt="" width="40" height="40"/>
	            <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.FEED_DASHBOARD}/>
          	</div>

  			<div class="offset-2 col-8 mt-4">

          <div class="clearfix my-3 me-3">
            <Form.Control
              type="date"
              autoFocus
              max={new Date().toISOString().slice(0, 10)}
              value={this.state.selectedDate}
              onChange={this.handleDateInputChange}
              className="float-end shadow-sm w-25"
              size="sm"
            />
          </div>

          <div class="row mx-2 mt-1">
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {}}>
              <div class="card-body">
                <h6 class="card-title text-primary-emphasis">~0</h6>
                <p class="card-text">Total time spent</p>
              </div>
            </div>
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {}}>
              <div class="card-body">
                <h6 class="card-title text-danger-emphasis">0</h6>
                <p class="card-text">Visits</p>
              </div>
            </div>
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {}}>
              <div class="card-body">
                <h6 class="card-title text-warning-emphasis">~0</h6>
                <p class="card-text">Posts</p>
              </div>
            </div>
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {}}>
              <div class="card-body">
                <h6 class="card-title text-info-emphasis">0</h6>
                <p class="card-text">Mean time per visit</p>
              </div>
            </div>
          </div>

          <div class="my-3 p-3 bg-body rounded shadow border mx-3">
            <h6 class="border-bottom pb-2 mb-0">Tracked posts</h6>
            <div class="d-flex text-body-secondary pt-3">
              <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#007bff"></rect><text x="50%" y="50%" fill="#007bff" dy=".3em">32x32</text></svg>
              <p class="pb-3 mb-0 small lh-sm border-bottom">
                <strong class="d-block text-gray-dark">@username</strong>
                Some representative placeholder content, with some information about this user. Imagine this being some sort of status update, perhaps?
              </p>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#e83e8c"></rect><text x="50%" y="50%" fill="#e83e8c" dy=".3em">32x32</text></svg>
              <p class="pb-3 mb-0 small lh-sm border-bottom">
                <strong class="d-block text-gray-dark">@username</strong>
                Some more representative placeholder content, related to this other user. Another status update, perhaps.
              </p>
            </div>
            <div class="d-flex text-body-secondary pt-3">
              <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#6f42c1"></rect><text x="50%" y="50%" fill="#6f42c1" dy=".3em">32x32</text></svg>
              <p class="pb-3 mb-0 small lh-sm border-bottom">
                <strong class="d-block text-gray-dark">@username</strong>
                This user also gets some representative placeholder content. Maybe they did something interesting, and you really want to highlight this in the recent updates.
              </p>
            </div>
            <small class="d-block text-end mt-3 fst-italic">
              <a href="#">All posts</a>
            </small>
          </div>

  			</div>

  		</div>
      </>
    );
  }
}
