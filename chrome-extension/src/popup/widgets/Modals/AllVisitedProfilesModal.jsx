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

/*import './AllPostsModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { AlertCircleIcon } from "../SVGs";
import { 
  dbDataSanitizer,
  getProfileDataFrom,
} from "../../Local_library";
import { db } from "../../../db";
import SearchInputView from "../SearchInputView";
import ProfileListItemView from "../ListItems/ProfileListItemView";

export default class AllVisitedProfilesModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      processing: false,
      searchText: null,
      allProfiles: null,
    };

    this.setProfiles = this.setProfiles.bind(this);

  }

  componentDidMount() {

    this.setProfiles();

  }

  componentDidUpdate(prevProps, prevState){

  }

  componentWillUnmount(){
    
  }

  async setProfiles(){

    var allProfiles = [];
    const visits = (await db.visits.filter(visit => Object.hasOwn(visit, "profileData"))
                                   .toArray())
                      .filter((value, index, self) => self.findIndex(v => v.url == value.url) === index);

    for (const visit of visits){
      allProfiles.push(await getProfileDataFrom(db, visit.url));
    }

    this.setState({allProfiles: allProfiles});

  }

  onSearchTextChange = data => this.setState({
                                                searchText: data.searchText,
                                                processing: true,
                                              }, () => {
                                                setTimeout(() => {
                                                  this.setState({processing: false});
                                                }, 1000);
                                              });

  getProfiles = () => this.state.allProfiles.filter(profile => ((this.state.searchText && profile.fullName.toLowerCase().includes(this.state.searchText.toLowerCase()))
                                                                    || (!this.state.searchText && true))
                                                                  && ((this.props.hiddenProfiles && !this.props.hiddenProfiles.includes(profile.url))
                                                                        || (!this.props.hiddenProfiles && true)))



  render(){
    return (
      <>
        <Modal 
          show={this.props.show} 
          onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Profiles</Modal.Title>
          </Modal.Header>
          <Modal.Body>

          	{ !this.state.allProfiles 
                && <div class="text-center">
                    <div class="mb-5 mt-4">
                      <div class="spinner-border text-primary" role="status">
                        {/*<span class="visually-hidden">Loading...</span>*/}
                      </div>
                      <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                    </div>
                  </div>}

            { this.state.allProfiles
        		    && <div>

            				{this.state.allProfiles.length == 0
    		                  && <div class="text-center m-5">
    		                        <AlertCircleIcon size="100" className="text-muted"/>
    		                        <p><span class="badge text-bg-primary fst-italic shadow">No profiles yet</span></p>
    		                      </div>}

            				{ this.state.allProfiles.length != 0
                        		&& <div>

                                {/*Search input*/}
                                <div class="my-4">
                                  <SearchInputView 
                                    objectStoreName="visited_profiles" 
                                    globalData={this.props.globalData} 
                                    searchTextChanged={data => this.onSearchTextChange(data)}/>
                                    { this.state.searchText 
                                        && <p class="fst-italic small text-muted border rounded p-1 fw-light mx-1">
                                            {`${this.getProfiles().length} result${this.getProfiles().length > 1 ? "s" : ""} for '${this.state.searchText}'`}
                                          </p> }
                                </div>

                                { this.state.processing 
                                    && <div class="text-center">
                                        <div class="mb-5 mt-4">
                                          <div class="spinner-border text-primary" role="status">
                                            {/*<span class="visually-hidden">Loading...</span>*/}
                                          </div>
                                          <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                                        </div>
                                      </div> }

      			                    { !this.state.processing
                                    &&  <div class="list-group m-1 shadow-sm small"> 
                                          {this.getProfiles().map(profile => <ProfileListItemView 
                                                                                profile={profile}
                                                                                onClick={() => {this.props.onProfileItemClick(profile)}}
                                                                                title={this.props.itemViewTitle}/>)}
                                        </div>}

    			                  	</div>}

            		   </div>}      

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
