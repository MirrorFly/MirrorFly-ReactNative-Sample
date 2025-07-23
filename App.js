import React from 'react';
import { Platform } from 'react-native';
import { MirrorflyChatComponent } from './src/MirrorflyChatComponent';
import { CallComponent } from './src/calls/CallComponent';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const MirrorflyComponent = (props = {}) => {
   const renderCallComponent = () => {
      return Platform.OS === 'ios' ? <CallComponent /> : null;
   };

   return (
      <SafeAreaProvider>
         <MirrorflyChatComponent {...props} />
         {renderCallComponent()}
      </SafeAreaProvider>
   );
};

function App() {
   return <MirrorflyComponent />;
}

export default App;
