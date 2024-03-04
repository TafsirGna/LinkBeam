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


export default class BookmarkView extends React.Component{

  constructor(props){
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.BOOKMARKS);

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
