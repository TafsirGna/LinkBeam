import { configureStore } from '@reduxjs/toolkit';
import bookmarksReducer from './redux/slices/bookmarksSlice';

export default configureStore({
  reducer: {
    bookmarks: bookmarksReducer,
  }
})