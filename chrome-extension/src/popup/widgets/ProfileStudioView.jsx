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
import { OverlayTrigger, Tooltip, Popover } from "react-bootstrap";
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

export default class ProfileStudioView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profileStudio: null,
      allVisitedProfilesModalShow: false,
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

      this.setState({profileStudio: profileStudio});

    })();

  }

  async deleteStudio(){
    if (confirm("Do you want to delete this studio ?")){
      await db.profileStudios.delete(this.state.profileStudio.id);
      window.close();
    }
  }

  handleAllVisitedProfilesModalClose = () => this.setState({allVisitedProfilesModalShow: false});
  handleAllVisitedProfilesModalShow = () => this.setState({allVisitedProfilesModalShow: true});

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
                      <Form.Floating className="mb-2 shadow-sm">
                        <Form.Control
                          id="studioName"
                          type="text"
                          value={this.state.profileStudio.name}
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
                          style={{ height: '100px' }}
                        />
                      </FloatingLabel>

                      <button 
                        type="button" 
                        class="btn btn-outline-danger mt-3 shadow-sm w-100"
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
                        class="btn btn-light mx-1 border text-muted border-2 border-primary-subtle bg-white btn-sm"
                        onClick={this.handleAllVisitedProfilesModalShow}>
                        Add profile
                      </button>
                    </div>
                  </div>
      
                </div>}

        </div>

        <AllVisitedProfilesModal
          show={this.state.allVisitedProfilesModalShow}
          onHide={this.handleAllVisitedProfilesModalClose}/>

      </>
    );
  }
}
