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
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import PageTitleView from "./widgets/PageTitleView";
import FullScreenImageModal from "./widgets/Modals/FullScreenImageModal";
import { 
  appParams,
} from "./Local_library";

export default class PostsWithSameImageView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      imageSrc: null,
      fsImage: null,
    };
  }

  componentDidMount() {
    (async () => {
      this.setState({imageSrc: (await chrome.storage.session.get(["imageSrc"])).imageSrc});
    }).bind(this)();
  }

  handleFsImageModalClose = () => this.setState({fsImage: null});
  handleFsImageModalShow = () => this.setState({fsImage: {src: this.state.imageSrc}});

  render(){
    return (
      <>
        <div class="mt-5 pb-5 pt-3">

          <div class="text-center">
            <img src={app_logo}  alt="" width="40" height="40"/>
            <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.POSTS_WITH_SAME_IMAGE}/>
          </div>

          <div class="offset-1 col-10 mt-4 row">
            <div class="rounded border shadow-sm text-center">
              { this.state.imageSrc 
                  && <div class="mt-3">
                      <img 
                        class="rounded shadow" 
                        src={this.state.imageSrc} 
                        alt="" 
                        width="200" 
                        height="200"
                        onMouseEnter={this.handleFsImageModalShow}/>
                    </div>}
              <div>
                <div class="progress my-3 col-6 mx-auto" style={{height: ".5em"}}  role="progressbar" aria-label="Animated striped example" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                  <div class="progress-bar progress-bar-striped progress-bar-animated" style={{width: "100%"}}></div>
                </div>
                <p><span class="badge text-bg-primary fst-italic shadow-sm">Searching...</span></p>
              </div>
            </div>
          </div>

        </div>

        <FullScreenImageModal
          image={this.state.fsImage}
          onHide={this.handleFsImageModalClose}
          />

      </>
    );
  }
}
