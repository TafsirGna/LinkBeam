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
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { DateTime as LuxonDateTime } from "luxon";

export default class AiSettingsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      formFileRef: React.createRef(),
      model: null,
      modelSummaryOffCanvasShow: false,
      uploadedModelFiles: {
        json: null,
        weights: null,
      },
      userNotifModalBody: null,
      userNotifModalShowContext: null,
      modelLastTrainingDate: null,
    };

    this.onFileInputChange = this.onFileInputChange.bind(this);
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.AI_SETTINGS);

    if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus, liveQuery);
    }

    (async () => {
      this.setState({modelLastTrainingDate: (await chrome.storage.local.get(["feedBrowsingTriggerModelLastTrainingDate"])).feedBrowsingTriggerModelLastTrainingDate });
    })();

    this.onFileInputChange();

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

  async onModelActionSelection(actionIndex){

    switch(actionIndex){

      case 0:{
        let modalBody = <span class="small">Please, select simultaneously the model's json and bin files from your computer.</span>;
        this.handleUserNotifModalShow(modalBody, "model_import");
        break;
      }

      case 1:{
        window.open(`/index.html?view=${appParams.COMPONENT_CONTEXT_NAMES.MODELS_TRAINING.replaceAll(" ", "_")}`, '_blank');
        break;
      }

      case 2:{
        await this.state.model.save(`downloads://${appParams.FEED_BROWSING_TRIGGER_MODEL_NAME}`);
        break;
      }

      case 3:{
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
      // alert("Model reset successfully!");
      let modalBody = <span class="small">Model successfully reset!</span>;
      this.handleUserNotifModalShow(modalBody, "model_reset");
    }
  }

  handleModelSummaryOffCanvasClose = () => {this.setState({modelSummaryOffCanvasShow: false})};
  handleModelSummaryOffCanvasShow = () => {this.setState({modelSummaryOffCanvasShow: true})};

  handleUserNotifModalClose = (callback = null) => {
    this.setState({userNotifModalBody: null}, () => {
      if (callback){ callback(); }
    });
  };
  handleUserNotifModalOkAction = () => {
    this.handleUserNotifModalClose(() => {
      if (this.state.userNotifModalShowContext == "model_import"){
        this.state.formFileRef.current.click();
      }
    });
  }
  handleUserNotifModalShow = (modalBody, userNotifModalShowContext) => {this.setState({userNotifModalBody: modalBody, userNotifModalShowContext: userNotifModalShowContext})};

  onFileInputChange(){

    this.state.formFileRef.current.onchange = (async e => {

      console.log("*** --- : ", e.target.files);

      if (e.target.files.length != 2){
        alert("You must select simultaneously the model's json and bin files to proceed.");
        return;
      }

      if (!((e.target.files[0].name.endsWith(".json") && e.target.files[1].name.endsWith(".weights.bin"))
                  || (e.target.files[0].name.endsWith(".weights.bin") || e.target.files[1].name.endsWith(".json")))){
        alert("The uploaded files doesn't match the model's json and bin files.");
        return;
      }

      try{
        this.setState({model: await tf.loadLayersModel(tf.io.browserFiles([
                                                                e.target.files[0].name.endsWith(".json") 
                                                                  ? e.target.files[0]
                                                                  : e.target.files[1], 
                                                                e.target.files[0].name.endsWith(".weights.bin") 
                                                                  ? e.target.files[0]
                                                                  : e.target.files[1]
                                                            ]))});
      }
      catch(error){
        let errorMessage = "An error occured when uploaded the model. Please try again!";
        console.error(errorMessage, error);
        alert(errorMessage)
      };

    });
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
                              {["Import", "Train/Retrain", "Download", "Reset"].map((value, index) => (
                                    <li>
                                      <a class="dropdown-item small" href="#" onClick={() => {this.onModelActionSelection(index)}}>
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
                            Last trained
                          </strong>
                          <span class="rounded shadow-sm badge border text-secondary">
                            {(this.state.modelLastTrainingDate && (LuxonDateTime.fromISO(this.state.modelLastTrainingDate).toRelative())) || "Never"}
                          </span>
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
          <input 
            class="form-control" 
            type="file" 
            ref={this.state.formFileRef}
            multiple="multiple"/>
        </div>

        <Offcanvas show={this.state.modelSummaryOffCanvasShow} onHide={this.handleModelSummaryOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Models details</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>

            { this.state.model
                && <div>
                      <table class="table">
                          <thead>
                            <tr>
                              <th scope="col">Layer{/* (type)*/}</th>
                              <th scope="col">Output shape</th>
                              <th scope="col">Input shape</th>
                              <th scope="col">Param #</th>
                            </tr>
                          </thead>
                          <tbody>
                            { this.state.model.layers.map(layer => <tr>
                                                                      <td>{layer.name}</td>
                                                                      <td>{`[${JSON.stringify(layer.input.shape)}]`}</td>
                                                                      <td>{JSON.stringify(layer.output.shape)}</td>
                                                                      <td>{layer.weights.map(weight => weight.shape.reduce((acc, a) => acc * a, 1)).reduce((acc, a) => acc + a, 0)}</td>
                                                                    </tr>)}
                          </tbody>
                        </table>
            
                        <p class="mb-1">Total params: {this.state.model.weights.map(weight => weight.shape.reduce((acc, a) => acc * a, 1)).reduce((acc, a) => acc + a, 0)}</p>
                        <p class="mb-1">Trainable params: {this.state.model.trainableWeights.map(weight => weight.shape.reduce((acc, a) => acc * a, 1)).reduce((acc, a) => acc + a, 0)}</p>
                        <p class="mb-1">Non-trainable params: {this.state.model.nonTrainableWeights.map(weight => weight.shape.reduce((acc, a) => acc * a, 1)).reduce((acc, a) => acc + a, 0)}</p>
                    </div>}

          </Offcanvas.Body>
        </Offcanvas>


        <Modal show={this.state.userNotifModalBody} onHide={this.handleUserNotifModalClose}>
          {/*<Modal.Header closeButton>
            <Modal.Title>Notification</Modal.Title>
          </Modal.Header>*/}
          <Modal.Body>

            { this.state.userNotifModalBody }

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleUserNotifModalOkAction} className="shadow">
              OK
            </Button>
          </Modal.Footer>
        </Modal>

      </>
    );
  }

}
