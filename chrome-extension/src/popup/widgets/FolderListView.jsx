/*import './FolderListView.css'*/
import React from 'react';
import eventBus from "../EventBus";
import { 
  appParams,
} from "../Local_library";
import { DateTime as LuxonDateTime } from "luxon";
import { AlertCircleIcon, DeletionIcon } from "./SVGs";

export default class FolderListView extends React.Component{

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

  // Function for initiating the deletion of a folder
  initFolderDeletion(folder){

    const response = confirm(`Do you confirm the deletion of the folder ${folder.name} ?`);
    if (response){
      this.props.deleteFolder(folder);
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
                      <p><span class="badge text-bg-primary fst-italic shadow">No folder yet</span></p>
                    </div>}


                { this.props.objects.length != 0 
                  && <div class="list-group list-group-radio d-grid gap-2 border-0 small mt-3">

                        {this.props.objects.map((folder, index) => (
                                          <div class="position-relative shadow-sm rounded" key={index}>
                                            <label class="list-group-item py-3 pe-5" for="listGroupRadioGrid4">
                                              <strong class="fw-semibold d-flex align-items-center justify-content-between">
                                                {folder.name} 
                                                <span 
                                                  onClick={() => {this.initFolderDeletion(folder)}} 
                                                  title="delete"
                                                  class="handy-cursor text-danger">
                                                  <DeletionIcon size="20"/>
                                                </span>
                                              </strong>
                                              <span class="d-block small opacity-75">Created {LuxonDateTime.fromISO(folder.createdOn).toRelative()}</span>
                                            </label>
                                          </div>))}

                      </div>}

              </div>}

      </>
    );
  }
}