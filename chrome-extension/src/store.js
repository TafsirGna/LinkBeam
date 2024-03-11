import { configureStore } from '@reduxjs/toolkit';
import bookmarksReducer from './slices/bookmarksSlice';

export default configureStore({
  reducer: {
    bookmarks: bookmarksReducer,
  }
})