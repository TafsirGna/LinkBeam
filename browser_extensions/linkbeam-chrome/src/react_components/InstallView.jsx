/*import './About.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import import_icon from '../assets/import_icon.png';
import party_popper_icon from '../assets/party-popper_icon.png';
import new_icon from '../assets/new_icon.png';
import { 
  appParams
} from "./Local_library";

export default class About extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      opDone: false,
    };
  }

  componentDidMount() {

  }

  onNewInstanceClicked(){

    this.setState({opDone: true});

  }

  onImportDataClicked(){

    const formFile = document.getElementById("formFile");
    formFile.click();

    this.setState({opDone: true});

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

            {!this.state.opDone && <div class="mt-5 text-center row">
                          <div onClick={() => {this.onImportDataClicked()}} class="col shadow rounded mx-2 py-5 handy-cursor">
                            <img src={import_icon} alt="twbs" width="40" height="40" class=""/>
                            <p class="mt-3">Import data</p>
                          </div>
                          <div onClick={() => {this.onNewInstanceClicked()}} class="col shadow rounded mx-2 py-5 handy-cursor">
                            <img src={new_icon} alt="twbs" width="40" height="40" class=""/>
                            <p class="mt-3">New Instance</p>
                          </div>
                        </div>}

            { this.state.opDone && <div class="mt-5 text-center row">
                          <div onClick={() => {this.onImportDataClicked()}} class="col shadow rounded mx-2 py-5 handy-cursor">
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
