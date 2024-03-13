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

/*import './ProfileOverviewSectionProjectWidget.css'*/
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default class ProfileOverviewSectionProjectWidget extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      projectsModalShow: false,
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

  }

  handleProjectsModalClose = () => this.setState({projectsModalShow: false});
  handleProjectsModalShow = () => {

    if (!this.props.profile.projects){ 
      return;
    }

    this.setState({projectsModalShow: true})
  };

  render(){
    return (
      <>
        <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={this.handleProjectsModalShow}>
          <div class="card-body">
            <h6 class="card-title text-danger-emphasis">{this.props.profile.projects ? this.props.profile.projects.length : 0}</h6>
            <p class="card-text">Projects</p>
          </div>
        </div>


        {/*Projects Modal*/}
        <Modal 
          show={this.state.projectsModalShow} 
          onHide={this.handleProjectsModalClose}
          size="lg"
          >
          <Modal.Header closeButton>
            <Modal.Title>Projects</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            { this.props.profile.projects && <div class="list-group small mt-1 shadow-sm border-0">
              { this.props.profile.projects.map((project, index) => (<a href="#" class="border-0 list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true" >
                                            <div class="d-flex gap-2 w-100 justify-content-between">
                                              <div>
                                                <p class="mb-1">
                                                  <span class="shadow badge align-items-center p-1 px-3 text-primary-emphasis bg-secondary-subtle border border-secondary rounded-pill mb-2">
                                                    {/*<img class="rounded-circle me-1" width="24" height="24" src={profileActivityObject.profile.avatar ? profileActivityObject.profile.avatar : default_user_icon} alt=""/>*/}
                                                    {project.name ? dbDataSanitizer.preSanitize(project.name) : "Missing data"}
                                                  </span>
                                                </p>
                                                <p class="text-muted mb-2 small ms-2 fst-italic">{project.period ? dbDataSanitizer.preSanitize(project.period) : "Missing period data"}</p>
                                              </div>
                                              {/*<small class="opacity-50 text-nowrap">{moment(new Date()).fromNow()}</small>*/}
                                            </div>
                                          </a>))}
              </div>}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleProjectsModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
