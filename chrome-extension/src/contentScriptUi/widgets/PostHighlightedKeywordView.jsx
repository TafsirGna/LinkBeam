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

/*import './PostHighlightedKeywordView.css'*/
import React from 'react';
import { Tooltip } from "flowbite-react";

export default class PostHighlightedKeywordView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  render(){
    return (
        <span class="inline-flex">
            <Tooltip content={`#${this.props.order}`} class="">
                <span class="shadow-lg bg-yellow-100 text-yellow-800 text-base font-medium me-2 px-1.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                    {this.props.keyword}
                </span>
            </Tooltip>
        </span>
    );
  }
}
