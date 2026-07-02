/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * DraftRepository Tests
 * Tests local draft CRUD operations.
 */

import {DraftRepository, PostDraft} from '../../../common/services/offline/DraftRepository';

beforeEach(() => {
  // Clear all mocked MMKV keys
  const {MMKV} = require('react-native-mmkv');
  const store = new MMKV();
  store.clearAll();
});

const mockDraft: PostDraft = {
  title: 'My Test Post',
  content: 'This is the content of the test post.',
  communityId: 'community_42',
};

describe('DraftRepository', () => {
  describe('saveDraft() and getDraft()', () => {
    it('saves and retrieves a draft for a specific community', () => {
      DraftRepository.saveDraft('community_42', mockDraft);
      const retrieved = DraftRepository.getDraft('community_42');
      expect(retrieved).toEqual(mockDraft);
    });

    it('returns null when no draft exists for a community', () => {
      const result = DraftRepository.getDraft('nonexistent_community');
      expect(result).toBeNull();
    });

    it('overwrites an existing draft on re-save', () => {
      DraftRepository.saveDraft('community_42', mockDraft);
      const updated: PostDraft = {...mockDraft, title: 'Updated Title'};
      DraftRepository.saveDraft('community_42', updated);
      const retrieved = DraftRepository.getDraft('community_42');
      expect(retrieved?.title).toBe('Updated Title');
    });

    it('isolates drafts between different communities', () => {
      DraftRepository.saveDraft('c1', mockDraft);
      DraftRepository.saveDraft('c2', {...mockDraft, title: 'Community 2 Draft'});
      expect(DraftRepository.getDraft('c1')?.title).toBe('My Test Post');
      expect(DraftRepository.getDraft('c2')?.title).toBe('Community 2 Draft');
    });
  });

  describe('clearDraft()', () => {
    it('clears the draft for a specific community', () => {
      DraftRepository.saveDraft('community_42', mockDraft);
      DraftRepository.clearDraft('community_42');
      expect(DraftRepository.getDraft('community_42')).toBeNull();
    });

    it('does not throw when clearing a nonexistent draft', () => {
      expect(() => DraftRepository.clearDraft('ghost_community')).not.toThrow();
    });

    it('does not affect drafts for other communities', () => {
      DraftRepository.saveDraft('c1', mockDraft);
      DraftRepository.saveDraft('c2', {...mockDraft, title: 'C2 Draft'});
      DraftRepository.clearDraft('c1');
      expect(DraftRepository.getDraft('c1')).toBeNull();
      expect(DraftRepository.getDraft('c2')).not.toBeNull();
    });
  });
});
