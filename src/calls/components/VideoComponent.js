import React from 'react';
import { StyleSheet } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import PropTypes from 'prop-types';

const VideoComponent = (props = {}) => {
   const { stream, isFrontCameraEnabled, zIndex = 0 } = props;

   const streamURL = React.useMemo(() => {
      return stream?.video.toURL();
   }, [stream?.video.toURL()]);

   const frontCamera = React.useMemo(() => {
      return isFrontCameraEnabled;
   }, [isFrontCameraEnabled]);

   return stream ? (
      <RTCView
         streamURL={streamURL}
         style={[styles.localVideo]}
         objectFit={'cover'}
         zOrder={zIndex}
         mirror={frontCamera}
      />
   ) : null;
};

VideoComponent.propTypes = {
   stream: PropTypes.object,
   isFrontCameraEnabled: PropTypes.bool,
   zIndex: PropTypes.number,
};

export default React.memo(VideoComponent);

const styles = StyleSheet.create({
   localVideo: {
      position: 'absolute',
      width: '100%',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
   },
});
