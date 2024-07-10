/*import './BookmarkListView.css'*/
import React from 'react';
import default_user_icon from '../../assets/user_icons/default.png';
import { DateTime as LuxonDateTime } from "luxon";

export default class BookmarkListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

  }

  render(){
    return (
      <>
        { !this.props.objects && <div class="text-center"><div class="mb-5 mt-3"><div class="spinner-border text-primary" role="status">
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div> }

        { this.props.objects
            && <div>

              {this.props.objects.length == 0 && <div class="text-center m-5 mt-2">
                                  <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                  <p><span class="badge text-bg-primary fst-italic shadow">No bookmarked profiles yet</span></p>
                                </div>}

              { this.props.objects.length != 0 && 
                <div class="list-group m-1 shadow-sm small">
                  {
                    this.props.objects.map(bookmark => (<a href={"/index.html?view=Profile&data=" + bookmark.url} target="_blank" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                                    <img src={(bookmark.profile.avatar ? bookmark.profile.avatar : default_user_icon)} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                                    <div class="d-flex gap-2 w-100 justify-content-between">
                                      <div>
                                        <h6 class="mb-0">{bookmark.profile.fullName}</h6>
                                        <p class="mb-0 opacity-75 small">{bookmark.profile.title}</p>
                                        {/*<p class="fst-italic opacity-50 mb-0 bg-light-subtle text-light-emphasis">
                                          <OverlayTrigger
                                            placement="top"
                                            overlay={<ReactTooltip id="tooltip1">Bookmarked</ReactTooltip>}
                                          >
                                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                          </OverlayTrigger>
                                        </p>*/}
                                      </div>
                                      <small class="opacity-50 text-nowrap">{LuxonDateTime.fromISO(bookmark.createdOn).toRelative()}</small>
                                    </div>
                                  </a>))
                  }
                </div> }

            </div> }

  
      </>
    );
  }
}
