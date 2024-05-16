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

/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import import_icon from '../assets/import_icon.png';
import party_popper_icon from '../assets/party-popper_icon.png';
import new_icon from '../assets/new_icon.png';
import Alert from 'react-bootstrap/Alert';
import { db } from "../db";
import { v4 as uuidv4 } from 'uuid';
import { 
  appParams, 
  removeObjectsId,
} from "./Local_library";
import Dexie from 'dexie';

export default class About extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      alertMessage: "",
      alertTagShow: false,
      alertVariant: "warning",
      opDone: false,
      processing: false,
    };

    this.resetDb = this.resetDb.bind(this);
    this.handleAlertViewShow = this.handleAlertViewShow.bind(this);
    this.setFormFileElement = this.setFormFileElement.bind(this);
    this.onImportDataClicked = this.onImportDataClicked.bind(this);
    this.onNewInstanceClicked = this.onNewInstanceClicked.bind(this);

  }

  componentDidMount() {

    // checking first if a database already exists
    Dexie.exists(appParams.appDbName).then((function (exists) {
        if (exists) {
            this.setState({opDone: true, processing: false});
            return;
        }
        this.setFormFileElement();
    }).bind(this));

  }

  setFormFileElement(){

    // listening for an input change event
    const formFileElement = document.getElementById("formFile");
    formFileElement.onchange = (e => { 
    
      this.setState({processing: true}, () => {

        const file = e.target.files[0]; 

        try{

          // setting up the reader
          var reader = new FileReader();
          reader.readAsText(file,'UTF-8');

          // here we tell the reader what to do when it's done reading...
          reader.onload = readerEvent => {
            var content = readerEvent.target.result; // this is the content!

            try {
              content = JSON.parse(content);
            } catch (error) {

              this.setState({processing: false}, () => {
                console.error(`${message} : `, error);
                
                this.handleAlertViewShow("Something wrong happent with the uploaded file. Check the file and try again! ", "warning", () => {
                    setTimeout(() => {
                      this.setState({alertMessage: "", alertTagShow: false});
                    }, appParams.TIMER_VALUE);
                })

              });

              return;
            }

            

            (async () => {

              try{

                if (content.dbVersion > appParams.appDbVersion){
                  this.handleAlertViewShow(`The imported file version is ${content.dbVersion} and superior than this app database version (${appParams.appDbVersion})!`, "danger");
                  return;
                }

                // initialize the db with the received data
                for (var objectStoreName in content.objectStores){
                  if (content.objectStores[objectStoreName].length){
                    var objects = content.objectStores[objectStoreName];
                    objects = removeObjectsId(objects);
                    await db[objectStoreName].bulkAdd(objects);
                  }
                }

                localStorage.setItem('currentPageTitle', appParams.COMPONENT_CONTEXT_NAMES.HOME);

                this.setState({opDone: true, processing: false});

              }
              catch(error){
                console.error("Error : ", error);
                this.handleAlertViewShow("An error occured when setting up the extension! ", "danger");
                this.resetDb();
              }

            }).bind(this)();

          }

        }
        catch(error){
          console.error("Error : ", error);
          this.handleAlertViewShow("An error occured when setting up the extension! ", "danger");
          this.setState({opDone: false, processing: false});
        }

      });

    }).bind(this);

  }

  async resetDb(){

    db.delete().then(() => {
        console.log("Database successfully deleted");
    }).catch((err) => {
        console.error("Could not delete database");
    }).finally(() => {
        // Do what should be done next...
        this.setState({opDone: false, processing: false});
    });

  }

  handleAlertViewShow(message, alertVariant, callback = null){

    this.setState({alertMessage: message, alertTagShow: true, alertVariant: alertVariant}, () => {
      if (callback){
        callback();
      }
    });

  }

  onNewInstanceClicked(){

    Dexie.exists(appParams.appDbName).then((function (exists) {
        if (exists) {
            this.handleAlertViewShow("A previous database already exists!", "danger");
            return;
        }

        openNewDb();

    }).bind(this));

    function openNewDb(){

      // Send message to the background
      this.setState({processing: true}, () => {

        db.open().then((async function (db) {
        
          // Database opened successfully
          // Initializing the db with settings data
          const id = await db.settings.add({
              notifications: true,
              lastDataResetDate: new Date().toISOString(),
              installedOn: new Date().toISOString(),
              productID: uuidv4(), 
              userIcon: "default",
              outdatedProfileReminder: "> 1 year",
              maxTimeAlarm: "1 hour",
              autoTabOpening: true,
          });

          localStorage.setItem('currentPageTitle', appParams.COMPONENT_CONTEXT_NAMES.HOME);

          this.setState({opDone: true, processing: false});

        }).bind(this)).catch ((function (err) {

          // Error occurred
          this.setState({processing: false});
          this.handleAlertViewShow("Failed to initialized the app. Try again later!", "danger");
        
        }).bind(this));

      });

    }

    openNewDb = openNewDb.bind(this);

  }

  onImportDataClicked(){

    Dexie.exists(appParams.appDbName).then((function (exists) {
        if (exists) {
            this.handleAlertViewShow("A previous database already exists!", "danger");
            return;
        }

        const formFileElement = document.getElementById("formFile");
        formFileElement.click();

    }).bind(this));

  }

  render(){
    return (
      <>
        
        <div class="row">
          <div class="col-6 offset-3">
            <div class="text-center mt-5">
              <img src={app_logo} alt="twbs" width="40" height="40" class=""/>
              <h6 class="mt-3">{appParams.appName}</h6>
            </div>
            <h5 class="mt-4 text-center">Thank you for installing <b>{appParams.appName}</b>. Let's get you started</h5>

            { this.state.alertTagShow && <Alert className="my-3 small fst-italic" key={this.state.alertVariant} variant={this.state.alertVariant} dismissible>
                                            {this.state.alertMessage}
                                          </Alert>}

            { !this.state.opDone && !this.state.processing && <div class="mt-5 text-center row">
                          <div onClick={() => {this.onImportDataClicked()}} class="col shadow rounded mx-2 py-5 handy-cursor border border-secondary-subtle">
                            <img src={import_icon} alt="twbs" width="40" height="40" class=""/>
                            <p class="mt-3">Import data</p>
                          </div>
                          <div onClick={() => {this.onNewInstanceClicked()}} class="col shadow rounded mx-2 py-5 handy-cursor border border-secondary-subtle">
                            <img src={new_icon} alt="twbs" width="40" height="40" class=""/>
                            <p class="mt-3">New Instance</p>
                          </div>
                        </div>}

            { !this.state.opDone && this.state.processing && <div class="text-center mt-5"><div class="spinner-border text-primary" role="status">
                                                        <span class="visually-hidden">Loading...</span>
                                                      </div></div>}

            { this.state.opDone && <div class="mt-5 text-center row">
                          <div onClick={() => {this.onImportDataClicked()}} class="col shadow rounded mx-2 py-5 border border-secondary-subtle">
                            <img src={party_popper_icon} alt="twbs" width="40" height="40" class=""/>
                            <p class="mt-3">Your app is ready for use</p>
                          </div>
                        </div>}

          </div>

          <div class="mb-3 d-none">
            <label for="formFile" class="form-label">Default file input example</label>
            <input class="form-control" type="file" id="formFile"/>
          </div>

        </div>

      </>
    );
  }
}
