/*import './AggregatedVisitListView.css'*/
import React from 'react';
import moment from 'moment';
import default_user_icon from '../../assets/user_icons/default.png';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import VisibilitySensor from 'react-visibility-sensor';
import { dbDataSanitizer } from "../Local_library";

export default class AggregatedVisitListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      seeMoreButtonShow: true,
      seeMoreButtonVisibility: null,
    };

    this.onSeeMoreButtonVisibilityChange = this.onSeeMoreButtonVisibilityChange.bind(this);
  }

  componentDidMount() {

    var seeMoreButtonShow = (!this.props.loading && this.props.visitLeft);
    this.setState({seeMoreButtonShow: seeMoreButtonShow});

  }

  componentDidUpdate(prevProps, prevState){

    var seeMoreButtonShow = (!this.props.loading && this.props.visitLeft);
    if (seeMoreButtonShow != prevState.seeMoreButtonShow){
      this.setState({seeMoreButtonShow: seeMoreButtonShow});
    }

  }

  componentWillUnmount(){

  }

  onSeeMoreButtonVisibilityChange = (isVisible) => {
    console.log("************ --------------------------- : ", this.props.context);
    this.setState({seeMoreButtonVisibility: isVisible}, () => {
      if (this.state.seeMoreButtonVisibility){
        this.props.seeMore();
      }
    });
  }

  render(){
    return (
      <>
        { !this.props.objects && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div> }

        { this.props.objects && this.props.objects.length == 0 && <div class="text-center m-5 mt-2">
                    <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">{this.props.context == "search" ? "No found results": "No viewed profiles"}</span></p>
                    {/*<p><span class="badge text-bg-light fst-italic shadow text-muted border border-warning">Get started by visiting a linkedin profile</span></p>*/}
                  </div> }

        { this.props.objects && this.props.objects.length != 0 && <div>
                <div class="list-group m-1 shadow-sm small">
                  {
                    this.props.objects.map((visit) => (<a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                                <img src={visit.profile.avatar ? visit.profile.avatar : default_user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                                <div class="d-flex gap-2 w-100 justify-content-between">
                                  <div>
                                    <div class="d-flex gap-2 align-items-center">
                                      <h6 class="mb-0 d-flex align-items-center gap-1">
                                        <a class="text-decoration-none text-black" href={"/index.html?redirect_to=ProfileView&data=" + visit.url} target="_blank" dangerouslySetInnerHTML={{__html: visit.profile.fullName}}></a> 
                                        <OverlayTrigger
                                          placement="top"
                                          overlay={<Tooltip id="tooltip1">{visit.count} visit{visit.count > 1 ? "es" : ""} { this.props.context == "all" ? " | " + moment(visit.date, moment.ISO_8601).fromNow() : " in total"}</Tooltip>}
                                        >
                                          <span class="text-muted badge text-bg-light shadow-sm border">{visit.count}</span>
                                        </OverlayTrigger>
                                      </h6>
                                      
                                      <small class="opacity-50 text-nowrap ms-auto">{moment(visit.date, moment.ISO_8601).format("L")}</small>
                                    </div>
                                    <p class="mb-0 opacity-75 small">{visit.profile.title}</p>
                                    <p class="shadow-sm fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-warning">{dbDataSanitizer.profileRelationDataPreproc(visit.profile.nFollowers)} · {dbDataSanitizer.profileRelationDataPreproc(visit.profile.nConnections)}</p>
                                  </div>
                                  {/*<small class="opacity-50 text-nowrap">{moment(visit.date, moment.ISO_8601).fromNow()}</small>*/}
                                </div>
                              </a>))
                  }
                </div>
                <div class="text-center my-2 ">
                    { (this.props.context != "search" && this.state.seeMoreButtonShow) && <VisibilitySensor
                                                        onChange={this.onSeeMoreButtonVisibilityChange}
                                                      >
                                                        <button class="btn btn-light rounded-pill btn-sm fst-italic text-muted border badge shadow-sm mb-3 " onClick={() => this.props.seeMore()} type="button">
                                                          See more
                                                        </button>
                                                      </VisibilitySensor>}
                    { this.props.loading && <div class="spinner-border spinner-border-sm text-secondary " role="status">
                                          <span class="visually-hidden">Loading...</span>
                                        </div>}
                </div>
              </div> }
      </>
    );
  }
}
