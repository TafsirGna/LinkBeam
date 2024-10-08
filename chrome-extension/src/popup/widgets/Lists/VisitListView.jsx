/*import './VisitListView.css'*/
import React from 'react';
import { AlertCircleIcon } from "../SVGs";
import ProfileVisitListItemView from "../ListItems/ProfileVisitListItemView";
import FeedVisitListItemView from "../ListItems/FeedVisitListItemView";
import sorry_icon from '../../../assets/sorry_icon.png';

export default class VisitListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

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
                    <img 
                      src={sorry_icon} 
                      width="80" />
                    <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow-sm">No linkedin visits yet</span></p>
                    <p><span class="badge text-bg-light fst-italic shadow-sm text-muted border border-warning">Visit some linkedin profiles or feed</span></p>
                  </div> }

        { this.props.objects && this.props.objects.length != 0 &&
                <div class="list-group m-1 shadow-sm small">
                  {
                    this.props.objects.map((visit) => (<>

                        { !Object.hasOwn(visit, "profileData")
                          && <FeedVisitListItemView 
                              object={visit} 
                              parentList="ordinary" /> }

                        { Object.hasOwn(visit, "profileData")
                          && <ProfileVisitListItemView 
                              object={visit} 
                              parentList="ordinary" /> }

                      </>))
                  }
                </div>}
      </>
    );
  }
}
