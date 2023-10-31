import React from 'react';
import { ChatApp } from './src/ChatApp';
import { requestNotificationPermission } from './src/common/utils';
import { removeAllDeliveredNotification } from './src/Service/remoteNotifyHandle';
import messaging from '@react-native-firebase/messaging';
import { callBacks } from './src/SDKActions/callbacks';

function App() {
  const API_URL = 'https://api-uikit-qa.contus.us/api/v1';
  const QALisenceKey = 'ckIjaccWBoMNvxdbql8LJ2dmKqT5bp';

  React.useEffect(() => {
    (async () => {
      await SDK.initializeSDK({
        apiBaseUrl: API_URL,
        licenseKey: QALisenceKey,
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
