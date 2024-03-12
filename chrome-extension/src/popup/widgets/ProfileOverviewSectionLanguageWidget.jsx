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

/*import './ProfileOverviewSectionLanguageWidget.css'*/
import React from 'react';

export default class ProfileOverviewSectionLanguageWidget extends React.Component{

  constructor(props){
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

  }

  handleLanguageListModalClose = () => this.setState({languageListModalShow: false});
  handleLanguageListModalShow = () => {

    if (!this.props.profile.languages){ 
      return;
    }

    this.setState({languageListModalShow: true})
  };

  render(){
    return (
      <>
        <div class="handy-cursor card mb-3 shadow small text-muted col mx-2 border border-1" onClick={this.handleLanguageListModalShow}>
          <div class="card-body">
            <h6 class="card-title text-info-emphasis">{this.props.profile.languages ? this.props.profile.languages.length : 0}</h6>
            <p class="card-text">Languages</p>
          </div>
        </div>

        <LanguageListModal 
          profile={this.props.profile} 
          show={this.state.languageListModalShow} 
          onHide={this.handleLanguageListModalClose} 
          localDataObject={this.props.localDataObject}/>
      </>
    );
  }
}
