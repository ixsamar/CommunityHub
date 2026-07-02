import {AppState, AppStateStatus} from 'react-native';
import {NetworkObserver} from './NetworkObserver';
import {SyncManager} from './SyncManager';
import {Logger} from '../../Utils/logger';

export class OfflineManager {
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) {
      Logger.debug('OfflineManager already initialized.', 'OfflineManager');
      return;
    }
    this.isInitialized = true;

    Logger.info('Initializing OfflineManager core integration handlers...', 'OfflineManager');

    NetworkObserver.initialize();

    NetworkObserver.subscribe(isConnected => {
      if (isConnected) {
        Logger.info(
          'Network transition to ONLINE detected. Triggering queue sync...',
          'OfflineManager',
        );
        SyncManager.sync();
      }
    });

    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        Logger.info(
          'App returned to active foreground state. Checking sync parameters...',
          'OfflineManager',
        );
        if (NetworkObserver.getStatus()) {
          SyncManager.sync();
        }
      }
    });
  }
}
