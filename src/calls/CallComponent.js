import React from 'react';
import { Provider } from 'react-redux';
import Store from '../redux/store';
import CallContainer from './CallContainer';

const CallComponent = ({hasNativeBaseProvider = false}) => {
   return (
      <Provider store={Store}>
         <CallContainer hasNativeBaseProvider={hasNativeBaseProvider} />
      </Provider>
   );
};

export default CallComponent;
