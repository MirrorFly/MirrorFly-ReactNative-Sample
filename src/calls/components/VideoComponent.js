import React from 'react';
import { StyleSheet } from 'react-native';
import { RTCView } from 'react-native-webrtc';

const VideoComponent = (props = {}) => {
   const { stream, isFrontCameraEnabled, zIndex = 0 } = props;
   /**
   // const streamURL = React.useMemo(() => {
   //    return stream?.video.toURL();
   // }, [stream?.video.toURL()]);
   */
   const frontCamera = React.useMemo(() => {
      return isFrontCameraEnabled ? true : false;
   }, [isFrontCameraEnabled]);

   return stream ? (
      <RTCView
         streamURL={stream?.video.toURL()}
         style={[styles.localVideo]}
         objectFit={'cover'}
         zOrder={zIndex}
         mirror={frontCamera}
      />
   ) : null;
};

export default VideoComponent;

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
