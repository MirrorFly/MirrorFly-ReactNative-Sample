import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Platform } from 'react-native';
import { ChatApp } from './src/ChatApp';
import { CallComponent } from './src/calls/CallComponent';
import config from './src/config';
import { mirrorflyInitialize } from './src/uikitHelpers/uikitMethods';

export const MirrorflyComponent = (props = {}) => {
   const { hasNativeBaseProvider = false } = props;
   const renderCallComponent = () => {
      return Platform.OS === 'ios' ? <CallComponent hasNativeBaseProvider={hasNativeBaseProvider} /> : null;
   };

   return (
      <>
         <ChatApp {...props} />
         {renderCallComponent()}
      </>
   );
};

function App() {
   React.useEffect(() => {
      mirrorflyInitialize({
         apiBaseUrl: config.API_URL,
         licenseKey: config.licenseKey,
         callbackListeners: {},
         isSandbox: false,
      });
   }, []);

   return (
      <NativeBaseProvider>
         <MirrorflyComponent hasNativeBaseProvider={true} />
      </NativeBaseProvider>
   );
}

export default App;
