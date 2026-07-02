import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {Logger} from '../../utils/logger';

export type NetworkCallback = (isConnected: boolean) => void;

export class NetworkObserver {
  private static listeners: Set<NetworkCallback> = new Set();
  private static isConnected: boolean = true;
  private static unsubscribe: (() => void) | null = null;

  public static initialize(): void {
    if (this.unsubscribe) return;

    // Fetch initial status
    NetInfo.fetch().then((state) => {
      this.isConnected = !!state.isConnected;
    });

    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isOnline = !!state.isConnected;
      if (this.isConnected !== isOnline) {
        this.isConnected = isOnline;
        Logger.info(
          `Network connection status changed to: ${isOnline ? 'ONLINE' : 'OFFLINE'}`,
          'NetworkObserver',
        );
        this.notifyListeners(isOnline);
      }
    });
  }

  public static getStatus(): boolean {
    return this.isConnected;
  }

  public static subscribe(callback: NetworkCallback): () => void {
    this.listeners.add(callback);
    callback(this.isConnected); // Call immediately with current state
    return () => {
      this.listeners.delete(callback);
    };
  }

  private static notifyListeners(isConnected: boolean): void {
    this.listeners.forEach((callback) => {
      try {
        callback(isConnected);
      } catch (error) {
        Logger.error('Error triggering network callback listener', 'NetworkObserver', error);
      }
    });
  }

  public static cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }
}
