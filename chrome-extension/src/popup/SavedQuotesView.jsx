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
import { AlertCircleIcon } from "./widgets/SVGs";
import default_user_icon from '../assets/user_icons/default.png';
import PageTitleView from "./widgets/PageTitleView";
import SearchInputView from "./widgets/SearchInputView";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { 
  appParams,
} from "./Local_library";
import { db } from "../db";
import { liveQuery } from "dexie";
import { DateTime as LuxonDateTime } from "luxon";

export default class SavedQuotesView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      searchText: null,
      quotes: null,
      selectedQuote: null,
    };

    this.deleteQuote = this.deleteQuote.bind(this);
  }

  componentDidMount() {

    this.quoteSubscription = liveQuery(() => db.quotes.toArray())
                              .subscribe(
      result => this.setQuotes(result),
      error => this.setState({error})
    );

  }

  handleDeletionConfModalClose = () => this.setState({selectedQuote: null});
  handleDeletionConfModalShow = (quote) => this.setState({selectedQuote: quote});

  componentWillUnmount(){

    if (this.quoteSubscription) {
      this.quoteSubscription.unsubscribe();
      this.quoteSubscription = null;
    }

  }

  async setQuotes(quotes){

    for (var quote of quotes){
      quote.profile = await db.feedProfiles.where({uniqueId: quote.profileId}).first();
    }

    this.setState({quotes: quotes});

  }

  async deleteQuote(){
    await db.quotes.delete(this.state.selectedQuote.id);
    this.handleDeletionConfModalClose();
  }

  render(){
    return (
      <>

        <div class="mt-5 pb-5 pt-3">

            <div class="text-center">
              <img src={app_logo}  alt="" width="40" height="40"/>
              <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.SAVED_QUOTES}/>
            </div>

          <div class={"offset-2 col-8 mt-4"}>

            { !this.state.quotes 
              && <div class="text-center">
                  <div class="mb-5 mt-5">
                    <div class="spinner-border text-primary" role="status">
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                  </div>
                </div> }

            { this.state.quotes
              && <div>
                  { this.state.quotes.length == 0
                      && <div class="mt-5">

                          <div class="alert alert-secondary d-flex align-items-center py-1 fst-italic small shadow-sm mx-5" role="alert">
                            <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:" width="16">
                              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path>
                            </svg>
                            <div>
                              To create quote, select a text of a post on Linkedin's feed, right-click > 'Save a quote'.
                            </div>
                          </div>

                          <div class="text-center m-5 border shadow-lg rounded p-5 mt-2">
                            <AlertCircleIcon size="100" className="text-muted"/>
                            <p><span class="badge text-bg-primary fst-italic shadow-sm">No quotes saved yet</span></p>
                          </div>
                        </div> }

                  { this.state.quotes.length != 0
                      && <div>
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

                            { this.state.quotes.map(object => <a class="list-group-item list-group-item-action d-flex gap-3 py-3 p-3 border border-2 border-info rounded my-3" aria-current="true">
                                                                        <img src={object.profile.picture || default_user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0"/>
                                                                        <div class="d-flex gap-2 w-100 justify-content-between">
                                                                          <div class="w-100">
                                                                            <div class="d-flex gap-2 align-items-center">
                                                                              <h6 class="mb-0 d-flex align-items-center gap-1">
                                                                                <a class="text-decoration-none text-black" href={object.profile.url} target="_blank">{/*dbDataSanitizer.preSanitize(this.props.profile.fullName)*/ object.profile.name}</a> 
                                                                              </h6>
                                                                              <small class="opacity-50 text-nowrap ms-auto">{LuxonDateTime.fromISO(object.createdOn).toFormat("MM-dd-yyyy")}</small>
                                                                            </div>
                                                                            <p class="fst-italic mb-0 opacity-75 small text-muted">
                                                                              {/*dbDataSanitizer.preSanitize(this.props.profile.title)*/}
                                                                              {`*** ${object.text /*"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."*/} ***`}
                                                                            </p>   
                                                                            <div>
                                                                              <button 
                                                                                type="button" 
                                                                                class="btn btn-light btn-sm text-danger"
                                                                                onClick={() => {this.handleDeletionConfModalShow(object)}}>
                                                                                Delete
                                                                              </button>
                                                                            </div>     
                                                                          </div>
                                                                        </div>
                                                                      </a>) }
                        </div> }
                </div> }

          </div>

        </div>

        {/* Confirmation modal */}
        <Modal 
          show={this.state.selectedQuote} 
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
              onClick={this.deleteQuote} 
              className="shadow">
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>


      </>
    );
  }
}
