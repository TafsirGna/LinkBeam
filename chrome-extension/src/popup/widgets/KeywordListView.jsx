/*import './SearchListView.css'*/
import React from 'react';
import { Link } from 'react-router-dom';
import eventBus from "../EventBus";
import { 
  sendDatabaseActionMessage,
  messageParams,
  dbData,
  appParams,
} from "../Local_library";
import moment from 'moment';
import { AlertCircleIcon } from "./SVGs";

export default class KeywordListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    eventBus.on("deleteKeyword", (data) =>
      {
        var keyword = data.payload;
        this.deleteKeyword(keyword);
      }
    );

  }

  componentDidUpdate(prevProps, prevState){


  }

  componentWillUnmount() {

    eventBus.remove("deleteKeyword");

  }

  // Function for initiating the deletion of a keyword
  initKeywordDeletion(keyword){

    const response = confirm("Do you confirm the deletion of the keyword ("+keyword.name+") ?");
    if (response){

      this.props.onPreDeletion(keyword);

    }
  }

  deleteKeyword(keyword){

    sendDatabaseActionMessage(messageParams.requestHeaders.DEL_OBJECT, dbData.objectStoreNames.KEYWORDS, { context: appParams.COMPONENT_CONTEXT_NAMES.KEYWORDS, criteria: { props: { name: keyword.name } } });

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

        { this.props.objects != null && this.props.objects.length == 0 && <div class="text-center m-5 mt-4">
                      <AlertCircleIcon size="100" className="text-muted"/>
                      <p><span class="badge text-bg-primary fst-italic shadow">No keywords yet</span></p>
                    </div>}

        { this.props.objects != null && this.props.objects.length != 0 && 
                <div class="list-group list-group-radio d-grid gap-2 border-0 small mt-3">

                  {this.props.objects.map((keyword, index) => (
                                    <div class="position-relative shadow-sm rounded" key={index}>
                                      <label class="list-group-item py-3 pe-5" for="listGroupRadioGrid4">
                                        <strong class="fw-semibold d-flex align-items-center justify-content-between">
                                          {keyword.name} 
                                          <svg onClick={() => {this.initKeywordDeletion(keyword)}} title="delete" viewBox="0 0 24 24" width="20" height="20" stroke="#dc3545" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 handy-cursor"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                        </strong>
                                        <span class="d-block small opacity-75">Created {moment(keyword.createdOn, moment.ISO_8601).fromNow()}</span>
                                      </label>
                                    </div>))}

                </div>}
      </>
    );
  }
}
