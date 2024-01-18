/*import './ProfileGeoMapModal.css'*/
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
import ProgressBar from 'react-bootstrap/ProgressBar';

export default class LanguageListModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      progressBarVariants: [
        "primary",
        "warning",
        "info",
        "danger",
      ],
    };
  }

  componentDidMount() {
  }

  listenToMessages(){

    
  }

  render(){
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Languages</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            { this.props.profile.languages && this.props.profile.languages.map((language, index) => <div class="mt-3">
                          <p class="mb-1">{dbDataSanitizer.languageName(language.name)}</p>
                          <ProgressBar 
                            title={dbDataSanitizer.languageName(language.proficiency)}
                            animated 
                            now={
                              (language.proficiency.toLowerCase().indexOf("native") != -1 
                                ? 100 
                                : language.proficiency.toLowerCase().indexOf("full professional") != -1 
                                  ? 80 
                                    : language.proficiency.toLowerCase().indexOf("professional working") != -1 
                                      ? 60 
                                        : language.proficiency.toLowerCase().indexOf("limited working") != -1
                                          ? 40 
                                            : language.proficiency.toLowerCase().indexOf("elementary") != -1 
                                              ? 20 : 0 )
                            } 
                            variant={this.state.progressBarVariants[index % this.state.progressBarVariants.length]} />
                        </div>)}

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
