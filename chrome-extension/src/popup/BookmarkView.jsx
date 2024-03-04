import React from 'react';
import BackToPrev from "./widgets/BackToPrev";
import PageTitleView from "./widgets/PageTitleView";
import BookmarkListView from "./widgets/BookmarkListView";
import { 
  saveCurrentPageTitle, 
  appParams
} from "./Local_library";


export default class BookmarkView extends React.Component{

  constructor(props){
    super(props);
    this.state = {

    };

    // this.handleKeywordInputChange = this.handleKeywordInputChange.bind(this);
  }

  componentDidMount() {

    saveCurrentPageTitle(appParams.COMPONENT_CONTEXT_NAMES.BOOKMARKS);

    this.getBookmarkList();

  }

  getBookmarkList(){

    sendDatabaseActionMessage(messageParams.requestHeaders.GET_LIST, dbData.objectStoreNames.BOOKMARKS, { context: appParams.COMPONENT_CONTEXT_NAMES.BOOKMARKS });

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
