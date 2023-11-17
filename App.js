import React from 'react';
import { ChatApp } from './src/ChatApp';
import { requestNotificationPermission } from './src/common/utils';
import { removeAllDeliveredNotification } from './src/Service/remoteNotifyHandle';
import messaging from '@react-native-firebase/messaging';
import { callBacks } from './src/SDKActions/callbacks';
import { setAppInitialized } from './src/uikitHelpers/uikitMethods';
import SDK from './src/SDK/SDK';
import CallComponent from './src/calls/CallComponent';
import { setupCallKit } from './src/components/calls/ios';
import { NativeBaseProvider } from 'native-base';

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
      <NativeBaseProvider>
         <ChatApp hasNativeBaseProvider={true} />
         <CallComponent hasNativeBaseProvider={true} />
      </NativeBaseProvider>
   );
}

export default App;
