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

/*import './SavedQuotesView.css'*/
import React from 'react';
import app_logo from '../assets/app_logo.png';
import { LockIcon, GithubIcon, SendIcon, TagIcon } from "./widgets/SVGs";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import default_user_icon from '../assets/user_icons/default.png';
import PageTitleView from "./widgets/PageTitleView";
import SearchInputView from "./widgets/SearchInputView";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { 
  appParams,
} from "./Local_library";
import eventBus from "./EventBus";

export default class SavedQuotesView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      searchText: null,
      deletionConfModalShow: false,
    };
  }

  componentDidMount() {

  }

  handleDeletionConfModalClose = () => this.setState({deletionConfModalShow: false});
  handleDeletionConfModalShow = () => this.setState({deletionConfModalShow: true});

  render(){
    return (
      <>

        <div class="mt-5 pb-5 pt-3">

            <div class="text-center">
              <img src={app_logo}  alt="" width="40" height="40"/>
              <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.SAVED_QUOTES}/>
            </div>

          <div class={"offset-2 col-8 mt-4"}>

            {/*Search input*/}
            <div class="my-4">
              <SearchInputView 
                objectStoreName="quotes" 
                globalData={this.props.globalData} />
                { this.state.searchText 
                    && <p class="fst-italic small text-muted border rounded p-1 fw-light mx-1">
                        {`${null} results for '${this.state.searchText}'`}
                      </p> }
            </div>

            { Array.from({length: 3}).map((_, item) => <a class="list-group-item list-group-item-action d-flex gap-3 py-3 p-3 border border-2 border-info rounded my-3" aria-current="true">
                                                        <img src={/*this.props.profile.avatar ? this.props.profile.avatar : default_user_icon*/default_user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                                                        <div class="d-flex gap-2 w-100 justify-content-between">
                                                          <div>
                                                            <div class="d-flex gap-2 align-items-center">
                                                              <h6 class="mb-0 d-flex align-items-center gap-1">
                                                                <a class="text-decoration-none text-black" href={`/index.html?view=Profile&data=${/*this.props.profile.url*/null}`} target="_blank">{/*dbDataSanitizer.preSanitize(this.props.profile.fullName)*/ "Freddy Mercury"}</a> 
                                                              </h6>
                                                              <small class="opacity-50 text-nowrap ms-auto">{/*LuxonDateTime.fromISO(this.props.profile.lastVisit.date).toFormat("MM-dd-yyyy")*/"2 hours ago"}</small>
                                                            </div>
                                                            <p class="fst-italic mb-0 opacity-75 small text-muted">
                                                              {/*dbDataSanitizer.preSanitize(this.props.profile.title)*/}
                                                              {`*** ${"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."} ***`}
                                                            </p>   
                                                            <div>
                                                              <button 
                                                                type="button" 
                                                                class="btn btn-light btn-sm text-danger"
                                                                onClick={this.handleDeletionConfModalShow}>
                                                                Delete
                                                              </button>
                                                            </div>     
                                                          </div>
                                                        </div>
                                                      </a>) }
          </div>

        </div>

        {/* Confirmation modal */}
        <Modal 
          show={this.state.deletionConfModalShow} 
          onHide={this.handleDeletionConfModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Confirmation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Do you confirm the deletion of this quote</p>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={this.handleDeletionConfModalClose} 
              className="shadow">
              Close
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={this.handleDeletionConfModalClose} 
              className="shadow">
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>


      </>
    );
  }
}
