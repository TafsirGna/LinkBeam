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

/*import './ImageLoader.css'*/
import React from 'react';
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { 
// } from "./Local_library";
import picture_icon from '../../assets/picture_icon.png';

export default class ImageLoader extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      imageLoaded: false,
      errorLoading: false,
    };
  }

  componentDidMount() {

  }

  render(){
    return (
      <>
        
        {!this.state.imageLoaded && <div class="mt-1 text-center">
                                          <div class={`spinner-border text-secondary ${this.props.spinnerSize && this.props.spinnerSize == "small" ? "spinner-border-sm" : ""}`} role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div>
                                        </div>}
        
        <img 
          src={!this.state.errorLoading ? this.props.imgSrc : (this.props.errorSrc || picture_icon)} 
          class={this.props.imgClass} 
          onLoad={() => {this.setState({imageLoaded: true});}} 
          onerror={() => {this.setState({errorLoading: true})}}/>

      </>
    );
  }
}
