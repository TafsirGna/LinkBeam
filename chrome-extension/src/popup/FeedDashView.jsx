/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import { LockIcon, GithubIcon, SendIcon, TagIcon } from "./widgets/SVGs";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  appParams,
} from "./Local_library";
import PageTitleView from "./widgets/PageTitleView";

export default class FeedDashView extends React.Component{

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
        <div class="mt-5 pb-5 pt-3">

          	<div class="text-center">
	            <img src={app_logo}  alt="" width="40" height="40"/>
	            <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.FEED_DASHBOARD}/>
          	</div>

  			<div class="offset-1 col-10 mt-4 row">

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
                <p class="card-text">Mean time per post</p>
              </div>
            </div>
            <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={() => {}}>
              <div class="card-body">
                <h6 class="card-title text-info-emphasis">0</h6>
                <p class="card-text">Mean time per visit</p>
              </div>
            </div>
          </div>

  			</div>

  		</div>
      </>
    );
  }
}
