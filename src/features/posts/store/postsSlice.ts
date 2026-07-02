import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Post} from '../types';

export interface PostDraft {
  title: string;
  content: string;
  communityId: string;
}

interface PostsState {
  drafts: Record<string, PostDraft>;
  optimisticPosts: Post[];
}

const initialState: PostsState = {
  drafts: {},
  optimisticPosts: [],
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    saveDraft: (state, action: PayloadAction<{key: string; draft: PostDraft}>) => {
      state.drafts[action.payload.key] = action.payload.draft;
    },
    clearDraft: (state, action: PayloadAction<string>) => {
      delete state.drafts[action.payload];
    },
    addOptimisticPost: (state, action: PayloadAction<Post>) => {
      // Avoid duplicates
      if (!state.optimisticPosts.some((p) => p.id === action.payload.id)) {
        state.optimisticPosts.unshift(action.payload);
      }
    },
    removeOptimisticPost: (state, action: PayloadAction<string>) => {
      state.optimisticPosts = state.optimisticPosts.filter((p) => p.id !== action.payload);
    },
    updateOptimisticPostStatus: (
      state,
      action: PayloadAction<{id: string; isPending?: boolean; isFailed?: boolean; newId?: string}>,
    ) => {
      const post = state.optimisticPosts.find((p) => p.id === action.payload.id);
      if (post) {
        if (action.payload.isPending !== undefined) post.isPending = action.payload.isPending;
        if (action.payload.isFailed !== undefined) post.isFailed = action.payload.isFailed;
        if (action.payload.newId !== undefined) post.id = action.payload.newId;
      }
    },
  },
});

export const {
  saveDraft,
  clearDraft,
  addOptimisticPost,
  removeOptimisticPost,
  updateOptimisticPostStatus,
} = postsSlice.actions;

export const postsReducer = postsSlice.reducer;
