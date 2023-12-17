import React from 'react';
import { ChatApp } from './src/ChatApp';
import { requestNotificationPermission } from './src/common/utils';
import { removeAllDeliveredNotification } from './src/Service/remoteNotifyHandle';
import messaging from '@react-native-firebase/messaging';
import { callBacks } from './src/SDKActions/callbacks';

function App() {
  const API_URL = '***************';
  const LisenceKey = '***************';

  React.useEffect(() => {
    (async () => {
      await SDK.initializeSDK({
        apiBaseUrl: API_URL,
        licenseKey: LisenceKey,
        callbackListeners: callBacks,
        isSandbox: false,
      });
      await messaging().requestPermission();
      requestNotificationPermission();
      removeAllDeliveredNotification();
    })();
  });

  return (
    <ChatApp />
  );
}

export default App;
