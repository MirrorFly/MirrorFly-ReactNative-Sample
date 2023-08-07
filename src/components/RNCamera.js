import {
  HStack,
  Icon,
  IconButton,
  Pressable,
  Spinner,
  Text,
} from 'native-base';
import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Image,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { LeftArrowIcon } from 'common/Icons';
import { CHATCONVERSATION } from '../constant';
import { millisToMinutesAndSeconds } from '../Helper/Chat/Utility';
import RNFS from 'react-native-fs';
import { mediaObjContructor } from '../common/utils';
import Video from 'react-native-video';
import flashOnIcon from 'assets/ic_flash_on.png';
import flashOffIcon from 'assets/ic_flash_off.png';
import flashAutoIcon from 'assets/ic_flash_auto.png';
import flipCameraIcon from 'assets/ic_flip_camera_android.png';

const Camera = props => {
  const { setLocalNav = () => {}, setSelectedImages } = props;
  const cameraRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const [data, setData] = useState();
  const [videoData, setVideoData] = useState();
  const [captureTime, setCaptureTime] = useState(0);
  const [type, setType] = useState(RNCamera.Constants.Type.back);
  const [flash, setFlash] = useState(RNCamera.Constants.FlashMode.off);
  const [flashIcon, setFlashIcon] = useState(flashOffIcon);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  const handleBackBtn = () => {
    setLocalNav(CHATCONVERSATION);
  };

  React.useEffect(() => {
    if (isHolding) {
      startRecording();
    }
  }, [isHolding]);

  React.useEffect(() => {
    if (data) {
      setSelectedImages([data]);
      setLocalNav('CameraPickView');
    }
  }, [data]);

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn,
  );

  React.useEffect(() => {
    return () => {
      backHandler.remove();
    };
  }, []);

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
      if (cameraRef.current) {
        const photoData = await cameraRef.current.takePictureAsync();
        const fileInfo = await RNFS.stat(photoData.uri);
        const combinedData = {
          ...fileInfo,
          ...photoData,
          type: 'image',
        };
        if (
          combinedData.pictureOrientation === 1 ||
          combinedData.pictureOrientation === 2
        ) {
          const temp = combinedData.width;
          combinedData.width = combinedData.height;
          combinedData.height = temp;
        }
        const imageFile = {
          caption: '',
          fileDetails: mediaObjContructor('RN_CAMERA', combinedData),
        };
        setData(imageFile);
      } else {
        console.warn('Camera ref is not ready');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const startRecording = async () => {
    try {
      if (cameraRef.current) {
        recordingIntervalRef.current = setInterval(() => {
          setCaptureTime(prevTime => prevTime + 1);
        }, 1000);
        const videoInfo = await cameraRef.current.recordAsync();
        setVideoData(videoInfo);
      }
    } catch (error) {
      console.log('startRecording', error);
    }
  };

  const handlePressIn = () => {
    setTimeout(() => {
      setIsHolding(true);
    }, 1500);
  };

  const handlePressOut = () => {
    if (isHolding) {
      cameraRef.current.stopRecording();
      setIsCapturing(false);
    }
    if (!isHolding) {
      capturePhoto();
    }
  };

  const onLoad = onLoadData => {
    const { naturalSize: { width, height } = {}, duration } = onLoadData;
    const combinedData = {
      ...onLoadData,
      ...videoData,
      width,
      height,
      duration: duration * 1000,
      type: 'video',
    };
    console.log(combinedData, 'combinedData');
    const imageFile = {
      caption: '',
      fileDetails: mediaObjContructor('RN_CAMERA', combinedData),
    };
    setData(imageFile);
  };

  const toggleFlashMode = () => {
    setFlash(prevFlash => {
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

  return (
    <View style={styles.container}>
      <RNCamera
        flashMode={flash}
        ref={cameraRef}
        type={type}
        style={styles.preview}
      />
      <View style={styles.topBtns}>
        <HStack justifyContent="space-between" alignItems="center">
          <IconButton
            _pressed={{ bg: 'rgba(50,118,226, 0.3)' }}
            onPress={handleBackBtn}
            icon={<Icon as={() => LeftArrowIcon('#fff')} name="emoji-happy" />}
            borderRadius="full"
          />
          {captureTime > 0 && (
            <Text color="#fff">
              {millisToMinutesAndSeconds(captureTime * 1000)}
            </Text>
          )}
        </HStack>
      </View>
      <View style={styles.bottomBtns}>
        <HStack px="3" justifyContent="space-between" alignItems="center">
          <Pressable onPress={toggleFlashMode}>
            <Image
              alt="flash-icon"
              style={styles.flashIcon}
              source={flashIcon}
            />
          </Pressable>
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.captureContainer}>
            {isCapturing ? (
              <Spinner size="lg" color={'#3276E2'} />
            ) : (
              isHolding && <View style={styles.captureBtn} />
            )}
          </TouchableOpacity>
          <Pressable onPress={flipCamera}>
            <Image
              alt="flip-icon"
              style={styles.flashIcon}
              source={flipCameraIcon}
            />
          </Pressable>
        </HStack>
      </View>
      <View>
        {videoData?.uri && (
          <View style={styles.video}>
            <Video source={{ uri: videoData?.uri }} onLoad={onLoad} />
          </View>
        )}
      </View>
    </View>
  );
};

export default Camera;

const styles = StyleSheet.create({
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
  flashIcon: {
    width: 25,
    height: 25,
  },
});
