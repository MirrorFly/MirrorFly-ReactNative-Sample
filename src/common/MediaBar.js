import React from 'react';
import { I18nManager, View } from 'react-native';
import { Bar } from 'react-native-progress';
import PropTypes from 'prop-types';
import { useMediaProgress } from '../redux/reduxHook';

function MediaBar({ msgId }) {
   const mediaProgressData = useMediaProgress(msgId) || {};
   return mediaProgressData?.progress ? (
      <Bar
         useNativeDriver={true}
         progress={mediaProgressData?.progress / 100}
         height={2}
         width={80}
         color="#fff"
         borderWidth={0}
         unfilledColor={'rgba(0, 0, 0, 0.5)'}
      />
   ) : (
      <View
         style={{
            transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }], // Flip the bar in RTL mode
         }}>
         <Bar
            useNativeDriver={true}
            indeterminate
            height={2}
            color="#fff"
            borderWidth={0}
            unfilledColor={'rgba(0, 0, 0, 0.5)'}
         />
      </View>
   );
}
MediaBar.propTypes = {
   msgId: PropTypes.string,
};

export default MediaBar;
