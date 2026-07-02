import {storage} from '../../Utils/mmkv';
import {Logger} from '../../Utils/logger';

export interface QueueItem {
  id: string;
  type: 'JOIN' | 'LEAVE' | 'CREATE_POST' | 'CREATE_COMMUNITY';
  payload: unknown;
  timestamp: number;
  retries: number;
}

export class QueueManager {
  private static readonly QUEUE_KEY = 'offline_mutations_queue';

  public static getQueue(): QueueItem[] {
    try {
      const value = storage.getString(this.QUEUE_KEY);
      if (!value) return [];
      return JSON.parse(value) as QueueItem[];
    } catch (error) {
      Logger.error('Failed to retrieve offline sync queue', 'QueueManager', error);
      return [];
    }
  }

  private static saveQueue(queue: QueueItem[]): void {
    try {
      storage.set(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      Logger.error('Failed to write offline sync queue', 'QueueManager', error);
    }
  }

  public static enqueue(
    type: 'JOIN' | 'LEAVE' | 'CREATE_POST' | 'CREATE_COMMUNITY',
    payload: unknown,
  ): string {
    const queue = this.getQueue();
    const id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem: QueueItem = {
      id,
      type,
      payload,
      timestamp: Date.now(),
      retries: 0,
    };
    queue.push(newItem);
    this.saveQueue(queue);
    Logger.info(`Enqueued offline action type: ${type} with id: ${id}`, 'QueueManager');
    return id;
  }

  public static dequeue(id: string): void {
    let queue = this.getQueue();
    const beforeLength = queue.length;
    queue = queue.filter(item => item.id !== id);
    if (queue.length < beforeLength) {
      this.saveQueue(queue);
      Logger.debug(`Dequeued action item: ${id}`, 'QueueManager');
    }
  }

  public static incrementRetries(id: string): void {
    const queue = this.getQueue();
    const item = queue.find(x => x.id === id);
    if (item) {
      item.retries += 1;
      this.saveQueue(queue);
      Logger.debug(`Incremented retries for item: ${id} to ${item.retries}`, 'QueueManager');
    }
  }

  public static resetRetries(id: string): void {
    const queue = this.getQueue();
    const item = queue.find(x => x.id === id);
    if (item) {
      item.retries = 0;
      this.saveQueue(queue);
      Logger.debug(`Reset retries for item: ${id}`, 'QueueManager');
    }
  }

  public static clearQueue(): void {
    try {
      storage.delete(this.QUEUE_KEY);
      Logger.info('Cleared offline queue', 'QueueManager');
    } catch (error) {
      Logger.error('Failed to clear queue', 'QueueManager', error);
    }
  }
}
