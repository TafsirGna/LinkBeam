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

import React from 'react';
import VisibilitySensor from 'react-visibility-sensor';

export default class SeeMoreButtonView extends React.Component {
  render() {
    return (

    	<div class="text-center my-2 ">
        
          { this.props.showSeeMoreButton 
              && <VisibilitySensor
                  onChange={this.props.onSeeMoreButtonVisibilityChange}
                >
                  <button class="btn btn-light rounded-pill btn-sm fst-italic text-muted border badge shadow-sm mb-3 " onClick={this.props.seeMore} type="button">
                    See more
                  </button>
                </VisibilitySensor>}
          { this.props.showLoadingSpinner 
            && <div class="spinner-border spinner-border-sm text-secondary " role="status">
                                <span class="visually-hidden">Loading...</span>
                                </div>}
        </div>

   	);
  }
}