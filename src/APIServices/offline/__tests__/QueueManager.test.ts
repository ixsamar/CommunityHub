import {QueueManager} from '../QueueManager';

beforeEach(() => {
  QueueManager.clearQueue();
});

describe('QueueManager', () => {
  describe('enqueue()', () => {
    it('adds an item to the empty queue and returns an id', () => {
      const id = QueueManager.enqueue('JOIN', {communityId: 'c1'});
      expect(typeof id).toBe('string');
      expect(id.startsWith('item_')).toBe(true);
      expect(QueueManager.getQueue()).toHaveLength(1);
    });

    it('adds multiple items', () => {
      QueueManager.enqueue('JOIN', {communityId: 'c1'});
      QueueManager.enqueue('LEAVE', {communityId: 'c2'});
      QueueManager.enqueue('CREATE_POST', {postData: {title: 'Test'}});
      expect(QueueManager.getQueue()).toHaveLength(3);
    });

    it('sets retries to 0 on enqueue', () => {
      const id = QueueManager.enqueue('JOIN', {communityId: 'c1'});
      const item = QueueManager.getQueue().find(x => x.id === id);
      expect(item?.retries).toBe(0);
    });

    it('assigns a timestamp', () => {
      const before = Date.now();
      const id = QueueManager.enqueue('JOIN', {communityId: 'c1'});
      const after = Date.now();
      const item = QueueManager.getQueue().find(x => x.id === id);
      expect(item?.timestamp).toBeGreaterThanOrEqual(before);
      expect(item?.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('dequeue()', () => {
    it('removes the item by id', () => {
      const id = QueueManager.enqueue('JOIN', {communityId: 'c1'});
      QueueManager.dequeue(id);
      expect(QueueManager.getQueue()).toHaveLength(0);
    });

    it('does not throw when dequeuing a nonexistent id', () => {
      expect(() => QueueManager.dequeue('nonexistent_id')).not.toThrow();
    });

    it('only removes the targeted item', () => {
      const id1 = QueueManager.enqueue('JOIN', {communityId: 'c1'});
      QueueManager.enqueue('LEAVE', {communityId: 'c2'});
      QueueManager.dequeue(id1);
      const queue = QueueManager.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].type).toBe('LEAVE');
    });
  });

  describe('incrementRetries()', () => {
    it('increments the retry counter', () => {
      const id = QueueManager.enqueue('CREATE_POST', {postData: {title: 'Test'}});
      QueueManager.incrementRetries(id);
      QueueManager.incrementRetries(id);
      const item = QueueManager.getQueue().find(x => x.id === id);
      expect(item?.retries).toBe(2);
    });

    it('does not throw on nonexistent id', () => {
      expect(() => QueueManager.incrementRetries('ghost_id')).not.toThrow();
    });
  });

  describe('clearQueue()', () => {
    it('removes all items', () => {
      QueueManager.enqueue('JOIN', {communityId: 'c1'});
      QueueManager.enqueue('LEAVE', {communityId: 'c2'});
      QueueManager.clearQueue();
      expect(QueueManager.getQueue()).toHaveLength(0);
    });
  });

  describe('getQueue()', () => {
    it('returns an empty array when queue is empty', () => {
      expect(QueueManager.getQueue()).toEqual([]);
    });

    it('persists queue across multiple getQueue() calls', () => {
      QueueManager.enqueue('JOIN', {communityId: 'c1'});
      const q1 = QueueManager.getQueue();
      const q2 = QueueManager.getQueue();
      expect(q1).toHaveLength(1);
      expect(q2).toHaveLength(1);
    });
  });
});
