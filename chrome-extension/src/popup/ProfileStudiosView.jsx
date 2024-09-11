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

/*import './ProfileStudiosView.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import PageTitleView from "./widgets/PageTitleView";
import ProfileStudioView from "./widgets/ProfileStudioView";
import ProfileStudiosListView from "./widgets/Lists/ProfileStudiosListView";
import { 
  saveCurrentPageTitle, 
  appParams,
  setGlobalDataProfileStudios,
} from "./Local_library";
import { db } from "../db";
import eventBus from "./EventBus";
import { liveQuery } from "dexie"; 

export default class ProfileStudiosView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      action: null,
      profileStudio: null,
    };
  }

  componentDidMount() {

    this.setState({action: ((new URLSearchParams(window.location.search).get("action")) || "list")}, () => {
      if (this.state.action == "list"){
        saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.PROFILE_STUDIOS.replaceAll(" ", "_"));
        setGlobalDataProfileStudios(db, eventBus, liveQuery);
      }
      else if (this.state.action == "show"){
        const itemId = new URLSearchParams(window.location.search).get("itemId");
        if (itemId){
          (async () => {
            this.setState({profileStudio: await db.profileStudios.where({uniqueId: itemId}).first()});
          })();
        }
      }
    });

  }

  render(){
    return (
      <>
        {this.state.action == "list"
            && <div class="p-3">
                  <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>
        
                  <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.PROFILE_STUDIOS}/>
        
                  <div class="clearfix mt-3">
                    <a 
                      class="rounded shadow-sm badge border text-primary float-end"
                      target="_blank"
                      href={`/index.html?view=${appParams.COMPONENT_CONTEXT_NAMES.PROFILE_STUDIOS.replaceAll(" ", "_")}&action=new`}>
                      New
                    </a>
                  </div>
                  <div class="mt-2">            
                    {/* Profile studios list view */}
                    <ProfileStudiosListView 
                      objects={this.props.globalData.profileStudios}  />
        
                  </div>
                </div>}

        { this.state.action == "new"
            && <ProfileStudioView/>}

        { this.state.action == "show"
            && this.state.profileStudio
            && <ProfileStudioView
                  object={this.state.profileStudio}/>}

      </>
    );
  }
}
