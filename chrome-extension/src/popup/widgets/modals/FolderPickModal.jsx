/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

/*import './FolderPickModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { 
  setGlobalDataFolders,
} from "../../Local_library";
import { db } from "../../../db";
import { AlertCircleIcon } from "../SVGs";
import { liveQuery } from "dexie"; 
import eventBus from "../../EventBus";

export default class FolderPickModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      folders: null,
    };
  }

  componentDidMount() {

    if (!this.props.globalData.folderList){
      setGlobalDataFolders(db, eventBus, liveQuery);
    }
    else{
      this.setState({folders: this.props.globalData.folderList});
    }

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.globalData != this.props.globalData){
      if (prevProps.globalData.folderList != this.props.globalData.folderList){
        this.setState({folders: this.props.globalData.folderList});
      }
    }

  }

  componentWillUnmount(){

  }

  render(){
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Pick a folder</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { (!this.state.folders
                || (this.state.folders && this.state.folders.length == 0))
                &&  <div class="text-center m-5 mt-4">
                      <AlertCircleIcon size="100" className="text-muted"/>
                      <p><span class="badge text-bg-primary fst-italic shadow">No folders yet</span></p>
                    </div>}

            { this.state.folders 
                && this.state.folders.length != 0
                && <div class="list-group shadow-sm">

                    <label class="list-group-item d-flex gap-2">
                      <input class="form-check-input flex-shrink-0" type="radio" name="listGroupRadios" id="listGroupRadios1" value="" checked=""/>
                      <span>
                        None
                        <small class="d-block text-body-secondary fst-italic">The default folder when the profile is assigned to no folder</small>
                      </span>
                    </label>

                    { this.state.folders.map(folder => (<label class="list-group-item d-flex gap-2">
                                                                          <input class="form-check-input flex-shrink-0" type="radio" name="listGroupRadios" id="listGroupRadios1" value="" checked=""/>
                                                                          <span>
                                                                            {folder.name}
                                                                            <small class="d-block text-body-secondary fst-italic">With {folder.profiles ? folder.profiles.length : 0} profiles</small>
                                                                          </span>
                                                                        </label>)) }

                </div> }

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
