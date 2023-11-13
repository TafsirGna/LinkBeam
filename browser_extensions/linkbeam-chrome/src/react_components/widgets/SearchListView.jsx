/*import './SearchListView.css'*/
import React from 'react';
import moment from 'moment';
import default_user_icon from '../../assets/user_icons/default.png';
import { Link } from 'react-router-dom';
/*import 'bootstrap/dist/css/bootstrap.min.css';*/

export default class SearchListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      seeMoreButtonShow: true,
      seeMoreSpinnerShow: false,
      objectTags: null,
    };
  }

  componentDidMount() {

    var seeMoreButtonShow = (!this.props.loading && this.props.searchLeft);
    this.setState({seeMoreButtonShow: seeMoreButtonShow});

  }

  componentDidUpdate(prevProps, prevState){

    var seeMoreButtonShow = (!this.props.loading && this.props.searchLeft);
    if (seeMoreButtonShow != prevState.seeMoreButtonShow){
      this.setState({seeMoreButtonShow: seeMoreButtonShow});
    }

  }

  render(){
    return (
      <>
        { this.props.objects == null && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div> }

        { this.props.objects != null && this.props.objects.length == 0 && <div class="text-center m-5 mt-2">
                    <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">No viewed profiles</span></p>
                    <p><span class="badge text-bg-light fst-italic shadow text-muted border border-warning">Get started by visiting a linkedin profile</span></p>
                  </div> }

        { this.props.objects != null && this.props.objects.length != 0 && <div>
                <div class="list-group m-1 shadow-sm small">
                  {
                    this.props.objects.map((search) => (<Link to={"/index.html?redirect_to=ProfileView&data=" + search.url} target="_blank" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                                <img src={default_user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                                <div class="d-flex gap-2 w-100 justify-content-between">
                                  <div>
                                    <div class="d-flex gap-2">
                                      <h6 class="mb-0">{search.profile.fullName}</h6>
                                      <span>·</span>
                                      <small class="opacity-50 text-nowrap">{moment(search.date, moment.ISO_8601).fromNow()}</small>
                                    </div>
                                    <p class="mb-0 opacity-75">{search.profile.title}</p>
                                    <p class="shadow fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-info-subtle">{search.profile.nFollowers} · {search.profile.nConnections}</p>
                                  </div>
                                  {/*<small class="opacity-50 text-nowrap">{moment(search.date, moment.ISO_8601).fromNow()}</small>*/}
                                </div>
                              </Link>))
                  }
                </div>
                <div class="text-center my-2 ">
                    <button class={"btn btn-light rounded-pill btn-sm fst-italic text-muted border badge shadow-sm " + (this.state.seeMoreButtonShow ? "" : "d-none")} onClick={() => this.props.seeMore()} type="button">See more</button>
                    <div class={"spinner-border spinner-border-sm text-secondary " + (this.props.loading ? "" : "d-none")} role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
              </div> }
      </>
    );
  }
}
