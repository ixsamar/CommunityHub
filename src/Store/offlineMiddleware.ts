import {Middleware} from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import {secureStorage} from '../Utils/mmkv';

interface OfflineAction {
  type: string;
  payload: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

const OFFLINE_QUEUE_KEY = 'offline_queue';

const getOfflineQueue = (): OfflineAction[] => {
  const data = secureStorage.getString(OFFLINE_QUEUE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveOfflineQueue = (queue: OfflineAction[]) => {
  secureStorage.setString(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

export const offlineMiddleware: Middleware = _store => next => async action => {
  const typedAction = action as OfflineAction;

  if (
    typedAction &&
    typeof typedAction === 'object' &&
    typeof typedAction.type === 'string' &&
    typedAction.type.endsWith('/pending') &&
    typedAction.meta?.arg
  ) {
    const arg = typedAction.meta.arg as Record<string, unknown>;
    const isMutation = arg.type === 'mutation';
    if (isMutation) {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        const queue = getOfflineQueue();
        queue.push({
          type: typedAction.type.replace('/pending', '/execute'),
          payload: arg,
        });
        saveOfflineQueue(queue);
        return next({
          type: typedAction.type.replace('/pending', '/rejected'),
          error: {message: 'Offline, queued for sync'},
          meta: typedAction.meta,
        });
      }
    }
  }

  return next(action);
};

export const syncOfflineQueue = async (dispatch: (action: unknown) => unknown) => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  saveOfflineQueue([]);

  for (const queuedAction of queue) {
    try {
      const endpoint = queuedAction.payload.endpointName as string;
      const apiName = queuedAction.payload.apiName as string;
      const originalArgs = queuedAction.payload.originalArgs;

      const api = (dispatch as unknown as Record<string, unknown>)[apiName] as Record<
        string,
        unknown
      >;
      const endpoints = api?.endpoints as Record<string, unknown>;
      const endpointObj = endpoints?.[endpoint] as Record<string, unknown>;
      const initiate = endpointObj?.initiate as (args: unknown) => unknown;

      if (initiate) {
        const result = dispatch(initiate(originalArgs)) as {unwrap(): Promise<unknown>};
        await result.unwrap();
      }
    } catch {
      const currentQueue = getOfflineQueue();
      currentQueue.unshift(queuedAction);
      saveOfflineQueue(currentQueue);
      break;
    }
  }
};
