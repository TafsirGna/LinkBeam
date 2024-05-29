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

/*import './About.css'*/
import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  saveCurrentPageTitle, 
  appParams,
} from "./Local_library";
/*import 'bootstrap/dist/css/bootstrap.min.css';*/

export default class LicenseCreditsView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      currentTabIndex: 0,
    };
  }

  componentDidMount() {

    saveCurrentPageTitle("LicenseCredits");

  }

  switchCurrentTab(index){

    this.setState({currentTabIndex: index});

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.ABOUT}/>

          <div class="text-center my-3">
            <div class="btn-group btn-group-sm mb-2 shadow-sm" role="group" aria-label="Small button group">
              <button type="button" class={"btn btn-primary badge" + (this.state.currentTabIndex == 0 ? " active " : "")} onClick={() => {this.switchCurrentTab(0)}}>
                Credits
              </button>
              <button type="button" class={"btn btn-secondary badge" + (this.state.currentTabIndex == 1 ? " active " : "") } title="See Credits" onClick={() => {this.switchCurrentTab(1)}} >
                License
              </button>
            </div>
          </div>

          <div class="fw-light small border border-secondary-subtle rounded p-3 shadow">

          { this.state.currentTabIndex == 0 && <div>
                                                {["Icons8",
                                                  "Feepik (flaticon)",
                                                  "Surang (flaticon)",
                                                  "pancaza (flaticon)",
                                                  "juicy_fish (flaticon)",
                                                  "Smashicons (flaticon)"
                                                ].map((item, index) => (<div class="row">
                                                                          <p class="col text-end fw-bold mb-1">{index == 0 ? "Resources" : ""}</p>
                                                                          <p class="col mb-1">{item}</p>
                                                                        </div>))}
                                              </div>}

          { this.state.currentTabIndex == 1 && <div class="">

                                                <p>Copyright (C) 2023 {appParams.appAuthor}</p>

                                                <p>This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.</p>

                                                <p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.</p>

                                                <p>You should have received a copy of the GNU General Public License along with MATE Terminal; if not, write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301 USA</p>

                                              </div>}

          </div>

        </div>
      </>
    );
  }
}
