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
} from "./Local_library";
import { db } from "../db";

export default class ModelsTrainingView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };

  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps, prevState){

  }

  // handleFsImageModalClose = () => this.setState({fsImage: null});
  // handleFsImageModalShow = () => this.setState({fsImage: {src: this.state.imageSrc}});

  render(){
    return (
      <>
        <div class="mt-5 pb-5 pt-3">

          <div class="text-center">
            <img src={app_logo}  alt="" width="40" height="40"/>
            <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.MODELS_TRAINING}/>
          </div>

          <div class="offset-2 col-8 mt-4 row">

          </div>

        </div>

      </>
    );
  }
}
