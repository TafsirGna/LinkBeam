/*import './SearchListView.css'*/
import React from 'react';
import moment from 'moment';
import default_user_icon from '../../assets/user_icons/default.png';
import { Link } from 'react-router-dom';
import { AlertCircleIcon } from "./SVGs";

export default class SearchListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      seeMoreButtonShow: true,
    };
  }

  componentDidMount() {

    var seeMoreButtonShow = (!this.props.loading && this.props.searchLeft);
    this.setState({seeMoreButtonShow: seeMoreButtonShow}, () => {
      //
    });

  }

  componentDidUpdate(prevProps, prevState){

    var seeMoreButtonShow = (!this.props.loading && this.props.searchLeft);
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
                    this.props.objects.map((search) => (<Link to={"/index.html?redirect_to=ProfileView&data=" + search.url} target="_blank" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                                <img src={search.profile.avatar ? search.profile.avatar : default_user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                                <div class="d-flex gap-2 w-100 justify-content-between">
                                  <div>
                                    <div class="d-flex gap-2 align-items-center">
                                      <h6 class="mb-0">{search.profile.fullName}</h6>
                                      <span>·</span>
                                      <small class={ search.date.split("T")[0] == (new Date()).toISOString().split("T")[0] ? "text-warning text-nowrap" : "opacity-50 text-nowrap"}>{moment(search.date, moment.ISO_8601).fromNow()}</small>
                                    </div>
                                    <p class="mb-0 opacity-75 small">{search.profile.title}</p>
                                    <p class="shadow-sm fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-warning">{search.profile.nFollowers} · {search.profile.nConnections}</p>
                                  </div>
                                  {/*<small class="opacity-50 text-nowrap">{moment(search.date, moment.ISO_8601).fromNow()}</small>*/}
                                </div>
                              </Link>))
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
