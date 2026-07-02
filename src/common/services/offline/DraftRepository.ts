import {storage} from '../../storage/mmkv';
import {Logger} from '../../utils/logger';

export interface PostDraft {
  title: string;
  content: string;
  communityId: string;
}

export class DraftRepository {
  private static getDraftKey(communityId: string = 'global'): string {
    return `post_draft_${communityId}`;
  }

  public static saveDraft(communityId: string, draft: PostDraft): void {
    try {
      const key = this.getDraftKey(communityId);
      storage.set(key, JSON.stringify(draft));
      Logger.debug(`Draft saved for community: ${communityId}`, 'DraftRepository');
    } catch (error) {
      Logger.error(`Failed to save draft for community: ${communityId}`, 'DraftRepository', error);
    }
  }

  public static getDraft(communityId: string): PostDraft | null {
    try {
      const key = this.getDraftKey(communityId);
      const value = storage.getString(key);
      if (!value) return null;
      return JSON.parse(value) as PostDraft;
    } catch (error) {
      Logger.error(`Failed to load draft for community: ${communityId}`, 'DraftRepository', error);
      return null;
    }
  }

  public static clearDraft(communityId: string): void {
    try {
      const key = this.getDraftKey(communityId);
      storage.delete(key);
      Logger.debug(`Draft cleared for community: ${communityId}`, 'DraftRepository');
    } catch (error) {
      Logger.error(`Failed to clear draft for community: ${communityId}`, 'DraftRepository', error);
    }
  }
}
