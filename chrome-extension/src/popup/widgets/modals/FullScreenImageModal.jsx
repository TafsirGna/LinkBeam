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

import '../../assets/css/FullScreenImageModal.css'
import React from 'react'
// import { 
// } from "../../Local_library";

export default class FullScreenImageModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

  }

  componentWillUnmount(){

  }

  render(){
    return (
      <>
        {/*<!-- The Modal -->*/}
        <div id="fsi-myModal" class="fsi-modal" style={{display: this.props.image ? "block" : "none"}}>

          {/*<!-- The Close Button -->*/}
          <span class="fsi-close" onClick={this.props.onHide}>&times;</span>

          {/*<!-- Modal Content (The Image) -->*/}
          <img 
            class="fsi-modal-content" 
            id="fsi-img01"
            src={this.props.image ? (this.props.image.src || this.props.image.poster) : null}/>

          {/*<!-- Modal Caption (Image Text) -->*/}
          { this.props.image 
              && <div id="fsi-caption">{this.props.image.src ? "Image" : "Video"}</div>}
        </div>
      </>
    );
  }
}
