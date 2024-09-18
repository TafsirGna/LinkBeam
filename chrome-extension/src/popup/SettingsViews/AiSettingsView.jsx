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

import React from 'react';
import BackToPrev from "../widgets/BackToPrev";
import PageTitleView from "../widgets/PageTitleView";
import { 
  saveCurrentPageTitle, 
  appParams,
  setGlobalDataSettings,
  saveSettingsPropertyValue,
  createFeedBrowsingTriggerModel,
} from "../Local_library";
import eventBus from "../EventBus";
import { db } from "../../db";
import { liveQuery } from "dexie";
import { 
  CompassIcon,
} from  "../widgets/SVGs";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import * as tf from '@tensorflow/tfjs';
import { Offcanvas } from "react-bootstrap";

export default class AiSettingsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      formFileRef: React.createRef(),
      model: null,
      modelSummaryOffCanvasShow: false,
    };
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.AI_SETTINGS);

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

    // check a model already exists and create one if not
    (async () => {

      var model = null;
      try{
        model = await tf.loadLayersModel(`indexeddb://${appParams.FEED_BROWSING_TRIGGER_MODEL_NAME}`);
      }
      catch(error){
        model = createFeedBrowsingTriggerModel(tf);
      }

      this.setState(
        {model: model},
        () => {
          console.log("*** model loaded : ", this.state.model);
        }
      );
    })();

  }

  async onModelActionSelection(action){

    switch(action){

      case "Import":{
        alert("You are about to download a model in two files: Json and bin consecutively.");
        this.state.formFileRef.current.click();
        break;
      }

      case "Train":{
        window.open(`/index.html?view=${appParams.COMPONENT_CONTEXT_NAMES.MODELS_TRAINING.replaceAll(" ", "_")}`, '_blank');
        break;
      }

      case "Download":{
        await this.state.model.save(`downloads://${appParams.FEED_BROWSING_TRIGGER_MODEL_NAME}`);
        break;
      }

      case "Reset":{
        this.resetModels();
        break;
      }

    }

  }

  resetModels(){
    if (confirm("Do you confirm the reset of the pre-existing models ?")){
      // resetting the model in charge of triggering the feed browsing
      createFeedBrowsingTriggerModel(tf).save(`indexeddb://${appParams.FEED_BROWSING_TRIGGER_MODEL_NAME}`);

      // notifiy user of the save

    }
  }

  handleModelSummaryOffCanvasClose = () => {this.setState({modelSummaryOffCanvasShow: false})};
  handleModelSummaryOffCanvasShow = () => {this.setState({modelSummaryOffCanvasShow: true})};

  downloadModelFile(){
    
  }

  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.AI_SETTINGS}/>

          { this.state.model 
              && <div>
                    <div class="d-flex text-body-secondary pt-3">
                      <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                        <div class="d-flex justify-content-between">
                          <strong class="text-gray-dark">
                            <CompassIcon
                              size="15"
                              className="me-2 text-muted"/>
                            'Browse feed for me' models
                          </strong>
                          <div class="dropdown">
                            <div data-bs-toggle="dropdown" aria-expanded="false" class="float-start py-0 handy-cursor">
                              <span class="rounded shadow-sm badge border text-primary">Actions</span>
                            </div>
                            <ul class="dropdown-menu shadow-lg border">
                              {["Import", "Train", "Download", "Reset"].map((value) => (
                                    <li>
                                      <a class="dropdown-item small" href="#" onClick={() => {this.onModelActionSelection(value)}}>
                                        {value}
                                      </a>
                                    </li>  
                                ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="d-flex text-body-secondary pt-3">
                      <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                        <div class="d-flex justify-content-between">
                          <strong class="text-gray-dark">
                            <CompassIcon
                              size="15"
                              className="me-2 text-muted"/>
                            Last trained on
                          </strong>
                          <span class="rounded shadow-sm badge border text-secondary">{this.props.globalData.settings?.modelLastTrainingDate || "Never"}</span>
                        </div>
                      </div>
                    </div>
                    <div class="d-flex text-body-secondary pt-3">
                      <div class="pb-2 mb-0 small lh-sm border-bottom w-100">
                        <div class="d-flex justify-content-between">
                          <strong class="text-gray-dark">
                            <CompassIcon
                              size="15"
                              className="me-2 text-muted"/>
                            Models details
                          </strong>
                          <a 
                            href="#" 
                            class="text-primary badge" 
                            title="View details"
                            onClick={this.handleModelSummaryOffCanvasShow}>
                              View
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>}

        </div>

        <div class="d-none">
          <input class="form-control" type="file" ref={this.state.formFileRef}/>
        </div>

        <Offcanvas show={this.state.modelSummaryOffCanvasShow} onHide={this.handleModelSummaryOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Models details</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>



          </Offcanvas.Body>
        </Offcanvas>

      </>
    );
  }

}
