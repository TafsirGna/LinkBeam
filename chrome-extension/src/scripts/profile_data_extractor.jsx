/*import { 
  messageParams,
  appParams,
} from "../react_components/Local_library";*/

import { 
  DataExtractorBase, 
  publicDataExtractor, 
  authDataExtractor ,
} from "./data_extractor_lib";

// Content script designed to make sure the active tab is a linkedin page
     

class ProfileDataExtractor extends DataExtractorBase {

  constructor(){
    super();
  }

  extractData(){

    let pageData = null;
    
    var publicHeaderData = null;

    try {
      publicHeaderData = publicDataExtractor.header();
    }
    catch (e) {
      console.log("An error occured when parsing as public profile :", e);
    }

    if (publicHeaderData && publicHeaderData.fullName){
      
      pageData = {

        url: (window.location.href.split("?"))[0],
        fullName: publicHeaderData.fullName,
        title: publicHeaderData.title,
        info: publicDataExtractor.about(),
        avatar: publicHeaderData.avatar,
        coverImage: publicHeaderData.coverImage,
        nFollowers: publicHeaderData.nFollowers,
        nConnections: publicHeaderData.nConnections, 
        location: publicHeaderData.location,
        featuredSchool: publicHeaderData.featuredSchool,
        company: publicHeaderData.company,
        education: publicDataExtractor.education(),
        experience: publicDataExtractor.experience(),
        certifications: publicDataExtractor.certification(),
        activity: publicDataExtractor.activity(),
        languages: publicDataExtractor.language(),
        projects: publicDataExtractor.project(),
        profileSuggestions: publicDataExtractor.suggestions(),
        //
        codeInjected: (document.getElementById("linkBeamExtensionMainRoot") ? true : false),

      };
      
    }
    else{
      var authHeaderData = null;

      try {
        authHeaderData = authDataExtractor.header();
      }
      catch (e) {
        console.log("An error occured when parsing as private profile : ", e);
      }

      if (authHeaderData && authHeaderData.fullName){

        pageData = {

          url: (window.location.href.split("?"))[0],
          fullName: authHeaderData.fullName,
          title: authHeaderData.title,
          info: authDataExtractor.about(),
          avatar: authHeaderData.avatar,
          coverImage: authHeaderData.coverImage,
          nFollowers: authHeaderData.nFollowers,
          nConnections: authHeaderData.nConnections, 
          location: authHeaderData.location,
          featuredSchool: authHeaderData.featuredSchool,
          company: authHeaderData.company,
          education: authDataExtractor.education(),
          experience: authDataExtractor.experience(),
          certifications: authDataExtractor.certification(),
          activity: authDataExtractor.activity(),
          languages: authDataExtractor.language(),
          projects: authDataExtractor.project(),
          profileSuggestions: authDataExtractor.suggestions(),
          //
          codeInjected: (document.getElementById("linkBeamExtensionMainRoot") ? true : false),

        };

      } 
    }

    return pageData;
  }

}

// Building the object 
var profileDataExtractor = new ProfileDataExtractor();

