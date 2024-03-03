/*import './VisitListView.css'*/
import React from 'react';
import { AlertCircleIcon } from "./SVGs";
import ProfileVisitListItemView from "./ProfileVisitListItemView";
import FeedVisitListItemView from "./FeedVisitListItemView";

export default class VisitListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      seeMoreButtonShow: true,
    };
  }

  componentDidMount() {

    var seeMoreButtonShow = (!this.props.loading && this.props.visitLeft);
    this.setState({seeMoreButtonShow: seeMoreButtonShow}, () => {
      //
    });

  }

  componentDidUpdate(prevProps, prevState){

    var seeMoreButtonShow = (!this.props.loading && this.props.visitLeft);
    if (seeMoreButtonShow != prevState.seeMoreButtonShow){
      this.setState({seeMoreButtonShow: seeMoreButtonShow});
    }

  }

  componentWillUnmount(){

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
                    <AlertCircleIcon size="100" className="mb-3 text-muted" />
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No viewed profiles</span></p>
                    <p><span class="badge text-bg-light fst-italic shadow text-muted border border-warning">Get started by visiting a linkedin profile</span></p>
                  </div> }

        { this.props.objects && this.props.objects.length != 0 && <div>
                <div class="list-group m-1 shadow-sm small">
                  {
                    this.props.objects.map((visit) => (<>
                        { visit.url.indexOf("/feed") != -1 && <FeedVisitListItemView object={visit} parentList="ordinary" /> }
                        { visit.url.indexOf("/feed") == -1 && <ProfileVisitListItemView object={visit} parentList="ordinary" /> }
                      </>))
                  }
                </div>
                <div class="text-center my-2 ">
                    { this.state.seeMoreButtonShow && <button /*id="seeMoreButton"*/ class="btn btn-light rounded-pill btn-sm fst-italic text-muted border badge shadow-sm mb-3 " onClick={() => this.props.seeMore()} type="button">See more</button>}
                    { this.props.loading && <div class="spinner-border spinner-border-sm text-secondary " role="status">
                                          <span class="visually-hidden">Loading...</span>
                                        </div>}
                </div>
              </div> }
      </>
    );
  }
}
