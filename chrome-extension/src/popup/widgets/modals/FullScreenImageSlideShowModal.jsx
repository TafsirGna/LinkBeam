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

import '../../assets/css/FullScreenImageSlideShowModal.css'
import React from 'react'
// import { 
// } from "../../Local_library";

const imgMaxHeight = "20em";

export default class FullScreenImageSlideShowModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      activeSlideIndex: null,
    };

    this.setActiveSlideIndex = this.setActiveSlideIndex.bind(this);
    this.plusSlides = this.plusSlides.bind(this);
    this.currentSlide = this.currentSlide.bind(this);

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){
    if (prevProps.images != this.props.images){
      if (this.props.images){
        this.setActiveSlideIndex(0);
      }
    }
  }

  componentWillUnmount(){

  }

  // Next/previous controls
  plusSlides(n) {
    this.setActiveSlideIndex(this.state.activeSlideIndex += n);
  }

  // Thumbnail image controls
  currentSlide(n) {
    this.setActiveSlideIndex(n);
  }

  setActiveSlideIndex(n){
    var activeSlideIndex = n;
    if (n >= this.props.images.length) {activeSlideIndex = 0}
    if (n < 0) {activeSlideIndex = this.props.images.length - 1}
    this.setState({activeSlideIndex: activeSlideIndex});
  }

  render(){
    return (
      <>
        {/*<!-- The Modal/Lightbox -->*/}
        <div id="slideShow-myModal" class="slideShow-modal" style={{display: this.props.images ? "block" : "none"}}>
          <span class="slideShow-close slideShow-cursor" onClick={this.props.onHide}>&times;</span>
          <div class="slideShow-modal-content">

            { this.props.images
                && <>
                    { this.props.images.map((image, index) => <div 
                                                                class="slideShow-mySlides text-center" 
                                                                style={{display: this.state.activeSlideIndex == index ? "block" : "none"}}>
                                                                <div class="slideShow-numbertext">{index + 1} / 4</div>
                                                                <img
                                                                  // class="rounded" 
                                                                  src={image} 
                                                                  style={{maxHeight: "20em"}}/>
                                                              </div>) }
                  </>}

            {/*<!-- Next/previous controls -->*/}
            <span class="slideShow-prev" onClick={() => this.plusSlides(-1)}>&#10094;</span>
            <span class="slideShow-next" onClick={() => this.plusSlides(1)}>&#10095;</span>

            {/*<!-- Caption text -->*/}
            <div class="slideShow-caption-container">
              <p id="slideShow-caption">{`Image_${this.state.activeSlideIndex + 1}`}</p>
            </div>

            {/*<!-- Thumbnail image controls -->*/}
            { this.props.images
                && <>
                    { this.props.images.map((image, index) => <div class="slideShow-column text-center" style={{width: `${(100 / this.props.images.length).toFixed(0)}%`}}>
                                                                <img 
                                                                  class={`rounded slideShow-demo ${this.state.activeSlideIndex == index ? "active" : ""}`} 
                                                                  src={image} 
                                                                  onClick={() => this.currentSlide(index)} 
                                                                  style={{maxHeight: "10em"}}
                                                                  alt={`Image_${index + 1}`}/>
                                                              </div>) }
                  </>}
          </div>
        </div>
      </>
    );
  }
}
