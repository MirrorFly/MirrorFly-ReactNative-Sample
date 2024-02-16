import React from 'react';
import RNCallKeep from 'react-native-callkeep';
import RNVoipPushNotification from 'react-native-voip-push-notification';
import { Provider } from 'react-redux';
import Store from '../redux/store';
import CallContainer from './CallContainer';

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
