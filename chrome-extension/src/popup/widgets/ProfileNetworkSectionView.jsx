// import '../assets/css/ProfileActivitySectionView.css';
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import RelationshipsChart from "./charts/RelationshipsChart";
import default_user_icon from '../../assets/user_icons/default.png';
import { 
  sendDatabaseActionMessage, 
  messageParams, 
  dbData, 
  appParams, 
  dbDataSanitizer 
} from "../Local_library";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { AlertCircleIcon, LayersIcon } from "./SVGs";
import Form from 'react-bootstrap/Form';


export default class ProfileNetworkSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      offCanvasShow: false,
      formSelectInputVal: "suggestions",
    };

    this.handleFormSelectInputChange = this.handleFormSelectInputChange.bind(this);

  }

  componentDidMount() {

  }

  handleOffCanvasClose = () => {
    this.setState({offCanvasShow: false})
  };

  handleOffCanvasShow = () => {
      this.setState({offCanvasShow: true});
  };

  handleFormSelectInputChange(event) {

    if (!this.props.globalData.profiles){
      sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.PROFILES, { context: appParams.COMPONENT_CONTEXT_NAMES.PROFILE });
    }

    this.setState({formSelectInputVal: event.target.value}); 

  }

  render(){
    return (
      <>

        { !this.props.profile.profileSuggestions && <div class="text-center m-5 mt-4">
                  <AlertCircleIcon size="100" className="mb-3" />
                  <p><span class="badge text-bg-primary fst-italic shadow">No data retrieved for this section </span></p>
                </div>}

        {this.props.profile.profileSuggestions && <div class="">
                  <div class="clearfix my-3">

                    <Form.Select 
                      size="sm"
                      className="float-start ms-3 shadow-sm w-25"
                      onChange={this.handleFormSelectInputChange}>
                      <option value="suggestions">Suggestions</option>
                      <option value="experience">Experience</option>
                      <option value="education">Education</option>
                      <option value="languages">Languages</option>
                      <option value="Certifications">Certifications</option>
                    </Form.Select>

                    <span class="float-end handy-cursor me-4" onClick={this.handleOffCanvasShow} title="Click to see all">
                      <LayersIcon size="18" className=""/>
                    </span>

                  </div>
                  <div class="shadow rounded border mx-3">
                    <RelationshipsChart 
                      objects={[this.props.profile]} 
                      displayCriteria={this.state.formSelectInputVal} 
                      profiles={this.props.globalData.profiles}/>
                  </div>
                </div>}

        <Offcanvas show={this.state.offCanvasShow} onHide={this.handleSuggestionsOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Suggestions</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>

            { !this.props.profile.profileSuggestions && <div class="text-center m-5 mt-4">
                  <AlertCircleIcon size="100" className="mb-3" />
                  <p><span class="badge text-bg-primary fst-italic shadow">No data retrieved for this section </span></p>
                </div>}

            {this.props.profile.profileSuggestions && this.props.profile.profileSuggestions.map((suggestion, index) => (<div class={"list-group list-group-radio d-grid gap-2 border-0 small " + (index == 0 ? "" : "mt-3")}>
                                                      <div class="position-relative shadow rounded">
                                                        <label class="list-group-item py-3 pe-5" for="listGroupRadioGrid1">
                                                          <span class="shadow-sm badge align-items-center p-1 pe-3 text-secondary-emphasis bg-secondary-subtle border border-secondary-subtle rounded-pill">
                                                            <img class="rounded-circle me-1" width="24" height="24" src={/*profileActivityObject.profile.avatar ? profileActivityObject.profile.avatar : */default_user_icon} alt=""/>
                                                            {dbDataSanitizer.suggestionName(suggestion.name)}
                                                          </span>
                                                          {/*<strong class="fw-semibold">{dbDataSanitizer.suggestionName(suggestion.name)}</strong>*/}
                                                          <span class="d-block small opacity-75 mt-2">With support text underneath to add more detail</span>
                                                        </label>
                                                      </div>
                                                    </div>)
                    )}
            
          </Offcanvas.Body>
        </Offcanvas>

      </>
    );
  }
}
