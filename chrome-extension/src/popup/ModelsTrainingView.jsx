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
import TensorBoardChart from "./widgets/Charts/TensorBoardChart";
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
import { DateTime as LuxonDateTime } from "luxon";

function splitIntoEqualFolds(array, foldSize){

  var folds = [],
      offset = 0;

  while (offset < array.length){
    folds.push([...(array.slice(offset, (offset + foldSize)))]);
    offset += foldSize;
  }

  return folds;

}

export default class ModelsTrainingView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      steps: ["Data preprocessing", "Training"],
      currentStepIndex: 0,
      trainingData: null,
      currentStepProgressionStatus: 0,
      userNotifModalBody: null,
      userNotifModalShowContext: null,
      modelTrainingLogs: [],
      tensorBoardData: null,
      currentFoldIndex: null,
    };

    this.initDataPreProcessing = this.initDataPreProcessing.bind(this);
    this.initTraining = this.initTraining.bind(this);

  }

  componentDidMount(){

    console.log("*** Bare model  : ", createFeedBrowsingTriggerModel(tf));
    this.initDataPreProcessing();

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

    let trainingData = [],
        visitCount = 0;
    for (let date of visits.filter((value, index, self) => self.findIndex(v => v.date.split("T")[0] == value.date.split("T")[0]) === index)
                           .map(visit => visit.date.split("T")[0])){

      let givenDayVisits = visits.filter(v => v.date.startsWith(date)),
          givenDayVisitsFeedPostViews = await db.feedPostViews.where("visitId").anyOf(givenDayVisits.map(v => v.uniqueId)).toArray();

      let visitIndex = 0;
      for (let visit of givenDayVisits){

        let givenDayPreviousVisits = givenDayVisits.slice(0, visitIndex),
            givenDayPreviousVisitsFeedPostViews = givenDayVisitsFeedPostViews.filter(view => givenDayPreviousVisits.map(v => v.uniqueId).includes(view.visitId)),
            visitGap = [0, parseInt(visit.date.slice(11, 13)) * 60 + parseInt(visit.date.slice(14, 16))];

        if (visitIndex){

          let previousVisit = givenDayPreviousVisits[givenDayPreviousVisits.length - 1],
              previousVisitFeedPostViews = givenDayPreviousVisitsFeedPostViews.filter(view => view.visitId == previousVisit.uniqueId);
          const previousVisitLastMoment =  Math.max(
                                            new Date(previousVisit.date).valueOf() + (getVisitsTotalTime(previousVisitFeedPostViews) * 60000), 
                                            new Date(previousVisitFeedPostViews[previousVisitFeedPostViews.length - 1].date).valueOf()
                                          );
          visitGap[0] = parseInt(new Date(previousVisitLastMoment).toISOString().slice(11, 13)) * 60 + parseInt(new Date(previousVisitLastMoment).toISOString().slice(14, 16));

        }

        let visitGapMeasure = visitGap[1] - visitGap[0];
        visitGapMeasure = visitGapMeasure >= 0 ? visitGapMeasure : 0;

        // true occurrence
        trainingData.push([
          visit.date.slice(11, 16), 
          parseInt(visit.date.slice(11, 13)) * 60 + parseInt(visit.date.slice(14, 16)), 
          visitIndex + 1,
          getVisitsTotalTime(givenDayPreviousVisitsFeedPostViews),
          getPostCount(givenDayPreviousVisitsFeedPostViews),
          visitGapMeasure,
          1,
        ]);

        function convertToHoursMinutes(value){
          return `${parseInt(value / 60) < 10 ? "0" : ""}${parseInt(value / 60)}:${(value % 60) < 10 ? "0" : ""}${value % 60}`;
        }

        // false occurrence
        if (visitGapMeasure){

          let randomOffFeedTime = Math.floor(Math.random() * (visitGap[1] - visitGap[0]) ) + visitGap[0];
          trainingData.push([
            convertToHoursMinutes(randomOffFeedTime), 
            randomOffFeedTime, 
            visitIndex + 1,
            getVisitsTotalTime(givenDayPreviousVisitsFeedPostViews),
            getPostCount(givenDayPreviousVisitsFeedPostViews),
            (randomOffFeedTime - visitGap[0]),
            0,
          ]);

        }

        visitIndex++;
        visitCount++;
        this.setState({currentStepProgressionStatus: ((visitCount * 100) / visits.length).toFixed(1)});

      }

    }

    // Normalizing the training data through min max
    console.log("--- Training data 1 : ", [...trainingData]);

    // Getting min and max
    const mins = Array.from({length: trainingData[0].length})
                      .map((_, index) => [0, trainingData[0].length - 1].includes(index) 
                                            ? null 
                                            : Math.min(...trainingData.map(inputData => inputData[index]))),
          maxes = Array.from({length: trainingData[0].length})
                       .map((_, index) => [0, trainingData[0].length - 1].includes(index) 
                                            ? null 
                                            : Math.max(...trainingData.map(inputData => inputData[index])));

    // Performing the scaling
    trainingData.forEach((inputData, index0) => {
      inputData.forEach((_, index1) => {
        if ([0, trainingData[0].length - 1].includes(index1)) { return; }
        trainingData[index0][index1] = parseFloat(((trainingData[index0][index1] - mins[index1]) / (maxes[index1] - mins[index1])).toFixed(2))
      })
    });

    console.log("--- Training data 2 : ", trainingData);
    this.setState({trainingData: trainingData});

    // Setting the mins and maxes in the local storage for later inference
    chrome.storage.local.set({ modelTrainingDataMins: mins, modelTrainingDataMaxes: maxes });

  }

  initTraining(){

    const epochCount = 100;
    var modelTrainingLogs = [...this.state.modelTrainingLogs],
        currentStepProgressionStatus = null,
        currentFoldIndex = 1,
        tensorBoardData = {
          labels: Array.from({length: epochCount}).map((_, index) => `Epoch ${index + 1}`),
          datasets: [
            {
              label: "Accuracy",
              data: [],
            },
            {
              label: "Loss",
              data: [],
            }
          ],
        };

    const interval = setInterval(() => {
      if (parseInt(currentStepProgressionStatus) == 100) { clearInterval(interval); }
      this.setState({
        currentStepProgressionStatus: currentStepProgressionStatus,
        modelTrainingLogs: modelTrainingLogs,
        tensorBoardData: null,
        currentFoldIndex: currentFoldIndex
      }, () => {
        this.setState({tensorBoardData: tensorBoardData});
      });
    }, 2000);

    // function onBatchEnd(batch, logs) {
    //   console.log('Accuracy', logs.acc);
    // }

    function onEpochEnd(epoch, logs) {

      const consoleMessage = `Epoch: ${epoch + 1} Acc: ${logs.acc} Loss: ${logs.loss}`;
      // console.log(consoleMessage);

      currentStepProgressionStatus = (((epoch + 1) * 100) / epochCount).toFixed(1);
      modelTrainingLogs.push(consoleMessage);
      tensorBoardData.datasets[0].data.push(logs.acc);
      tensorBoardData.datasets[1].data.push(logs.loss);

      if ((epoch + 1) == 100 && currentFoldIndex != 4){
        tensorBoardData.datasets[0].data = [];
        tensorBoardData.datasets[1].data = [];
        modelTrainingLogs.push(`--- Fold Index : ${currentFoldIndex}`);
      }

    }
    onEpochEnd = onEpochEnd.bind(this);

    // initiating cross-testing
    const inputFolds = splitIntoEqualFolds(this.state.trainingData, parseInt(this.state.trainingData.length / 4));
    var bestModelSoFar = null,
        bestModelSoFarEvaluation = null;

    // Train for n epochs with batch size of 32.
    function train(){

      const trainingInputs = tf.tensor2d([...inputFolds].splice((currentFoldIndex - 1) , 1).reduce((acc, a) => acc.concat(a), []).map(row => row.slice(1, 6))),
            trainingLabels = tf.tensor2d([...inputFolds].splice((currentFoldIndex - 1) , 1).reduce((acc, a) => acc.concat(a), []).map(row => row.slice(6))),
            testInputs = tf.tensor2d(inputFolds[currentFoldIndex].map(row => row.slice(1, 6))),
            testLabels = tf.tensor2d(inputFolds[currentFoldIndex].map(row => row.slice(6)));

      var model = createFeedBrowsingTriggerModel(tf);

      model.fit(trainingInputs, trainingLabels, {
        epochs: epochCount,
        batchSize: 32,
        callbacks: {/*onBatchEnd*/ onEpochEnd}
      }).then(info => {

        // console.log('Final accuracy', info.history.acc);
        var modelEvaluation = model.evaluate(testInputs, testLabels);
        console.log("YYYYYYYYYYYYYYY : ", modelEvaluation);
        modelEvaluation = parseFloat(modelEvaluation[0].arraySync().toFixed(2));

        if (currentFoldIndex == 1){
          bestModelSoFar = model;
          bestModelSoFarEvaluation = modelEvaluation;
        }
        else{

          if (modelEvaluation < bestModelSoFarEvaluation){
            bestModelSoFar = model;
            bestModelSoFarEvaluation = modelEvaluation;
          }

          if (currentFoldIndex == 4){

            let modalBody = "Model successfully trained!";
            this.handleUserNotifModalShow(modalBody, "training_ended");

            // bestModelSoFar.save(`indexeddb://${appParams.FEED_BROWSING_TRIGGER_MODEL_NAME}`);
            chrome.storage.local.set({ feedBrowsingTriggerModelLastTrainingDate: new Date().toISOString() });

            return;
          }

        }        

        currentFoldIndex++;

        train();

      });

    }
    train = train.bind(this);

    train();

  }

  render(){
    return (
      <>
        <div class="mt-5 pb-5 pt-3">

          <div class="text-center">
            <img src={app_logo}  alt="" width="40" height="40"/>
            <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.MODELS_TRAINING}/>
          </div>

          { <div class="offset-2 col-8 mt-4 row">
          
              <div class="rounded border shadow-sm text-center pt-3">
                { <div>
                    <div class="progress my-3 col-6 mx-auto" style={{height: ".5em"}}  role="progressbar" aria-label="Animated striped example" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                      <div class={`progress-bar progress-bar-striped ${parseInt(this.state.currentStepProgressionStatus) != 100 && "progress-bar-animated"}`} style={{width: "100%"}}></div>
                    </div>
                    <p>
                      <span>
                        <span class="badge text-bg-primary fst-italic shadow-sm">
                          {`${this.state.steps[this.state.currentStepIndex]} ${this.state.currentFoldIndex ? `Step ${this.state.currentFoldIndex}/4` : ""} (${this.state.currentStepProgressionStatus} %) ...`}
                        </span>
                      </span>
                    </p> 
                  </div> }
              </div>

                  {/*Board*/}
                  { this.state.tensorBoardData 
                      && <div class="px-0">
                            <p class="text-decoration-underline fw-bold mb-1 mt-3 small ps-1">Board</p>
                            <div class="rounded border shadow-sm p-2">
                              <TensorBoardChart
                                data={this.state.tensorBoardData}/>
                            </div>
                          </div>}

                  {/*Logs*/}
                  <p class="text-decoration-underline fw-bold mb-1 mt-3 small ps-1">Logs</p>
                  <div class=/*bg-dark text-white*/"rounded border shadow-sm p-2 small vertical-scrollable" style={{maxHeight: "20em"}}>
                    { this.state.modelTrainingLogs.length == 0
                        && <p class="mb-1">model_training$</p> }
                    { this.state.modelTrainingLogs.length != 0
                        && this.state.modelTrainingLogs.map(log => <p class="mb-1">model_training$ {log}</p>) }
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
