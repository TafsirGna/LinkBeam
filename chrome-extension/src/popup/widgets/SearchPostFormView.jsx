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

/*import './SearchPostFormView.css'*/
import React from 'react';
import { 
  dbDataSanitizer, 
  groupVisitsByProfile,
} from "../Local_library";
import SearchInputView from "./SearchInputView";
import ActivityListView from "./ActivityListView";
import eventBus from "../EventBus";

export default class SearchPostFormView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      posts: [],
    };

  }

  componentDidMount() {

    eventBus.on(eventBus.SET_MATCHING_POSTS_DATA, (data) => {
        
        this.setState({posts: data.results});

      }
    );

  }

  componentDidUpdate(prevProps, prevState){

  }

  componentWillUnmount(){

    eventBus.remove(eventBus.SET_MATCHING_POSTS_DATA);

  }

  render(){
    return (
      <>
      
        <SearchInputView 
          objectStoreName="posts"/>

        <div class="mt-2">
          <ActivityListView 
            objects={this.state.posts}
            variant="list"/> 
        </div>

      </>
    );
  }
}
