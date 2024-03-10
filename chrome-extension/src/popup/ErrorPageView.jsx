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
import {  
  appParams,
} from "./Local_library";
import { AlertCircleIcon } from "./widgets/SVGs";

export default class ErrorPageView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  render(){
    return (
      <>

        <div class="text-center mt-5">
          <span class="badge text-bg-warning shadow">Warning</span>
        </div>
        
        <div class="text-center m-5 mt-3">
          <AlertCircleIcon size="100" className="text-muted"/>
          <p class="mt-2 small fw-light">
            {this.props.data == "missingDb" && <span>Your <span class="badge text-bg-primary">{appParams.appName}</span> app is not properly set yet. Go to the <a href="/install.html" target="_blank">Setup</a> page to set it up</span>}
          </p>
        </div>

      </>
    );
  }
}
