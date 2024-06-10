/*import './LoadingprofileView.css'*/
import React from 'react';
import { db } from "../../db";
import { 
  appParams,
  getProfileDataFrom,
} from "../Local_library";
import ProgressBar from 'react-bootstrap/ProgressBar';
import Spinner from 'react-bootstrap/Spinner';
import { CheckIcon, DeletionIcon } from "./SVGs";
import { liveQuery } from "dexie";

const profileProperties = [
  "info", 
  "education", 
  "experience", 
  "profileSuggestions", 
  "projects", 
  "certifications", 
  "languages"
  ];

export async function buildProfileObject(profileUrl){

  var profile = await getProfileDataFrom(db, profileUrl);

  profile.bookmark = await db.bookmarks.where({url: profileUrl}).first();
  profile.reminder = await db.reminders.where({objectId: profileUrl}).first();

  return profile;

}

export default class LoadingprofileView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      profile: null,
      profileProperties: [],
      profileObservable: null,
    };

    this.initCheck = this.initCheck.bind(this);
  }

  componentDidMount() {

    // Getting the window url params
    const profileUrl = (new URLSearchParams(window.location.search)).get("data");

    if (!profileUrl){
      this.props.loadingDone("FAILURE", null);
      return;
    }

    // Retrieving the profile for the url given throught the url paremeters 
    (async () => {

      try {

        this.setState(
          {
            profile: await buildProfileObject(profileUrl),
            profileObservable: liveQuery(() => db.visits.where({url: profileUrl}).last()),
          }, 
          () => {
            this.initCheck(0);
          }
        );

      } catch (error) {

        console.error('Error while retrieving profile bookmark and reminder object : ', error);
        this.props.loadingDone("FAILURE", null);

      }

    }).bind(this)();

  }

  componentDidUpdate(prevProps, prevState){


  }

  componentWillUnmount() {

  }

  initCheck(index){

    if (index == profileProperties.length){
      this.props.loadingDone("SUCCESS", {profileObject: this.state.profile, profileObservable: this.state.profileObservable});
      return;
    }

    setTimeout((() => {
      
      var profileProps = this.state.profileProperties;
      profileProps.push({
        prop: profileProperties[index],
        status: this.state.profile[profileProperties[index]] ? "OK" : "NOT OK", 
      });
      this.setState({profileProperties: profileProps}, () => {
        this.initCheck(index + 1);
      });

    }).bind(this), 500);

  }

  render(){
    return (
      <>
        <div class="p-5 shadow border rounded mt-5">

          <div class="mb-2">
            <Spinner 
              animation="border" 
              size="sm"
              variant="secondary" />
            { this.state.profileProperties.length != 0 
              && <span class="fst-italic ms-2 small">
                {this.state.profileProperties[this.state.profileProperties.length - 1].prop} 
              </span>}
          </div>
          <ProgressBar animated now={100} />

          <div class="fst-italic small mt-2">
            {this.state.profileProperties.map(item => (<p class="my-0">
                {item.prop}
                { item.status == "OK" && <span class="text-success m-2">
                      <CheckIcon size="12"/>
                    </span>}
                { item.status == "NOT OK" && <span class="text-danger ms-2">
                      <DeletionIcon size="12"/>
                    </span>}
              </p>))}
          </div>

        </div>
      </>
    );
  }
}
