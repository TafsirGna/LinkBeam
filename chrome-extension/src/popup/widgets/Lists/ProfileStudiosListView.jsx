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

/*import './ProfileStudiosListView.css'*/
import React from 'react';
import { AlertCircleIcon } from "../SVGs";
import ProfileStudiosListItemView from "../ListItems/ProfileStudiosListItemView";

export default class ProfileStudiosListView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){


  }

  render(){
    return (
      <>

        { !this.props.objects 
            && <div class="text-center">
                <div class="mb-5 mt-4">
                  <div class="spinner-border text-primary" role="status">
                    {/*<span class="visually-hidden">Loading...</span>*/}
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow">Loading...</span></p>
                </div>
              </div>}

        { this.props.objects 
            && <div>
                  {this.props.objects.length == 0 
                    && <div class="text-center m-5 mt-4">
                          <AlertCircleIcon size="100" className="mb-3 text-muted" />
                          <p><span class="badge text-bg-primary fst-italic shadow">No studios to display</span></p>
                      </div>}

                  {this.props.objects.length != 0 
                    && <div class="list-group small mt-1 shadow-sm">
                      {this.props.objects.map(profileStudio => <ProfileStudiosListItemView object={profileStudio}/>)}
                    </div>}
              </div>}

      </>
    );
  }
}
