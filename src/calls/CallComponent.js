import React from 'react';
import { Provider } from 'react-redux';
import Store from '../redux/store';
import CallContainer from './CallContainer';

const CallComponent = () => {
   return (
      <Provider store={Store}>
         <CallContainer />
      </Provider>
   );
};

export default CallComponent;
