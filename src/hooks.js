import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';

let networkState = null;
NetInfo.addEventListener(state => {
  networkState = state;
});

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = React.useState(
    networkState?.isInternetReachable || null,
  );

  React.useLayoutEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isInternetReachable);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
};

export const useAppState = () => {
  const [isActive, setIsActive] = React.useState(null);

  React.useEffect(() => {
    AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    });
  }, []);

  return isActive;
};
