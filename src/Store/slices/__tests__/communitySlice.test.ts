import {
  communityReducer,
  setSearchQuery,
  setSortBy,
  setFilterType,
  setScrollOffset,
  setListPage,
  resetFilters,
} from '../communitySlice';

const initialState = communityReducer(undefined, {type: '@@INIT'});

describe('communitySlice', () => {
  describe('initial state', () => {
    it('has the correct default field values', () => {
      expect(initialState.searchQuery).toBe('');
      expect(initialState.sortBy).toBe('name');
      expect(initialState.filterType).toBe('all');
      expect(initialState.scrollOffset).toBe(0);
      expect(initialState.listPage).toBe(1);
    });
  });

  describe('setSearchQuery()', () => {
    it('sets the search query', () => {
      const state = communityReducer(initialState, setSearchQuery('react'));
      expect(state.searchQuery).toBe('react');
    });

    it('resets listPage to 1 when search changes', () => {
      let state = communityReducer(initialState, setListPage(3));
      state = communityReducer(state, setSearchQuery('redux'));
      expect(state.listPage).toBe(1);
    });
  });

  describe('setSortBy()', () => {
    it('updates the sort field', () => {
      const state = communityReducer(initialState, setSortBy('members'));
      expect(state.sortBy).toBe('members');
    });

    it('resets listPage to 1 when sort changes', () => {
      let state = communityReducer(initialState, setListPage(5));
      state = communityReducer(state, setSortBy('recent'));
      expect(state.listPage).toBe(1);
    });
  });

  describe('setFilterType()', () => {
    it('updates the filter type to private', () => {
      const state = communityReducer(initialState, setFilterType('private'));
      expect(state.filterType).toBe('private');
    });

    it('updates the filter type to public', () => {
      const state = communityReducer(initialState, setFilterType('public'));
      expect(state.filterType).toBe('public');
    });

    it('resets listPage to 1 when filter changes', () => {
      let state = communityReducer(initialState, setListPage(4));
      state = communityReducer(state, setFilterType('private'));
      expect(state.listPage).toBe(1);
    });
  });

  describe('setScrollOffset()', () => {
    it('updates the scroll offset', () => {
      const state = communityReducer(initialState, setScrollOffset(480));
      expect(state.scrollOffset).toBe(480);
    });

    it('can be set to 0 (scroll-to-top)', () => {
      let state = communityReducer(initialState, setScrollOffset(999));
      state = communityReducer(state, setScrollOffset(0));
      expect(state.scrollOffset).toBe(0);
    });
  });

  describe('setListPage()', () => {
    it('updates the list page', () => {
      const state = communityReducer(initialState, setListPage(3));
      expect(state.listPage).toBe(3);
    });
  });

  describe('resetFilters()', () => {
    it('resets all state fields to initial values', () => {
      let state = communityReducer(initialState, setSearchQuery('test'));
      state = communityReducer(state, setSortBy('members'));
      state = communityReducer(state, setFilterType('private'));
      state = communityReducer(state, setScrollOffset(300));
      state = communityReducer(state, setListPage(7));

      const reset = communityReducer(state, resetFilters());
      expect(reset).toEqual(initialState);
    });
  });
});
