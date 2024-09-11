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
import { 
  saveCurrentPageTitle, 
  appParams,
} from "./Local_library";

export default class ProfileStudiosView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.PROFILE_STUDIOS.replaceAll(" ", "_"));

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>

          <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.PROFILE_STUDIOS}/>

          <div class="mt-3">            
            {/* Profile studios list view */}

            <ProfileStudiosListView 
              objects={this.props.globalData.profileStudios}  />

          </div>
        </div>
      </>
    );
  }
}
