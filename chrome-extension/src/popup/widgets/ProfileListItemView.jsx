/*import './ProfileListItemView.css'*/
import React from 'react';
import default_user_icon from '../../assets/user_icons/default.png';
import moment from 'moment';

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
          <img src={this.props.profile.avatar ? this.props.profile.avatar : default_user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
          <div class="d-flex gap-2 w-100 justify-content-between">
            <div>
              <div class="d-flex gap-2 align-items-center">
                <h6 class="mb-0 d-flex align-items-center gap-1">
                  <a class="text-decoration-none text-black" href={"/index.html?view=Profile&data=" + this.props.profile.url} target="_blank">{this.props.profile.fullName}</a> 
                </h6>
                
                <small class="opacity-50 text-nowrap ms-auto">{moment(this.props.profile.date, moment.ISO_8601).format("L")}</small>
              </div>
              <p class="mb-0 opacity-75 small">{this.props.profile.title}</p>
              <p class="shadow-sm fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-warning">{this.props.profile.nFollowers} · {this.props.profile.nConnections}</p>
            </div>
          </div>
        </a>
      </>
    );
  }
}
