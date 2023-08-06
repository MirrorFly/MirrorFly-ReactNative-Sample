import { HStack, Icon, IconButton, Spinner, Text } from 'native-base';
import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { LeftArrowIcon } from '../common/Icons';
import { CHATCONVERSATION } from '../constant';
import { millisToMinutesAndSeconds } from '../Helper/Chat/Utility';
import RNFS from 'react-native-fs';

const Camera = props => {
  const { setLocalNav = () => {} } = props;
  const cameraRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const [data, setData] = useState();
  const [captureTime, setCaptureTime] = useState(0);
  const [type, setType] = useState(RNCamera.Constants.Type.back);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  const handleBackBtn = () => {
    setLocalNav(CHATCONVERSATION);
  };

  const flipCamera = () => {
    setType(
      type === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back,
    );
  };

  const capturePhoto = async () => {
    setIsCapturing(true);
    try {
      console.log('Clicked to take a photo');
      if (cameraRef.current) {
        const photoData = await cameraRef.current.takePictureAsync();
        console.log(photoData, 'Photo captured');
        setData(photoData);
      } else {
        console.warn('Camera ref is not ready');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePressIn = () => {
    console.log('press In');
    setTimeout(() => {
      setIsHolding(true);
    }, 1500);
  };

  React.useEffect(() => {
    if (isHolding) {
      startRecording();
    }
  }, [isHolding]);

  React.useEffect(() => {
    if (data) {
      setLocalNav('GalleryPickView');
    }
  }, [data]);

  const startRecording = async () => {
    try {
      if (cameraRef.current) {
        recordingIntervalRef.current = setInterval(() => {
          setCaptureTime(prevTime => prevTime + 1);
        }, 1000);
        console.log('Start Recording');
        const videoData = await cameraRef.current.recordAsync();
        const fileInfo = await RNFS.stat(videoData.uri);
        console.log(fileInfo);
        setData(fileInfo);
        console.log('Recordered', videoData);
      }
    } catch (error) {
      console.log('startRecording', error);
    }
  };

  const handlePressOut = () => {
    if (isHolding) {
      console.log('Stopped recording');
      cameraRef.current.stopRecording();
      setIsCapturing(false);
    }
    if (!isHolding) {
      capturePhoto();
    }
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn,
  );

  React.useEffect(() => {
    return () => {
      backHandler.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <RNCamera ref={cameraRef} type={type} style={styles.preview} />
      <View style={styles.topBtns}>
        <HStack justifyContent="space-between" alignItems="center">
          <IconButton
            _pressed={{ bg: 'rgba(50,118,226, 0.3)' }}
            onPress={handleBackBtn}
            icon={<Icon as={() => LeftArrowIcon('#fff')} name="emoji-happy" />}
            borderRadius="full"
          />
          <Text color="#fff">
            {millisToMinutesAndSeconds(captureTime * 1000)}
          </Text>
          <Text color="#fff">Right</Text>
        </HStack>
      </View>
      <View style={styles.bottomBtns}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text color="#fff">Left</Text>
          <View style={styles.captureContainer}>
            {isCapturing ? (
              <Spinner size="lg" color={'#3276E2'} />
            ) : (
              <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.captureBtn}
              />
            )}
          </View>
          <Text color="#fff">Right</Text>
        </HStack>
      </View>
    </View>
  );
};

export default Camera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'black',
    position: 'relative',
  },
  topBtns: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  bottomBtns: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
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
});
