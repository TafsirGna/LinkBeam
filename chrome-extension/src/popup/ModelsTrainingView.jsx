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

/*import './PostsWithSameImageView.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import { OverlayTrigger, Tooltip, Popover } from "react-bootstrap";
import PageTitleView from "./widgets/PageTitleView";
import { AlertCircleIcon } from "./widgets/SVGs";
import { 
  appParams,
  createFeedBrowsingTriggerModel,
  getPostCount,
  getVisitsTotalTime,
} from "./Local_library";
import { db } from "../db";
import * as tf from '@tensorflow/tfjs';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default class ModelsTrainingView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      model: null,
      steps: ["Data preprocessing", "Training"],
      currentStepIndex: 0,
      trainingData: null,
      currentStepProgressionStatus: 0,
      userNotifModalBody: null,
      userNotifModalShowContext: null,
    };

    this.initDataPreProcessing = this.initDataPreProcessing.bind(this);
    this.initTraining = this.initTraining.bind(this);

  }

  componentDidMount(){

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
          this.initDataPreProcessing();
        }
      );

    })();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevState.trainingData != this.state.trainingData){
      if (this.state.trainingData){
        this.setState({
            currentStepProgressionStatus: 0,
            currentStepIndex: this.state.currentStepIndex + 1,
          }, () => {
            this.initTraining();
          }
        );
      }
    }

  }

  handleUserNotifModalClose = () => {
    if (this.state.userNotifModalShowContext == "no_training_data"){
      return;
    }

    this.setState({userNotifModalBody: null});
  };
  handleUserNotifModalShow = (modalBody, modalShowContext) => {this.setState({userNotifModalBody: modalBody, userNotifModalShowContext: modalShowContext})};

  async initDataPreProcessing(){

    let visits = /*[] || */await db.visits.filter(visit => !Object.hasOwn(visit, "profileData"))
                                          .toArray();

    // checking first the necessity to start the whole process
    if (!visits.length){
      let modalBody = "No data to train on yet!";
      this.handleUserNotifModalShow(modalBody, "no_training_data");
      return;
    }

    let inputData = [];
    for (let visit of visits){

      let givenDayVisits = visits.filter(v => v.date.startsWith(visit.date.split("T")[0])),
          visitIndex = givenDayVisits.findIndex(v => v.uniqueId == visit.uniqueId),
          givenDayPreviousVisits = givenDayVisits.slice(0, visitIndex),
          givenDayPreviousVisitsFeedPostViews = await db.feedPostViews.where("visitId").anyOf(givenDayPreviousVisits.map(v => v.uniqueId)).toArray();
  
      inputData.push([
        visit.date.split("T")[1].match(/^\d{2}:\d{2}/g)[0], 
        visitIndex + 1,
        getVisitsTotalTime(givenDayPreviousVisitsFeedPostViews),
        getPostCount(givenDayPreviousVisitsFeedPostViews),
      ]);

      this.setState({currentStepProgressionStatus: ((inputData.length * 100) / visits.length).toFixed(1)});
    }

    console.log("--- Training data : ", inputData);
    // this.setState({trainingData: inputData});

  }

  initTraining(){

    // this.state.model.save(`indexeddb://${appParams.FEED_BROWSING_TRIGGER_MODEL_NAME}`);
  }

  render(){
    return (
      <>
        <div class="mt-5 pb-5 pt-3">

          <div class="text-center">
            <img src={app_logo}  alt="" width="40" height="40"/>
            <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.MODELS_TRAINING}/>
          </div>

          { this.state.model
              && <div class="offset-2 col-8 mt-4 row">
          
                  <div class="rounded border shadow-sm text-center pt-3">
                    { <div>
                        <div class="progress my-3 col-6 mx-auto" style={{height: ".5em"}}  role="progressbar" aria-label="Animated striped example" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                          <div class="progress-bar progress-bar-striped progress-bar-animated" style={{width: "100%"}}></div>
                        </div>
                        <p>
                          <span>
                            <span class="badge text-bg-primary fst-italic shadow-sm">
                              {`${this.state.steps[this.state.currentStepIndex]} (${this.state.currentStepProgressionStatus} %) ...`}
                            </span>
                          </span>
                        </p> 
                      </div> }
                  </div>
      
                </div> }

      </div>

      <Modal 
        show={this.state.userNotifModalBody} 
        onHide={this.handleUserNotifModalClose}
        backdrop="static">
        {/*<Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>*/}
        <Modal.Body>

          { this.state.userNotifModalBody }

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={this.handleUserNotifModalClose} className="shadow">
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      </>
    );
  }
}
