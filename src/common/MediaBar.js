import React from 'react';
import { Bar } from 'react-native-progress';
import { useMediaProgress } from '../redux/reduxHook';

function MediaBar({ msgId }) {
   const mediaProgressData = useMediaProgress(msgId) || {};

   return mediaProgressData?.progress ? (
      <Bar
         useNativeDriver={true}
         progress={mediaProgressData?.progress / 100}
         width={80}
         height={2}
         color="#fff"
         borderWidth={0}
         unfilledColor={'rgba(0, 0, 0, 0.5)'}
      />
   ) : (
      <Bar
         useNativeDriver={true}
         indeterminate
         width={80}
         height={2}
         color="#fff"
         borderWidth={0}
         unfilledColor={'rgba(0, 0, 0, 0.5)'}
      />
   );
}

export default MediaBar;
