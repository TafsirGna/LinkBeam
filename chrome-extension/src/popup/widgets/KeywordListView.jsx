/*import './KeywordListView.css'*/
import React from 'react';
import eventBus from "../EventBus";
import { 
  appParams,
} from "../Local_library";
import moment from 'moment';
import { AlertCircleIcon, DeletionIcon } from "./SVGs";

export default class KeywordListView extends React.Component{

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

  // Function for initiating the deletion of a keyword
  initKeywordDeletion(keyword){

    const response = confirm(`Do you confirm the deletion of the keyword ${keyword.name} ?`);
    if (response){
      this.props.deleteKeyword(keyword);
    }
  }

  render(){
    return (
      <>
        { this.props.objects == null && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                  </div>
                </div>}

        { this.props.objects != null 
            && <div>

                {this.props.objects.length == 0 
                  && <div class="text-center m-5 mt-4">
                      <AlertCircleIcon size="100" className="text-muted"/>
                      <p><span class="badge text-bg-primary fst-italic shadow">No keywords yet</span></p>
                    </div>}


                { this.props.objects.length != 0 
                  && <div class="list-group list-group-radio d-grid gap-2 border-0 small mt-3">

                        {this.props.objects.map((keyword, index) => (
                                          <div class="position-relative shadow-sm rounded" key={index}>
                                            <label class="list-group-item py-3 pe-5" for="listGroupRadioGrid4">
                                              <strong class="fw-semibold d-flex align-items-center justify-content-between">
                                                {keyword.name} 
                                                <span 
                                                  onClick={() => {this.initKeywordDeletion(keyword)}} 
                                                  title="delete"
                                                  class="handy-cursor text-danger">
                                                  <DeletionIcon size="20"/>
                                                </span>
                                              </strong>
                                              <span class="d-block small opacity-75">Created {moment(keyword.createdOn, moment.ISO_8601).fromNow()}</span>
                                            </label>
                                          </div>))}

                      </div>}

              </div>}

      </>
    );
  }
}
