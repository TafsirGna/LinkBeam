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
import ActivityListView from "./Lists/ActivityListView";

export default class SearchPostFormView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      posts: [],
    };

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

  }

  componentWillUnmount(){

  }

  onSearchTextChange = (data) => this.setState({posts: data?.results});

  render(){
    return (
      <>
      
        <SearchInputView 
          objectStoreName="posts"
          searchTextChanged={(data) => this.onSearchTextChange(data)}/>

        <div class="mt-2">
          <ActivityListView 
            objects={this.state.posts}
            variant="list"/> 
        </div>

      </>
    );
  }
}
