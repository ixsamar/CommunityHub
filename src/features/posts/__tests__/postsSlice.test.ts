/**
 * Posts Redux Slice Tests
 * Tests draft save/clear, optimistic post add/remove/update.
 */

import {
  postsReducer,
  saveDraft,
  clearDraft,
  addOptimisticPost,
  removeOptimisticPost,
  updateOptimisticPostStatus,
} from '../../../features/posts/store/postsSlice';
import {Post} from '../../../features/posts/types';

const initialState = postsReducer(undefined, {type: '@@INIT'});

const mockPost: Post = {
  id: 'opt_1',
  title: 'Test Post',
  content: 'Post content here',
  communityId: 'c1',
  authorId: 'user_1',
  authorName: 'Test User',
  createdAt: new Date().toISOString(),
  isPending: true,
  isFailed: false,
};

describe('postsSlice', () => {
  describe('saveDraft()', () => {
    it('saves a draft under the given key', () => {
      const state = postsReducer(
        initialState,
        saveDraft({key: 'c1', draft: {title: 'Hello', content: 'World', communityId: 'c1'}}),
      );
      expect(state.drafts['c1']).toEqual({title: 'Hello', content: 'World', communityId: 'c1'});
    });

    it('overwrites a draft with the same key', () => {
      let state = postsReducer(
        initialState,
        saveDraft({key: 'c1', draft: {title: 'Old', content: 'Old', communityId: 'c1'}}),
      );
      state = postsReducer(
        state,
        saveDraft({key: 'c1', draft: {title: 'New', content: 'New', communityId: 'c1'}}),
      );
      expect(state.drafts['c1'].title).toBe('New');
    });
  });

  describe('clearDraft()', () => {
    it('removes a draft by key', () => {
      let state = postsReducer(
        initialState,
        saveDraft({key: 'c1', draft: {title: 'Test', content: 'Test', communityId: 'c1'}}),
      );
      state = postsReducer(state, clearDraft('c1'));
      expect(state.drafts['c1']).toBeUndefined();
    });
  });

  describe('addOptimisticPost()', () => {
    it('adds a post to the optimistic list', () => {
      const state = postsReducer(initialState, addOptimisticPost(mockPost));
      expect(state.optimisticPosts).toHaveLength(1);
      expect(state.optimisticPosts[0].id).toBe('opt_1');
    });

    it('does not add a duplicate post', () => {
      let state = postsReducer(initialState, addOptimisticPost(mockPost));
      state = postsReducer(state, addOptimisticPost(mockPost));
      expect(state.optimisticPosts).toHaveLength(1);
    });

    it('prepends the new post at the start', () => {
      const post2: Post = {...mockPost, id: 'opt_2', title: 'Second'};
      let state = postsReducer(initialState, addOptimisticPost(mockPost));
      state = postsReducer(state, addOptimisticPost(post2));
      expect(state.optimisticPosts[0].id).toBe('opt_2');
    });
  });

  describe('removeOptimisticPost()', () => {
    it('removes a post by id', () => {
      let state = postsReducer(initialState, addOptimisticPost(mockPost));
      state = postsReducer(state, removeOptimisticPost('opt_1'));
      expect(state.optimisticPosts).toHaveLength(0);
    });

    it('does not affect other posts', () => {
      const post2: Post = {...mockPost, id: 'opt_2'};
      let state = postsReducer(initialState, addOptimisticPost(mockPost));
      state = postsReducer(state, addOptimisticPost(post2));
      state = postsReducer(state, removeOptimisticPost('opt_1'));
      expect(state.optimisticPosts).toHaveLength(1);
      expect(state.optimisticPosts[0].id).toBe('opt_2');
    });
  });

  describe('updateOptimisticPostStatus()', () => {
    it('marks a post as failed', () => {
      let state = postsReducer(initialState, addOptimisticPost(mockPost));
      state = postsReducer(state, updateOptimisticPostStatus({id: 'opt_1', isFailed: true}));
      expect(state.optimisticPosts[0].isFailed).toBe(true);
    });

    it('marks a post as no longer pending after sync', () => {
      let state = postsReducer(initialState, addOptimisticPost(mockPost));
      state = postsReducer(state, updateOptimisticPostStatus({id: 'opt_1', isPending: false}));
      expect(state.optimisticPosts[0].isPending).toBe(false);
    });

    it('does nothing for a nonexistent id', () => {
      const state = postsReducer(initialState, updateOptimisticPostStatus({id: 'ghost', isFailed: true}));
      expect(state.optimisticPosts).toHaveLength(0);
    });
  });
});
