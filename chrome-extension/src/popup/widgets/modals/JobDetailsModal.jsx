/*import './JobDetailsModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { 
  sendDatabaseActionMessage, 
  startMessageListener, 
  messageParams, 
  ack, 
  dbData,
  dbDataSanitizer,
} from "../../Local_library";
import company_icon from '../../../assets/company_icon.png';

export default class JobDetailsModal extends React.Component{

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
            <Modal.Title>Job Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { this.props.label && <div>
                                <span class="shadow badge bg-secondary-subtle border border-info-subtle text-info-emphasis rounded-pill">{this.props.label}</span>
                                <ul class="timeline mt-4 mx-2 small">
                                  { this.props.profile.experience.map((experience) => (
                                      ((this.props.labelClass = "title" && dbDataSanitizer.preSanitize(experience.title).toLowerCase() == this.props.label.toLowerCase())
                                        || (this.props.labelClass = "company" && dbDataSanitizer.preSanitize(experience.company).toLowerCase() == this.props.label.toLowerCase()))
                                        &&  <li class="timeline-item mb-5 small">
                                              <h6 class="fw-bold">
                                                <span class="shadow-sm badge align-items-center p-1 pe-3 text-secondary-emphasis bg-secondary-subtle border border-secondary-subtle rounded-pill">
                                                  <img class="rounded-circle me-1" width="16" height="16" src={/*profileActivityObject.profile.avatar ? profileActivityObject.profile.avatar :*/ company_icon} alt=""/>
                                                  { this.props.labelClass == "title" ? dbDataSanitizer.preSanitize(experience.company) : dbDataSanitizer.preSanitize(experience.title)}
                                                </span>
                                              </h6>
                                              { experience.period && <p class="text-muted mb-2 fw-light">{experience.period.startDateRange.format("MMMM YYYY")} - {experience.period.endDateRange.format("MMMM YYYY")}</p>}
                                              <p class="text-muted border rounded p-2 shadow-sm">
                                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit
                                                necessitatibus adipisci, ad alias, voluptate pariatur officia
                                                repellendus repellat inventore fugit perferendis totam dolor
                                                voluptas et corrupti distinctio maxime corporis optio?
                                              </p>
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
