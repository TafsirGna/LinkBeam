/*import './ProfileListItemView.css'*/
import React from 'react';
import default_user_icon from '../../assets/user_icons/default.png';
import moment from 'moment';
import { dbDataSanitizer } from "../Local_library";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default class ProfileListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){


  }

  componentWillUnmount() {

  }

  render(){
    return (
      <>
        <a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
          <img src={ (this.props.object.profile.avatar ? this.props.object.profile.avatar : default_user_icon) } alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
          <div class="d-flex gap-2 w-100 justify-content-between">
            <div>
              <div class="d-flex gap-2 align-items-center">
                { this.props.parentList == "ordinary" && <h6 class="mb-0">
                                                          <a class="text-decoration-none text-black" href={"/index.html?view=Profile&data=" + this.props.object.url} target="_blank">
                                                            {this.props.object.profile.fullName}
                                                          </a>
                                                        </h6> }
                { this.props.parentList == "aggregated" && <h6 class="mb-0 d-flex align-items-center gap-1">
                                        <a class="text-decoration-none text-black" href={"/index.html?view=Profile&data=" + this.props.object.url} target="_blank" dangerouslySetInnerHTML={{__html: this.props.object.profile.fullName}}></a> 
                                        <OverlayTrigger
                                          placement="top"
                                          overlay={<Tooltip id="tooltip1">{this.props.object.count} visit{this.props.object.count > 1 ? "s" : ""} { this.props.context == "all" ? " | " + moment(this.props.object.date, moment.ISO_8601).fromNow() : " in total"}</Tooltip>}
                                        >
                                          <span class="text-muted badge text-bg-light shadow-sm border">{this.props.object.count}</span>
                                        </OverlayTrigger>
                                      </h6> }
                <span>·</span>
                { this.props.parentList == "ordinary" && <small class={ this.props.object.date.split("T")[0] == (new Date()).toISOString().split("T")[0] ? "text-warning text-nowrap" : "opacity-50 text-nowrap"}>{moment(this.props.object.date, moment.ISO_8601).fromNow()}</small> }
                { this.props.parentList == "aggregated" && <small class="opacity-50 text-nowrap ms-auto">{moment(this.props.object.date, moment.ISO_8601).format("L")}</small>}
              </div>
              <p class="mb-0 opacity-75 small">{this.props.object.profile.title}</p>
              <p class="shadow-sm fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-warning">{dbDataSanitizer.profileRelationDataPreproc(this.props.object.profile.nFollowers)} · {dbDataSanitizer.profileRelationDataPreproc(this.props.object.profile.nConnections)}</p>
            </div>
            {/*<small class="opacity-50 text-nowrap">{moment(this.props.object.date, moment.ISO_8601).fromNow()}</small>*/}
          </div>
        </a>
      </>
    );
  }
}
