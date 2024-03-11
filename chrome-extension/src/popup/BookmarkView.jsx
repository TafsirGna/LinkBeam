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
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import BookmarkListView from "./widgets/BookmarkListView";
import { 
  saveCurrentPageTitle, 
  appParams
} from "./Local_library";
import { db } from "../db";
import eventBus from "./EventBus";
import { useSelector, useDispatch } from 'react-redux';
import {
  setValue,
  selectBookmarks,
} from '../slices/bookmarksSlice';


export default class BookmarkView extends React.Component{

  constructor(props){
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.BOOKMARKS);

    if (!this.props.globalData.bookmarkList){

      (async () => {

        const bookmarks = await db.bookmarks.toArray();

        await Promise.all (bookmarks.map (async bookmark => {
          [bookmark.profile] = await Promise.all([
            db.profiles.where('url').equals(bookmark.url).first()
          ]);
        }));

        eventBus.dispatch(eventBus.SET_APP_GLOBAL_DATA, {property: "bookmarkList", value: bookmarks});

      }).bind(this)();

    }
  }


  render(){

    return(
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle={appParams.COMPONENT_CONTEXT_NAMES.HOME}/>
            
            <PageTitleView pageTitle={appParams.COMPONENT_CONTEXT_NAMES.BOOKMARKS}/>

            <div class="mt-3">

              {/* Bookmark list view */}
              <BookmarkListView objects={this.props.globalData.bookmarkList} />
              
            </div>

        </div>
      </>
    );
  }

}
