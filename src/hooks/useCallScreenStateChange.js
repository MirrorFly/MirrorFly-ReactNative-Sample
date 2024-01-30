import React, { useEffect } from 'react';
import ActivityModule from '../customModules/ActivityModule';

/**
 * @typedef
 */

/**
 * Custom hook to listen for state change listsner
 * @returns {('active'|'background'|'killed'|null)}
 */
const useCallScreenStateChange = () => {
   const [callScreenState, setCallScreenState] = React.useState(null);

   useEffect(() => {
      let activityStateChangeListener;
      if (Platform.OS === 'android') {
         activityStateChangeListener = ActivityModule.onCallScreenStateChange(setCallScreenState);
      }

      return () => {
         activityStateChangeListener?.remove();
      };
   }, []);

   return callScreenState;
};

export default useCallScreenStateChange;
