import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';
import CameraService, { orientationCheck } from '../RNCamera/CameraService';
import useCallbackRef from '../RNCamera/camHooks';
import useCamera from '../RNCamera/useCam';
import flashAutoIcon from '../assets/ic_flash_auto.png';
import flashOffIcon from '../assets/ic_flash_off.png';
import flashOnIcon from '../assets/ic_flash_on.png';
import flipCameraIcon from '../assets/ic_flip_camera_android.png';
import IconButton from '../common/IconButton';
import { LeftArrowIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import {
   getImageSource,
   getType,
   mediaObjContructor,
   millisToMinutesAndSeconds,
   showToast,
   validateFileSize,
} from '../helpers/chatHelpers';

import commonStyles from '../styles/commonStyles';
import { CAMERA_SCREEN, MEDIA_PRE_VIEW_SCREEN } from './constants';

const cameraService = new CameraService();

const Camera = () => {
   const navigation = useNavigation();
   const [flashMode, setFlashMode] = React.useState(RNCamera.Constants.FlashMode.off);
   const [cameraType, setCameraType] = React.useState(RNCamera.Constants.Type.back);
   const { ref, callbackRef } = useCallbackRef();
   const { recording, takePicture, startRecordingVideo, stopRecordingVideo } = useCamera(ref);
   const changeCameraType = () => {
      setCameraType(cameraService.getNewCameraType(cameraType));
   };
   const recordingIntervalRef = React.useRef(null);
   const [data, setData] = React.useState();
   const [videoData, setVideoData] = React.useState();
   const [captureTime, setCaptureTime] = React.useState(0);
   const [flashIcon, setFlashIcon] = React.useState(flashOffIcon);
   const [isCapturing, setIsCapturing] = React.useState(false);

   React.useEffect(() => {
      if (data) {
         setCaptureTime(0);
         navigation.navigate(MEDIA_PRE_VIEW_SCREEN, { preScreen: CAMERA_SCREEN, selectedImages: [data] });
      }
   }, [data]);

   const handleBackBtn = () => {
      navigation.goBack();
   };

   const onLoad = onLoadData => {
      const { naturalSize: { width, height } = {}, duration } = onLoadData;
      const combinedData = {
         ...onLoadData,
         ...videoData,
         width,
         height,
         duration: duration,
         type: 'video',
      };
      const imageFile = {
         caption: '',
         fileDetails: mediaObjContructor('RN_CAMERA', combinedData),
      };
      const size = validateFileSize(imageFile.fileDetails.fileSize, getType(imageFile.fileDetails.type));
      if (size) {
         return showToast(size);
      }
      if (!size) {
         setData(imageFile);
      }
   };

   const toggleFlashMode = () => {
      setFlashMode(prevFlash => {
         if (prevFlash === RNCamera.Constants.FlashMode.off) {
            setFlashIcon(flashOnIcon);
            return RNCamera.Constants.FlashMode.on;
         } else if (prevFlash === RNCamera.Constants.FlashMode.on) {
            setFlashIcon(flashAutoIcon);
            return RNCamera.Constants.FlashMode.auto;
         } else {
            setFlashIcon(flashOffIcon);
            return RNCamera.Constants.FlashMode.off;
         }
      });
   };

   const handlePress = () => {
      try {
         setIsCapturing(true);
         let fileInfo, combinedData;
         takePicture().then(async res => {
            fileInfo = await RNFS.stat(res?.uri);
            combinedData = {
               ...fileInfo,
               ...res,
               type: 'image',
            };
            if (orientationCheck(combinedData.pictureOrientation) && combinedData.width > combinedData.height) {
               const temp = combinedData.width;
               combinedData.width = combinedData.height;
               combinedData.height = temp;
            }
            const imageFile = {
               caption: '',
               fileDetails: mediaObjContructor('RN_CAMERA', combinedData),
            };
            const size = validateFileSize(imageFile.fileDetails.fileSize, getType(imageFile.fileDetails.type));
            if (size) {
               showToast(size);
            }
            if (!size) {
               setData(imageFile);
            }
         });
      } catch (error) {
         console.error('Error taking photo:', error);
      } finally {
         setIsCapturing(false);
      }
   };

   /**
   const handleLongPress = () => {
      try {
         if (flashMode === RNCamera.Constants.FlashMode.on) {
            setFlashMode(RNCamera.Constants.FlashMode.torch);
         }
         startRecordingVideo().then(async res => {
            const fileInfo = await RNFS.stat(res.uri);
            setVideoData({ ...res, ...fileInfo });
            setFlashMode(RNCamera.Constants.FlashMode.off);
         });
         recordingIntervalRef.current = setInterval(() => {
            setCaptureTime(prevTime => prevTime + 1);
         }, 1000);
      } catch (error) {
         console.log('startRecording', error);
      }
   };
   */

   const handlePressOut = () => {
      stopRecordingVideo();
      clearInterval(recordingIntervalRef.current);
   };

   return (
      <>
         <View style={styles.container}>
            <RNCamera
               ratio={'16:9'}
               ref={callbackRef}
               type={cameraType}
               flashMode={flashMode}
               captureAudio={true}
               style={styles.preview}
            />
            <View style={styles.topBtns}>
               <View
                  style={[commonStyles.hstack, commonStyles.justifyContentSpaceBetween, commonStyles.alignItemsCenter]}>
                  <IconButton onPress={handleBackBtn}>
                     <LeftArrowIcon color={'#fff'} />
                  </IconButton>
                  {captureTime > 0 && (
                     <View style={[commonStyles.hstack, commonStyles.alignItemsCenter]}>
                        <View style={styles.recording} />
                        <Text style={[commonStyles.fontSize_12, commonStyles.colorWhite]}>
                           {millisToMinutesAndSeconds(captureTime * 1000)}
                        </Text>
                     </View>
                  )}
                  <View />
               </View>
            </View>
            <View style={styles.bottomBtns}>
               <View
                  style={[
                     commonStyles.hstack,
                     commonStyles.justifyContentSpaceBetween,
                     commonStyles.alignItemsCenter,
                     commonStyles.px_10,
                  ]}>
                  <Pressable onPress={toggleFlashMode}>
                     <Image alt="flash-icon" style={styles.flashIcon} source={getImageSource(flashIcon)} />
                  </Pressable>
                  <TouchableOpacity
                     onPress={handlePress}
                     // onLongPress={handleLongPress}
                     onPressOut={handlePressOut}
                     style={styles.captureContainer}>
                     {isCapturing ? (
                        <ActivityIndicator size="lg" color={'#3276E2'} />
                     ) : (
                        recording && <View style={styles.captureBtn} />
                     )}
                  </TouchableOpacity>
                  <Pressable onPress={changeCameraType}>
                     <Image alt="flip-icon" style={styles.flashIcon} source={getImageSource(flipCameraIcon)} />
                  </Pressable>
               </View>
            </View>
            <View>
               {Boolean(videoData?.uri) && (
                  <View style={styles.video}>
                     <Video paused={true} source={{ uri: videoData?.uri }} onLoad={onLoad} />
                  </View>
               )}
            </View>
         </View>
         <View style={styles.textContainer}>
            {/* Hold for video,  */}
            <Text style={[commonStyles.fontSize_12, commonStyles.colorWhite]}>Tap for photo</Text>
         </View>
      </>
   );
};

export default Camera;

const styles = StyleSheet.create({
   textContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
      alignItems: 'center',
      backgroundColor: '#000',
   },
   video: {
      display: 'none',
   },
   container: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'black',
      position: 'relative',
   },
   topBtns: {
      position: 'absolute',
      top: 10,
      left: 0,
      right: 0,
      paddingHorizontal: 10,
   },
   bottomBtns: {
      position: 'absolute',
      bottom: 30,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
   },
   preview: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 50,
      marginBottom: 110,
   },
   captureContainer: {
      borderWidth: 2,
      borderColor: '#fff',
      borderRadius: 50,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
   },
   captureBtn: {
      borderRadius: 50,
      backgroundColor: 'red',
      width: 45,
      height: 45,
   },
   recording: {
      borderRadius: 50,
      backgroundColor: 'red',
      width: 10,
      height: 10,
   },
   flashIcon: {
      width: 25,
      height: 25,
   },
});
