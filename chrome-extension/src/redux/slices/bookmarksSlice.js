import { createSlice } from '@reduxjs/toolkit';

export const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState: {
    value: null,
  },
  reducers: {
    setValue: (state, action) => {
      state.value = action.payload
    }
  }
});

export const { setValue } = bookmarksSlice.actions;

export default bookmarksSlice.reducer;