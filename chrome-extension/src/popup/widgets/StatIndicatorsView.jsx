/*import './StatIndicatorsView.css'*/
import React from 'react';
import { 
  secondsToHms,
} from "../Local_library";
import badge_icon from '../../assets/badge_icon.png';

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
          label: "# of expericence entities",
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
    for (var visit of this.props.objects){

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

    // Setting profile data
    this.setState(prevState => {
      let indicatorData = Object.assign({}, prevState.indicatorData);
      indicatorData.profileData.value = profiles.length;
      return { indicatorData };
    });

    // Setting visit data
    this.setState(prevState => {
      let indicatorData = Object.assign({}, prevState.indicatorData);
      indicatorData.visitData.value = this.props.objects.length;
      return { indicatorData };
    });

    // Setting time data
    this.setState(prevState => {
      let indicatorData = Object.assign({}, prevState.indicatorData);
      indicatorData.timeData.value = secondsToHms(time);
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
