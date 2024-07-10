/*import './StatIndicatorsView.css'*/
import React from 'react';
import { 
  secondsToHms,
  dbDataSanitizer,
  isProfilePropertyLabelInList,
} from "../Local_library";
import badge_icon from '../../assets/badge_icon.png';
import { stringSimilarity } from "string-similarity-js";
import { languagesNaming } from "../languagesNamingFile";

export default class StatIndicatorsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      indicatorData: {
        profileData: {
          label: "# of profiles",
          value: 0,
        },
        visitData: {
          label: "# of visits",
          value: 0,
        },
        timeData: {
          label: "Total time",
          value: 0,
        },
        educationData: {
          label: "# of education entities",
          value: 0,
        },
        experienceData: {
          label: "# of employers",
          value: 0,
        },
        certificationData: {
          label: "# of certifications",
          value: 0,
        },
        languageData: {
          label: "# of languages",
          value: 0,
        },
        jobTitleData: {
          label: "# of job titles",
          value: 0,
        },

      },
    };

    this.setData = this.setData.bind(this);

  }

  componentDidMount() {

    this.setData();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){

      this.setData();

    }

  }

  setData(){

    if (!this.props.objects){
      return;
    }

    var profiles = [],
        time = 0,
        activityList = [];
    for (const visit of this.props.objects){

      // Incrementing time spent
      time += visit.timeCount;

      // listing all visited profiles
      var index = profiles.indexOf(visit.url);
      if (index == -1){
        profiles.push(visit.url);
      }

      // listing all visited profiles' activities
      if (visit.profileData.activity){
        for (var activity of visit.profileData.activity){
          index = activityList.map(e => e.link).indexOf(activity.link);
          if (index == -1 || (index != -1 && activityList[index].action != activity.action)){
            activityList.push(activity);
          }
        }
      }

    }
    
    this.setState(prevState => {
      let indicatorData = Object.assign({}, prevState.indicatorData);
      // Setting profile data
      indicatorData.profileData.value = profiles.length;
      // Setting visit data
      indicatorData.visitData.value = this.props.objects.length;
      // Setting time data
      indicatorData.timeData.value = secondsToHms(time);
      return { indicatorData };
    });

    // Part II
    if (!this.props.profiles){
      return;
    }

    // settings education entities data
    var edEntities = [],
        expEntities = [],
        certifications = [],
        languages = [],
        jobTitles = [];
    for (const profile of this.props.profiles){

      if (profile.education){
        for (const education of profile.education){
          if (isProfilePropertyLabelInList(dbDataSanitizer.preSanitize(education.entity.name), edEntities, "education", stringSimilarity) == -1){
            edEntities.push(dbDataSanitizer.preSanitize(education.entity.name));
          }
        }
      }

      if (profile.experience){
        for (const experience of profile.experience){
          if (isProfilePropertyLabelInList(dbDataSanitizer.preSanitize(experience.entity.name), expEntities, "experience", stringSimilarity) == -1){
            expEntities.push(dbDataSanitizer.preSanitize(experience.entity.name));
          }
          if (isProfilePropertyLabelInList(dbDataSanitizer.preSanitize(experience.title), jobTitles, "jobTitles", stringSimilarity) == -1){
            jobTitles.push(dbDataSanitizer.preSanitize(experience.title));
          }
        }
      }

      if (profile.languages){
        for (const language of profile.languages){

          var elementName = dbDataSanitizer.preSanitize(language.name);
          const index = languagesNaming.findIndex(item => Object.values(item).findIndex(i => elementName.toLowerCase().indexOf(i) != -1) != -1);
          if (index != -1){
            elementName = languagesNaming[index].en;
          }

          if (isProfilePropertyLabelInList(elementName, languages, "languages", stringSimilarity) == -1){
            languages.push(elementName);
          }
          
        }
      }

      if (profile.certifications){
        for (const certification of profile.certifications){
          if (isProfilePropertyLabelInList(dbDataSanitizer.preSanitize(certification.title), certifications, "certifications", stringSimilarity) == -1){
            certifications.push(dbDataSanitizer.preSanitize(certification.title));
          }
        }
      }

    }

    this.setState(prevState => {
      let indicatorData = Object.assign({}, prevState.indicatorData);
      indicatorData.experienceData.value = expEntities.length;
      indicatorData.educationData.value = edEntities.length;
      indicatorData.certificationData.value = certifications.length;
      indicatorData.languageData.value = languages.length;
      indicatorData.jobTitleData.value = jobTitles.length;
      return { indicatorData };
    });


  }

  componentWillUnmount(){

  }

  render(){
    return (
      <>
        <div class="m-2" data-bs-theme="light">

          { Object.keys(this.state.indicatorData).map((key) => 
              /*<IndicatorWidget object={this.state.indicatorData[key]} />*/
              /*<OverlayTrigger
                placement="top"
                overlay={<ReactTooltip id="tooltip1">{`${tag.profiles ? tag.profiles.length : 0} profile${!tag.profiles || (tag.profiles && [0, 1].indexOf(tag.profiles.length) != -1) ? "" : "s"} associated`}</ReactTooltip>}
              >*/
                <span class="badge align-items-center p-1 pe-2 text-dark-emphasis bg-light-subtle border rounded-pill m-1 shadow-sm">
                  <img class="rounded-circle me-1" width="16" height="16" src={badge_icon} alt=""/>
                  {this.state.indicatorData[key].label}
                  <span class="ms-1 badge rounded-pill bg-secondary">
                    {this.state.indicatorData[key].value}
                  </span>
                </span>
              /*</OverlayTrigger>*/
            )}

        </div>
      </>
    );
  }
}
