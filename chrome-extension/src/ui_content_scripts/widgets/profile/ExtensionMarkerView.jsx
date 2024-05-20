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

/*import './ExtensionMarkerView.css'*/
import React from 'react';
import { Popover } from "flowbite-react";

export default class ExtensionMarkerView extends React.Component{

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
        <div>
          <Popover
            aria-labelledby="default-popover"
            content={
              <div className="w-64 text-base text-gray-500 dark:text-gray-400">
                <div className="px-3 py-2 text-center font-bold">
                  <p>Click to see all the analysis</p>
                </div>
              </div>
            }
            arrow={false}
            trigger="hover">
              <img 
                src={chrome.runtime.getURL("/assets/app_logo.png")} 
                height="20" 
                width="20"
                onClick={this.props.onClick}
                class="ms-auto handy-cursor me-3"
                /*title="Click to see analysis"*//>
          </Popover>
        </div>
      </>
    );
  }
}
