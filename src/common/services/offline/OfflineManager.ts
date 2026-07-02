import {AppState, AppStateStatus} from 'react-native';
import {NetworkObserver} from './NetworkObserver';
import {SyncManager} from './SyncManager';
import {Logger} from '../../utils/logger';

export class OfflineManager {
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) {
      Logger.debug('OfflineManager already initialized.', 'OfflineManager');
      return;
    }
    this.isInitialized = true;

    Logger.info('Initializing OfflineManager core integration handlers...', 'OfflineManager');

    // 1. Start tracking network connectivity
    NetworkObserver.initialize();

    // 2. Subscribe to connectivity change triggers
    NetworkObserver.subscribe((isConnected) => {
      if (isConnected) {
        Logger.info('Network transition to ONLINE detected. Triggering queue sync...', 'OfflineManager');
        SyncManager.sync();
      }
    });

    // 3. Register foreground app state triggers
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
