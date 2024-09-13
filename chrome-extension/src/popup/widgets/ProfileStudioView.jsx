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

/*import './ProfileStudioView.css'*/
import React from 'react';
import { 
  OverlayTrigger, 
  Tooltip, 
  Popover, 
  Offcanvas 
} from "react-bootstrap";
import app_logo from '../../assets/app_logo.png';
import default_user_icon from '../../assets/user_icons/default.png';
import PageTitleView from "./PageTitleView";
import { 
  appParams,
} from "../Local_library";
import { db } from "../../db";
import { v4 as uuidv4 } from 'uuid';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import AllVisitedProfilesModal from "./Modals/AllVisitedProfilesModal";
import { LayersIcon } from "./SVGs";
import { DateTime as LuxonDateTime } from "luxon";
import { liveQuery } from "dexie";

export default class ProfileStudioView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profileStudio: null,
      allVisitedProfilesModalShow: false,
      insightsOffCanvasShow: false,
      uIRefresher: false, 
    };

    this.deleteStudio = this.deleteStudio.bind(this);
  }

  componentDidMount() {

    (async () => {

      var profileStudio = null;
      if (!this.props.object){
        const dateTime = new Date().toISOString();
        profileStudio = {
          name: `Profile Studio ${await db.profileStudios.count()}`,
          description: "",
          createdOn: dateTime,
          updatedOn: dateTime,
          uniqueId: uuidv4(),
          profiles: [],
        };
        await db.profileStudios.add(profileStudio)
                               .then(id => {
                                  profileStudio.id = id;
                               }); 
      }
      else{
        profileStudio = this.props.object;
      }

      this.profileStudioSubscription = liveQuery(() => db.profileStudios
                                                          .where({uniqueId: profileStudio.uniqueId})
                                                          .first()).subscribe(
        result => this.setState({profileStudio: result}),
        error => this.setState({error})
      );

    })();

    // Every minute, the ui is refreshed
    setInterval(() => {
      this.setState({uIRefresher: !this.state.uIRefresher});
    }, 10000);

  }

  async deleteStudio(){
    if (confirm("Do you want to delete this studio ?")){
      await db.profileStudios.delete(this.state.profileStudio.id);
      window.close();
    }
  }

  componentWillUnmount(){
    if (this.profileStudioSubscription) {
      this.profileStudioSubscription.unsubscribe();
      this.profileStudioSubscription = null;
    }
  }

  handleAllVisitedProfilesModalClose = () => this.setState({allVisitedProfilesModalShow: false});
  handleAllVisitedProfilesModalShow = () => this.setState({allVisitedProfilesModalShow: true});

  handleInsightsOffCanvasClose = () => this.setState({insightsOffCanvasShow: false});
  handleInsightsOffCanvasShow = () => this.setState({insightsOffCanvasShow: true});

  handleNameInputChange = async (event) => await db.profileStudios.update(this.state.profileStudio.id, { name: event.target.value, updatedOn: new Date().toISOString() });

  handleDescriptionInputChange = async (event) => await db.profileStudios.update(this.state.profileStudio.id, { description: event.target.value, updatedOn: new Date().toISOString() });

  render(){
    return (
      <>

        <div class="mt-5 pb-5 pt-3">

          <div class="text-center">
            <img src={app_logo}  alt="" width="40" height="40"/>
            <PageTitleView pageTitle="Profile Studio"/>
          </div>

          { this.state.profileStudio 
              && <div class="offset-1 col-10 mt-4 row">
          
                  <div class="col-3">

                    <div class="p-2 border rounded shadow-sm">
                      <span class="badge bg-primary-subtle border border-primary-subtle text-primary-emphasis rounded-pill pb-0 fst-italic">Updated {LuxonDateTime.fromISO(this.state.profileStudio.updatedOn).toRelative()}</span>

                      <Form.Floating className="my-2 shadow-sm">
                        <Form.Control
                          id="studioName"
                          type="text"
                          value={this.state.profileStudio.name}
                          onChange={this.handleNameInputChange}
                        />
                        <label htmlFor="studioName">Name</label>
                      </Form.Floating>  

                      <FloatingLabel 
                        className="shadow-sm"
                        controlId="studioDescription" 
                        label="Description">
                        <Form.Control
                          as="textarea"
                          placeholder="Studio description here"
                          value={this.state.profileStudio.description}
                          onChange={this.handleDescriptionInputChange}
                          style={{ height: '100px' }}
                        />
                      </FloatingLabel>

                      <button 
                        type="button" 
                        class="btn btn-outline-danger mt-3 shadow-sm w-100 btn-sm"
                        onClick={this.deleteStudio}>
                        Delete studio
                      </button>
                    </div>

                  </div>
                  <div class="col-9">
                    <div class="border rounded shadow-sm p-2">
                      <OverlayTrigger 
                        trigger="click" 
                        placement="left" 
                        overlay={ <Popover 
                                    id="popover-basic"
                                    className="shadow">
                                    <Popover.Body>
                                      {!this.state.profileStudio.profiles.length 
                                          && <p class="my-0">No profiles</p>}
                                      {this.state.profileStudio.profiles.map(profile => <div class="">
                                                                                          <img src={profile.avatar || default_user_icon} alt="twbs" width="40" height="40" class="shadow rounded-circle flex-shrink-0 me-2"/>
                                                                                          <span>
                                                                                            {profile.fullName}
                                                                                          </span>
                                                                                        </div>)}
                                    </Popover.Body>
                                  </Popover>}
                        >
                        <button type="button" class="btn btn-light mx-1 text-muted btn-sm">{this.state.profileStudio.profiles.length}+ profiles</button>
                      </OverlayTrigger>
                      <button 
                        type="button" 
                        class="btn btn-outline-success mx-1 btn-sm"
                        onClick={this.handleAllVisitedProfilesModalShow}>
                        Add profile
                      </button>

                      <div class="dropdown float-end m-3 mt-1 bd-gray">
                        <div 
                          class="dropdown-toggle handy-cursor" 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false" 
                          title="Actions">
                          <LayersIcon 
                            size="18" 
                            className=""/>
                        </div>
                        <ul class="dropdown-menu shadow-lg">
                          <li>
                            <a 
                              class="dropdown-item small" 
                              href="#" 
                              onClick={this.handleInsightsOffCanvasShow}
                              title="Derive insights">
                              {/*<BarChartIcon
                                  size="15"
                                  className="me-2 text-muted"/>*/}
                              Insights
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
      
                </div>}

        </div>

        {/*All profiles Modal*/}
        <AllVisitedProfilesModal
          show={this.state.allVisitedProfilesModalShow}
          onHide={this.handleAllVisitedProfilesModalClose}/>

        {/*Insights Offcanvas*/}
        <Offcanvas 
          show={this.state.insightsOffCanvasShow} 
          onHide={this.handleInsightsOffCanvasClose}
          placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Insights</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            
          </Offcanvas.Body>
        </Offcanvas>

      </>
    );
  }
}
