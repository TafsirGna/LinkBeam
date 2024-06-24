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

/*import './ProfileElementsPeriodShareView.css'*/
import React from 'react';
// import { LockIcon, GithubIcon, SendIcon, TagIcon } from "./widgets/SVGs";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  appParams,
} from "./Local_library";

export default class ProfileElementsPeriodShareView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      items: null,
    };
  }

  componentDidMount() {

    this.setItems();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.profiles != this.props.profiles){
      this.setItems();
    }

  }

  setItems(){

    if (!this.props.profiles){
      return;
    }

    var items = [];

    for (const profile of this.props.profiles){

      var profileElementList = profile[this.props.profileElement];

      for (const element of profileElementList){

        const elementName = null;
        if (this.props.profileElement == "languages"){

        }
        else{
          
        }

      }

    }

    this.setState({items: items});

  }

  render(){
    return (
      <>
        
        <div class="list-group">
          { this.state.items.map(item => (<a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                                            {/*<img src="https://github.com/twbs.png" alt="twbs" width="32" height="32" class="rounded-circle flex-shrink-0">*/}
                                            <div class="d-flex gap-2 w-100 justify-content-between">
                                              <div>
                                                <h6 class="mb-0">{item.name}</h6>
                                                <p class="mb-0 opacity-75">Some placeholder content in a paragraph.</p>
                                              </div>
                                              {/*<small class="opacity-50 text-nowrap">now</small>*/}
                                            </div>
                                          </a>))}
        </div>

      </>
    );
  }
}
