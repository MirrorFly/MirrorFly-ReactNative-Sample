import React from 'react';
import { Platform } from 'react-native';
import { MirrorflyChatComponent } from './src/MirrorflyChatComponent';
import { CallComponent } from './src/calls/CallComponent';

function App() {
   const renderCallComponent = () => {
      return Platform.OS === 'ios' ? <CallComponent /> : null;
   };

   return (
      <>
         <MirrorflyChatComponent />
         {renderCallComponent()}
      </>
   );
}

export default App;
