import React from 'react';
import RNCallKeep from '../customModules/CallKitModule';
import RNVoipPushNotification from 'react-native-voip-push-notification';
import { Provider } from 'react-redux';
import Store from '../redux/store';
import CallContainer from './CallContainer';

export const CallComponent = () => {
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
         <CallContainer />
      </Provider>
   );
};
