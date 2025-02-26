import React from 'react';
import { I18nManager, View } from 'react-native';
import { Bar } from 'react-native-progress';
import { useMediaProgress } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

function AttachementBar({ msgId }) {
   const progressData = useMediaProgress(msgId) || {};
   console.log('progressData.progress ==> ', progressData.progress / 100);
   return progressData.progress ? (
      <Bar
         useNativeDriver={true}
         style={[commonStyles.positionAbsolute, commonStyles.bottom_0]}
         progress={progressData.progress / 100}
         width={36}
         height={3.5}
         color="#7285B5"
         borderWidth={0}
         unfilledColor={'#AFB8D0'}
      />
   ) : (
      <View
         style={{
            transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }], // Flip the bar in RTL mode
         }}>
         <Bar
            useNativeDriver={true}
            style={[commonStyles.positionAbsolute, commonStyles.bottom_0]}
            indeterminate
            progress={progressData.progress / 100}
            height={3.5}
            color="#7285B5"
            borderWidth={0}
            unfilledColor={'#AFB8D0'}
         />
      </View>
   );
}

export default AttachementBar;
