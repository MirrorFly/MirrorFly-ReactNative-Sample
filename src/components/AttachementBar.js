import React from 'react';
import { Bar } from 'react-native-progress';
import { useSelector } from 'react-redux';
import commonStyles from '../common/commonStyles';

function AttachementBar({ msgId }) {
   const { data: mediaDownloadData = {} } = useSelector(state => state.mediaDownloadData);

   const { data: mediaUploadData = {} } = useSelector(state => state.mediaUploadData);
   return mediaDownloadData[msgId]?.progress || mediaUploadData[msgId]?.progress ? (
      <Bar
         useNativeDriver={true}
         style={[commonStyles.positionAbsolute, commonStyles.bottom_0]}
         progress={mediaDownloadData[msgId]?.progress / 100 || mediaUploadData[msgId]?.progress / 100}
         width={36}
         height={3.5}
         color="#7285B5"
         borderWidth={0}
         unfilledColor={'#AFB8D0'}
      />
   ) : (
      <Bar
         useNativeDriver={true}
         style={[commonStyles.positionAbsolute, commonStyles.bottom_0]}
         indeterminate
         progress={mediaDownloadData[msgId]?.progress / 100 || mediaUploadData[msgId]?.progress / 100}
         width={36}
         height={3.5}
         color="#7285B5"
         borderWidth={0}
         unfilledColor={'#AFB8D0'}
      />
   );
}

export default AttachementBar;
