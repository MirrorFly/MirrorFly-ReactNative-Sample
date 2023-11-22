import React from 'react';
import { Provider } from 'react-redux';
import Store from '../redux/store';
import CallContainer from './CallContainer';
import { setupCallKit } from '../components/calls/ios';
import { Platform } from 'react-native';

// Setup ios callkit
if (Platform.OS === 'ios') {
   setupCallKit();
}

const CallComponent = ({hasNativeBaseProvider = false}) => {
   return (
      <Provider store={Store}>
         <CallContainer hasNativeBaseProvider={hasNativeBaseProvider} />
      </Provider>
   );
};

export default CallComponent;
