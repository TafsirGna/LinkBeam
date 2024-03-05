/*import './AggregatedVisitListView.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import VisibilitySensor from 'react-visibility-sensor';
import { dbDataSanitizer } from "../Local_library";
import ProfileVisitListItemView from "./ProfileVisitListItemView";
import FeedVisitListItemView from "./FeedVisitListItemView";

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
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No data to show</span></p>
                    {/*<p><span class="badge text-bg-light fst-italic shadow text-muted border border-warning">Get started by visiting a linkedin profile</span></p>*/}
                  </div> }

        { this.props.objects && this.props.objects.length != 0 && <div>
                <div class="list-group m-1 shadow-sm small">
                  {
                    this.props.objects.map((visit) => (<>
                        { visit.url.indexOf("/feed") != -1 && <FeedVisitListItemView object={visit} parentList="aggregated" />}
                        { visit.url.indexOf("/feed") == -1 && <ProfileVisitListItemView object={visit} parentList="aggregated"/> }
                      </>))
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
