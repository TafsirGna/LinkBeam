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

/*import './Profile.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import default_user_icon from '../assets/user_icons/default.png';
import boy_user_icon from '../assets/user_icons/boy.png';
import gamer_user_icon from '../assets/user_icons/gamer.png';
import man_user_icon from '../assets/user_icons/man.png';
import mom_user_icon from '../assets/user_icons/mom.png';
import lady_user_icon from '../assets/user_icons/lady.png';
import woman_user_icon from '../assets/user_icons/woman.png';
import moment from 'moment';
import { OverlayTrigger, Tooltip, Offcanvas } from "react-bootstrap";
import { 
	saveCurrentPageTitle, 
  appParams,
  getUserIcon,
  setGlobalDataSettings,
} from "./Local_library";
import { db } from "../db";
import eventBus from "./EventBus";

const productIdOverlayText = "Your unique identifier";

var iconsSet = {
  woman_user_icon: woman_user_icon,
  lady_user_icon: lady_user_icon,
  mom_user_icon: mom_user_icon,
  man_user_icon: man_user_icon,
  gamer_user_icon: gamer_user_icon,
  boy_user_icon: boy_user_icon,
  default_user_icon: default_user_icon,
}

export default class MyAccount extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      userIconOffCanvasShow: false,
      productIdOverlayText: productIdOverlayText,
    };
  }

  handleOffCanvasClose = () => {this.setState({userIconOffCanvasShow: false})};
  handleOffCanvasShow = () => {this.setState({userIconOffCanvasShow: true})};

  componentDidMount() {

    // Saving the current page title
    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.MY_ACCOUNT);

  	if (!this.props.globalData.settings){
      setGlobalDataSettings(db, eventBus);
    }
    
  }

  componentDidUpdate(prevProps, prevState){

  }

  async changeUserIcon(icon_title){

    var settings = this.props.globalData.settings;
    settings.userIcon = icon_title;
    await db.settings.update(1, settings);

    // closing the offcanvas
    this.handleOffCanvasClose();

  }

  verifyAccount(){

  }

  copyToClipboard(){

    if (!this.props.globalData.settings){
      return;
    }

    if (!navigator.clipboard) {
      console.error('Async: Could not copy text: 1');
      // fallbackCopyTextToClipboard(text);
      return;
    }

    navigator.clipboard.writeText(this.props.globalData.settings.productID).then((function() {
      this.setState({productIdOverlayText: "Copied!"}, () => {
          setTimeout(() => {
              this.setState({productIdOverlayText: productIdOverlayText});
            }, appParams.TIMER_VALUE
          );
        });
      }).bind(this), 
      function(err) {
        console.error('Async: Could not copy text: ', err);
      }
    );

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.SETTINGS}/>
          <div class="">
            <div class="text-center">
            	<img src={this.props.globalData.settings ? getUserIcon(this.props.globalData.settings.userIcon, iconsSet) : null} onClick={() => {this.handleOffCanvasShow()}} alt="twbs" width="60" height="60" class="handy-cursor shadow rounded-circle flex-shrink-0" title="Click to change"/>
            </div>
            <div class="mx-auto w-75 mt-4">
            	<OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip1">{this.state.productIdOverlayText}</Tooltip>}
              >
                <div class="input-group mb-3 shadow input-group-sm" onClick={() => {this.copyToClipboard();}}>
								  <span class="input-group-text handy-cursor" id="basic-addon1">ID</span>
								  { this.props.globalData.settings && <input disabled type="text" class="form-control" placeholder="Product ID" aria-label="Username" aria-describedby="basic-addon1" value={this.props.globalData.settings.productID} /> }
								</div>
              </OverlayTrigger>
            	<hr/>
            	{ this.props.globalData.settings && <p class="fst-italic opacity-50 mb-0 badge bg-light-subtle text-light-emphasis rounded-pill border border-info-subtle">Installed since {moment(this.props.globalData.settings.installedOn).format('MMMM Do YYYY, h:mm:ss a')}</p> }

              {/*<div class="text-center">
                <button type="button" class="btn btn-primary badge mt-3" onClick={() => {this.verifyAccount()}} >
                  Verify my account
                </button>
              </div>*/}
            </div>
          </div>
        </div>

        <Offcanvas show={this.state.userIconOffCanvasShow} onHide={this.handleOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>User Icons</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div class="row">
              <div class="col text-center">
                <img width="60" height="60" src={default_user_icon} onClick={() => {this.changeUserIcon("default")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 mb-3" title="Default"/>
                <img width="60" height="60" src={boy_user_icon} onClick={() => {this.changeUserIcon("boy")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 my-3" title="Boy"/>
                <img width="60" height="60" src={gamer_user_icon} onClick={() => {this.changeUserIcon("gamer")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 my-3" title="Gamer"/>
              </div>
              <div class="col text-center">
                <img width="60" height="60" src={man_user_icon} onClick={() => {this.changeUserIcon("man")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 mb-3" title="Man"/>
                <img width="60" height="60" src={mom_user_icon} onClick={() => {this.changeUserIcon("mom")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 my-3" title="Mom"/>
              </div>
              <div class="col text-center">
                <img width="60" height="60" src={lady_user_icon} onClick={() => {this.changeUserIcon("lady")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 mb-3" title="Lady"/>
                <img width="60" height="60" src={woman_user_icon} onClick={() => {this.changeUserIcon("woman")}} alt="twbs" class="handy-cursor shadow rounded-circle flex-shrink-0 my-3" title="Woman"/>
              </div>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
      </>
    );
  }
}
