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

/*import './FeedPostHiddenMarkerView.css'*/

import React from 'react';
// import {  
//   Tooltip, 
// } from "flowbite-react";
import{
  getFeedPostHtmlElement,
} from "../../injected_scripts/main_lib";

export default class FeedPostHiddenMarkerView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      markerShow: true,
    };

    this.showPost = this.showPost.bind(this);

  }

  componentDidMount() {

  }

  componentWillUnmount(){

  }

  showPost(){

    getFeedPostHtmlElement(this.props.htmlElId).querySelector(".feed-shared-update-v2").style.cssText = "display: block;";
    this.setState({markerShow: false});

  }

  render(){
    return (
      <>
        
        { this.state.markerShow 
            && <div id="alert-border-4" class="flex items-center p-4 mb-4 text-yellow-800 border-t-4 border-yellow-300 bg-yellow-50 dark:text-yellow-300 dark:bg-gray-800 dark:border-yellow-800" role="alert">
                  {/*<Tooltip content="Too much views">*/}
                    <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                    </svg>
                  {/*</Tooltip>*/}
                  <div class="ms-3 text-sm font-medium">
                    You chose in the settings to hide this post. Click <a onClick={this.showPost} class="handy-cursor italic font-semibold underline hover:no-underline">here</a> to show the post. (<b><i>Reason: </i></b> # views exceeded)
                  </div>
                </div>}

      </>
    );
  }
}
