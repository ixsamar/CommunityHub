import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface CommunityState {
  searchQuery: string;
  sortBy: 'name' | 'members' | 'recent';
  filterType: 'all' | 'public' | 'private';
  scrollOffset: number;
  listPage: number;
}

const initialState: CommunityState = {
  searchQuery: '',
  sortBy: 'name',
  filterType: 'all',
  scrollOffset: 0,
  listPage: 1,
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.listPage = 1; // Reset to page 1 on search change
    },
    setSortBy: (state, action: PayloadAction<'name' | 'members' | 'recent'>) => {
      state.sortBy = action.payload;
      state.listPage = 1; // Reset to page 1 on sort change
    },
    setFilterType: (state, action: PayloadAction<'all' | 'public' | 'private'>) => {
      state.filterType = action.payload;
      state.listPage = 1; // Reset to page 1 on filter change
    },
    setScrollOffset: (state, action: PayloadAction<number>) => {
      state.scrollOffset = action.payload;
    },
    setListPage: (state, action: PayloadAction<number>) => {
      state.listPage = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.sortBy = 'name';
      state.filterType = 'all';
      state.listPage = 1;
      state.scrollOffset = 0;
    },
  },
});

export const {
  setSearchQuery,
  setSortBy,
  setFilterType,
  setScrollOffset,
  setListPage,
  resetFilters,
} = communitySlice.actions;

export const communityReducer = communitySlice.reducer;
