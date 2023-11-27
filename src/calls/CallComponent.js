import React from 'react';
import { Provider } from 'react-redux';
import Store from '../redux/store';
import CallContainer from './CallContainer';
import { setupCallKit } from '../components/calls/ios';
import { Platform } from 'react-native';
import { pushNotifyBackground } from '../Helper/Calls/Utility';
import RNVoipPushNotification from 'react-native-voip-push-notification';
import RNCallKeep from 'react-native-callkeep';

// Setup ios callkit
if (Platform.OS === 'ios') {
   setupCallKit();
   pushNotifyBackground();
}

const CallComponent = ({ hasNativeBaseProvider = false }) => {
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

export default CallComponent;
