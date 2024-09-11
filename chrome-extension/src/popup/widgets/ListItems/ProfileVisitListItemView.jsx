/*import './ProfileVisitListItemView.css'*/
import React from 'react';
import default_user_icon from '../../../assets/user_icons/default.png';
import { DateTime as LuxonDateTime } from "luxon";
import { 
  dbDataSanitizer,
  allUrlCombinationsOf,
} from "../../Local_library";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { db } from "../../../db";
import { 
  BookmarkIcon, 
} from "../SVGs";

export default class ProfileVisitListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profileData: null,
      bookmark: null,
    };

    this.getBookmark = this.getBookmark.bind(this);

  }

  componentDidMount() {

    this.getBookmark();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.object != this.props.object){
      this.getBookmark();
    }

  }

  componentWillUnmount() {

  }

  async getBookmark(){

    var bookmark = null;
    try{

      bookmark = await db.bookmarks
                        .where("url")
                        .anyOf(allUrlCombinationsOf(this.props.object.url))
                        .first();
                        
    }
    catch(error){
      console.log("Error : ", error);
    }

    if (bookmark){
      this.setState({bookmark: bookmark});
    }

  }

  render(){
    return (
      <>
        { this.props.object.profileData && <a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                  <img src={ (this.props.object.profileData.avatar ? this.props.object.profileData.avatar : default_user_icon) } alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                  <div class="d-flex gap-2 w-100 justify-content-between">
                    <div>
                      <div class="d-flex gap-2 align-items-center">
                        { this.props.parentList == "ordinary" && <h6 class="mb-0">
                                                                  <a class="text-decoration-none text-black" href={"/index.html?view=Profile&data=" + this.props.object.url} target="_blank">
                                                                    {this.props.object.profileData.fullName}
                                                                  </a>
                                                                </h6> }
                        { this.props.parentList == "aggregated" && <h6 class="mb-0 d-flex align-items-center gap-1">
                                                <a class="text-decoration-none text-black" href={`/index.html?view=Profile&data=${this.props.object.url}`} target="_blank" dangerouslySetInnerHTML={{__html: this.props.object.profileData.fullName}}></a> 
                                                <OverlayTrigger
                                                  placement="top"
                                                  overlay={<Tooltip id="tooltip1">{this.props.object.count} visit{this.props.object.count > 1 ? "s" : ""} { this.props.context == "all" ? " | " + LuxonDateTime.fromISO(this.props.object.date).toRelative() : " in total"}</Tooltip>}
                                                >
                                                  <span class="text-muted badge text-bg-light shadow-sm border">{this.props.object.count}</span>
                                                </OverlayTrigger>
                                              </h6> }
                        { this.state.bookmark && <span>
                                                  <OverlayTrigger
                                                    placement="bottom"
                                                    overlay={<Tooltip id="tooltip1">Bookmarked</Tooltip>}
                                                  >
                                                    <span>
                                                      <BookmarkIcon size="16" className="text-muted"/>
                                                    </span>
                                                  </OverlayTrigger>
                                                </span> }
                              
                        <span>·</span>
                        { this.props.parentList == "ordinary" && <small class={ this.props.object.date.split("T")[0] == (new Date()).toISOString().split("T")[0] ? "text-warning text-nowrap" : "opacity-50 text-nowrap"}>{LuxonDateTime.fromISO(this.props.object.date).toRelative()}</small> }
                        { this.props.parentList == "aggregated" && <small class="opacity-50 text-nowrap ms-auto">{LuxonDateTime.fromISO(this.props.object.date).toFormat("MM-dd-yyyy")}</small>}
                      </div>
                      <p class="mb-0 opacity-75 small">{this.props.object.profileData.title}</p>
                      <p class="shadow-sm fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-warning">{dbDataSanitizer.profileRelationDataPreproc(this.props.object.profileData.nFollowers)} · {dbDataSanitizer.profileRelationDataPreproc(this.props.object.profileData.nConnections)}</p>
                    </div>
                    {/*<small class="opacity-50 text-nowrap">{moment(this.props.object.date, moment.ISO_8601).fromNow()}</small>*/}
                  </div>
                </a>}
      </>
    );
  }
}
