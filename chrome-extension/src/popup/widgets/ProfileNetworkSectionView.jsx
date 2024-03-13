// import '../assets/css/ProfileActivitySectionView.css';
import React from 'react';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ProfilesGraphChart from "./charts/ProfilesGraphChart";
import default_user_icon from '../../assets/user_icons/default.png';
import { 
  appParams, 
  dbDataSanitizer 
} from "../Local_library";
import { AlertCircleIcon, LayersIcon } from "./SVGs";
import Form from 'react-bootstrap/Form';
import eventBus from "../EventBus";
import { db } from "../../db";


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

  async handleFormSelectInputChange(event) {

    async function initProfiles(profiles, property){

      if (property == "suggestions"){
        property = "profileSuggestions";
      }

      if (profiles && profiles.length && profiles[0][property]){
        return profiles;
      }

      // No need to load all the profiles with all its properties, only the needed properties
      await db.profiles
              .each(profile => {
                var index = profiles.map(e => e.url).indexOf(profile.url);
                if (index == -1){
                  var object = {url: profile.url};
                  object[property] = profile[property];
                  profiles.push(object);
                }
                else{
                  if (!profiles[index][property]){
                    profiles[index][property] = profile[property];
                  }
                }
              });

      return profiles;

    }

    var profiles = !this.props.localDataObject.profiles ? [] : this.props.localDataObject.profiles;

    profiles = await initProfiles(profiles, event.target.value);

    eventBus.dispatch(eventBus.SET_PROFILE_LOCAL_DATA, {property: "allProfiles", value: profiles});

    this.setState({formSelectInputVal: event.target.value}); 

  }

  render(){
    return (
      <>

        { !this.props.profile.profileSuggestions && <div class="text-center m-5 mt-4">
                  <AlertCircleIcon size="100" className="mb-3 text-muted" />
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
                      <option value="certifications">Certifications</option>
                    </Form.Select>

                    <span class="float-end handy-cursor me-4" onClick={this.handleOffCanvasShow} title="Click to see all">
                      <LayersIcon size="18" className=""/>
                    </span>

                  </div>
                  <div class="shadow rounded border mx-3">
                    <ProfilesGraphChart 
                      objects={[this.props.profile]} 
                      displayCriteria={this.state.formSelectInputVal} 
                      profiles={this.props.localDataObject.profiles}
                      offCanvasShow={this.state.offCanvasShow}
                      handleOffCanvasClose={this.handleOffCanvasClose}/>

                  </div>
                </div>}

      </>
    );
  }
}
