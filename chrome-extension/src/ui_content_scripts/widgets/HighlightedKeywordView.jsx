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
import { Popover } from "flowbite-react";

export default class HighlightedKeywordView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  popoverBody(allDetected, highlightedKeywordBadgeColors){
    const colorLabels = ["blue", "yellow", "green", "pink", "indigo", "purple"];

    var sum = Object.values(allDetected).reduce((acc, a) => acc + a, 0);

    const data = Object.keys(allDetected).map((keyword, index) => ({
      label: keyword,
      share: ((allDetected[keyword] * 100) / sum).toFixed(1),
      colorLabelIndex: colorLabels.findIndex(label => highlightedKeywordBadgeColors[index].indexOf(label) != -1),
    }));

    return <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      { data.map(object => (<div class={`bg-${colorLabels[object.colorLabelIndex]}-600 h-2.5 rounded-full`} style={{width: `${object.share}%`}} title={object.label}></div>)) }
    </div>

  }

  render(){
    return (
        <span>
          <Popover
              aria-labelledby="default-popover"
              content={
                <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
                  <div className="px-3 py-2">
                    {/*<p>And here's some amazing content. It's very engaging. Right?</p>*/}
                    {this.popoverBody(this.props.allDetected, this.props.highlightedKeywordBadgeColors)}
                  </div>
                </div>
              }
              arrow={false}
              // trigger="hover"
            >
            <span 
              class= {`${this.props.highlightedKeywordBadgeColors[(Object.keys(this.props.allDetected).indexOf(this.props.keyword.toLowerCase()) % this.props.highlightedKeywordBadgeColors.length)]} text-xl font-medium me-0.5 px-1.5 py-0.5 rounded handy-cursor`}
              title={`#${this.props.allDetected[this.props.keyword.toLowerCase()]}`}>
              {this.props.keyword}
            </span>
          </Popover>
        </span>
    );
  }
}
