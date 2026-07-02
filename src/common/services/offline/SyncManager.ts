import {store} from '../../../app/store';
import {QueueManager} from './QueueManager';
import {communityApi} from '../../../features/community/api/communityApi';
import {postsApi} from '../../../features/posts/api/postsApi';
import {Logger} from '../../utils/logger';

export class SyncManager {
  private static isSyncing = false;

  public static async sync(): Promise<void> {
    if (this.isSyncing) {
      Logger.debug('Synchronization already in progress, skipping.', 'SyncManager');
      return;
    }

    this.isSyncing = true;
    Logger.info('Starting offline queue synchronization...', 'SyncManager');

    const queue = QueueManager.getQueue();
    if (queue.length === 0) {
      this.isSyncing = false;
      Logger.info('Offline queue is empty. Sync complete.', 'SyncManager');
      return;
    }

    for (const item of queue) {
      try {
        Logger.info(`Syncing item ${item.id} of type ${item.type}`, 'SyncManager');

        if (item.type === 'JOIN') {
          const payload = item.payload as { communityId: string };
          await store.dispatch(communityApi.endpoints.joinCommunity.initiate(payload.communityId)).unwrap();
        } else if (item.type === 'LEAVE') {
          const payload = item.payload as { communityId: string };
          await store.dispatch(communityApi.endpoints.leaveCommunity.initiate(payload.communityId)).unwrap();
        } else if (item.type === 'CREATE_POST') {
          const payload = item.payload as { postData: unknown };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await store.dispatch(postsApi.endpoints.createPost.initiate(payload.postData as any)).unwrap();
        }

        // Action succeeded, remove from queue
        QueueManager.dequeue(item.id);
      } catch (error: unknown) {
        const err = error as {
          status?: string;
          message?: string;
        };
        Logger.error(`Sync failed for item ${item.id}`, 'SyncManager', err);

        // Determine if it is a transient network issue or a permanent business logic failure
        const isNetworkError =
          err?.status === 'FETCH_ERROR' ||
          !err?.status ||
          err.message?.includes('Network') ||
          err.message?.includes('timeout');

        if (isNetworkError) {
          QueueManager.incrementRetries(item.id);
          const updatedQueue = QueueManager.getQueue();
          const currentItem = updatedQueue.find((x) => x.id === item.id);
          
          if (currentItem && currentItem.retries >= 5) {
            Logger.warn(`Discarding item ${item.id} after exceeding max retries`, 'SyncManager');
            QueueManager.dequeue(item.id);
            continue;
          }
          
          // Pause queue sync to avoid spamming while offline
          break;
        } else {
          // Permanent failure (e.g. 400 Bad Request, 404 Not Found), discard item
          Logger.warn(`Discarding item ${item.id} due to permanent API rejection`, 'SyncManager');
          QueueManager.dequeue(item.id);
        }
      }
    }

    this.isSyncing = false;
    Logger.info('Offline queue synchronization run completed.', 'SyncManager');
  }
}
