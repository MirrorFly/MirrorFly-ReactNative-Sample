import React from 'react';
import { Bar } from 'react-native-progress';
import { useSelector } from 'react-redux';

function MediaBar({ msgId }) {
   const { data: mediaDownloadData = {} } = useSelector(state => state.mediaDownloadData);

   const { data: mediaUploadData = {} } = useSelector(state => state.mediaUploadData);

   return mediaDownloadData[msgId]?.progress || mediaUploadData[msgId]?.progress ? (
      <Bar
         useNativeDriver={true}
         progress={mediaDownloadData[msgId]?.progress / 100 || mediaUploadData[msgId]?.progress / 100}
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
