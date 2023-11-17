import messaging from '@react-native-firebase/messaging';
import React from 'react';
import { ChatApp } from './src/ChatApp';
import SDK from './src/SDK/SDK';
import { callBacks } from './src/SDKActions/callbacks';
import { removeAllDeliveredNotification } from './src/Service/remoteNotifyHandle';
import CallComponent from './src/calls/CallComponent';
import { requestNotificationPermission } from './src/common/utils';
import { setupCallKit } from './src/components/calls/ios';
import { setAppInitialized } from './src/uikitHelpers/uikitMethods';

// Setup ios callkit
if (Platform.OS === 'ios') {
  setupCallKit();
}

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
      setAppInitialized(true);
      await messaging().requestPermission();
      requestNotificationPermission();
      removeAllDeliveredNotification();
    })();
  });

  return (
    <>
      <ChatApp />
      <CallComponent />
    </>
  );
}

export default App;
