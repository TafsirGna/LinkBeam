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

/*import './HighlightedKeywordView.css'*/
import React from 'react';

export default class HighlightedKeywordView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  render(){
    return (
        <span 
            // bg-green-100 dark:bg-green-900 dark:text-green-300 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded 
            class= {`${this.props.color} text-xl font-medium me-0.5 px-1.5 py-0.5 rounded`}
            title={`#${this.props.order}`}>
            {this.props.keyword}
        </span>
    );
  }
}
