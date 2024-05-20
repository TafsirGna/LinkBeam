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

/*import './TagPickModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { 
  setGlobalDataTags,
} from "../../Local_library";
import { db } from "../../../db";
import { AlertCircleIcon } from "../SVGs";
import { liveQuery } from "dexie"; 
import eventBus from "../../EventBus";

export default class TagPickModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      tags: null,
    };

    this.onTagClicked = this.onTagClicked.bind(this);

  }

  componentDidMount() {

    if (!this.props.globalData.tagList){
      setGlobalDataTags(db, eventBus, liveQuery);
    }
    else{
      this.setState({tags: this.props.globalData.tagList});
    }

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.globalData != this.props.globalData){
      if (prevProps.globalData.tagList != this.props.globalData.tagList){
        this.setState({tags: this.props.globalData.tagList});
      }
    }

  }

  async onTagClicked(tag){

    if (!tag.profiles){
      tag.profiles = [{
        url: this.props.profile.url,
        addedOn: (new Date()).toISOString(),
      }];
    }
    else{
      const index = tag.profiles.map(p => p.url).indexOf(this.props.profile.url);
      if (index != -1){
        tag.profiles.splice(index, 1);
      }
      else{
        tag.profiles.push({
          url: this.props.profile.url,
          addedOn: (new Date()).toISOString(),
        });
      }
    }

    await db.tags.update(tag.id, tag);

  }

  render(){
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Pick tags</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { (!this.state.tags
                || (this.state.tags && this.state.tags.length == 0))
                &&  <div class="text-center m-5 mt-4">
                      <AlertCircleIcon size="100" className="text-muted"/>
                      <p><span class="badge text-bg-primary fst-italic shadow">No tags yet</span></p>
                    </div>}

            { this.state.tags 
                && this.state.tags.length != 0
                && <div class="">
                    { this.state.tags.map(tag => (<span 
                                                    class={`handy-cursor mx-2 badge ${(tag.profiles && tag.profiles.map(p => p.url).indexOf(this.props.profile.url) != -1) ?  "bg-primary-subtle border-primary-subtle text-primary-emphasis" : "bg-secondary-subtle border-secondary-subtle text-secondary-emphasis"} border rounded-pill`}
                                                    onClick={() => {this.onTagClicked(tag)}}>
                                                    {`${tag.name} (${tag.profiles ? tag.profiles.length : 0})`}
                                                  </span>)) }
                </div> }


            {/*<div class="form-check">
              <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked>
              <label class="form-check-label" for="flexRadioDefault2">
                Default checked radio
              </label>
            </div>  */}    

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
