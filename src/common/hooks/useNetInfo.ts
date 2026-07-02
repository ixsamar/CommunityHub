import {useEffect, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetInfo = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
};
