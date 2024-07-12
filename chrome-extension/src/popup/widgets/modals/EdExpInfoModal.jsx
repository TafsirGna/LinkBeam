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

/*import './EdExpInfoModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { 
  dbDataSanitizer,
} from "../../Local_library";
import company_icon from '../../../assets/company_icon.png';

export default class EdExpInfoModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }

  render(){
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.section == "education" ? "Education" : "Experience"} details</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { this.props.label && <div>
                                <span class="shadow badge bg-secondary-subtle border border-info-subtle text-info-emphasis rounded-pill">{this.props.label}</span>
                                <ul class="timeline mt-4 mx-2 small">
                                  { this.props.profile[this.props.section].map((object) => (
                                      ((this.props.labelName == "title" && dbDataSanitizer.preSanitize(object.title).toLowerCase() == this.props.label.toLowerCase())
                                        || (this.props.labelName == "entityName" && object != "incomplete" && dbDataSanitizer.preSanitize(object.entity.name).toLowerCase() == this.props.label.toLowerCase()))
                                        &&  <li class="timeline-item mb-5 small">
                                              <h6 class="fw-bold">
                                                <span class="shadow-sm badge align-items-center p-1 pe-3 text-secondary-emphasis bg-secondary-subtle border border-secondary-subtle rounded-pill">
                                                  <img class="rounded-circle me-1" width="16" height="16" src={/*profileActivityObject.profile.avatar ? profileActivityObject.profile.avatar :*/ company_icon} alt=""/>
                                                  { this.props.labelName == "title" ? dbDataSanitizer.preSanitize(object.entity.name) : dbDataSanitizer.preSanitize(object.title)}
                                                </span>
                                              </h6>
                                              { object.period && <p class="text-muted mb-2 fw-light">{object.period.startDateRange.toFormat("MMM yyyy")} - {object.period.endDateRange.toFormat("MMM yyyy")}</p>}
                                              { object.description && <p class="text-muted border rounded p-2 shadow-sm" dangerouslySetInnerHTML={{__html: object.description}}>
                                                                                              { /*object.description*/ }
                                                                                            </p>}
                                            </li>
                                    )) }
                                </ul>
                              </div>    }      

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
