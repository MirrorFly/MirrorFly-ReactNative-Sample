import React from 'react';
import { Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import RNVoipPushNotification from 'react-native-voip-push-notification';
import { Provider } from 'react-redux';
import { pushNotifyBackground } from '../Helper/Calls/Utility';
import Store from '../redux/store';
import CallContainer from './CallContainer';
import { setupCallKit } from './ios';

// Setup ios callkit
if (Platform.OS === 'ios') {
   setupCallKit();
   pushNotifyBackground();
}

export const CallComponent = ({ hasNativeBaseProvider = false }) => {
   React.useEffect(() => {
      return () => {
         RNCallKeep.removeEventListener('didDisplayIncomingCall');
         RNCallKeep.removeEventListener('didLoadWithEvents');
         RNVoipPushNotification.removeEventListener('didLoadWithEvents');
         RNVoipPushNotification.removeEventListener('register');
         RNVoipPushNotification.removeEventListener('notification');
      };
   }, []);

   return (
      <Provider store={Store}>
         <CallContainer hasNativeBaseProvider={hasNativeBaseProvider} />
      </Provider>
   );
};
