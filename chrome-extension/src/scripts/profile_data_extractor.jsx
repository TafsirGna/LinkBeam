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

/*import { 
  messageMeta,
  appParams,
} from "../react_components/Local_library";*/

import { 
  DataExtractorBase, 
  publicDataExtractor, 
  authDataExtractor ,
} from "./data_extractor_lib";

// Content script designed to make sure the active tab is a linkedin page

export default class ProfileDataExtractor extends DataExtractorBase {

  constructor(){
    super();
  }

  static setUpExtensionWidgets(tabId){
    
  }

  static extractData(){

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

        fullName: publicHeaderData.fullName,
        title: publicHeaderData.title,
        info: publicDataExtractor.about(),
        avatar: publicHeaderData.avatar,
        coverImage: publicHeaderData.coverImage,
        nFollowers: publicHeaderData.nFollowers,
        nConnections: publicHeaderData.nConnections, 
        location: publicHeaderData.location,
        featuredEducationEntity: publicHeaderData.featuredEducationEntity,
        featuredExperienceEntity: publicHeaderData.featuredExperienceEntity,
        education: publicDataExtractor.education(),
        experience: publicDataExtractor.experience(),
        certifications: publicDataExtractor.certification(),
        activity: publicDataExtractor.activity(),
        languages: publicDataExtractor.language(),
        projects: publicDataExtractor.project(),
        profileSuggestions: publicDataExtractor.suggestions(),

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

          fullName: authHeaderData.fullName,
          title: authHeaderData.title,
          info: authDataExtractor.about(),
          avatar: authHeaderData.avatar,
          coverImage: authHeaderData.coverImage,
          nFollowers: authHeaderData.nFollowers,
          nConnections: authHeaderData.nConnections, 
          location: authHeaderData.location,
          featuredEducationEntity: authHeaderData.featuredEducationEntity,
          featuredExperienceEntity: authHeaderData.featuredExperienceEntity,
          education: authDataExtractor.education(),
          experience: authDataExtractor.experience(),
          certifications: authDataExtractor.certification(),
          activity: authDataExtractor.activity(),
          languages: authDataExtractor.language(),
          projects: authDataExtractor.project(),
          profileSuggestions: authDataExtractor.suggestions(),

        };

      } 
    }

    return pageData;
  }

}

// Building the object 
// var profileDataExtractor = new ProfileDataExtractor();

