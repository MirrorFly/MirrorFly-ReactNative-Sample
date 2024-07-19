import React from 'react';
import { Platform } from 'react-native';
import { MirrorflyChatComponent } from './src/MirrorflyChatComponent';
import { CallComponent } from './src/calls/CallComponent';

export const MirrorflyComponent = (props = {}) => {
   const renderCallComponent = () => {
      return Platform.OS === 'ios' ? <CallComponent /> : null;
   };

   return (
      <>
         <MirrorflyChatComponent {...props} />
         {renderCallComponent()}
      </>
   );
};

function App() {
   return <MirrorflyComponent />;
}

export default App;
