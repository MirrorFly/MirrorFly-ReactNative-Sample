import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import RNConvertPhAsset from 'react-native-convert-ph-asset';
import Video from 'react-native-video';
import IconButton from '../../common/IconButton';
import { BackArrowIcon } from '../../common/Icons';
import commonStyles from '../../common/commonStyles';
import { useAppState } from '../../hooks';
import { mflog } from '../../uikitHelpers/uikitMethods';
import MediaControls, { PLAYER_STATES } from './media-controls';

const VideoPlayer = () => {
   const {
      params: {
         item: { fileDetails = {} },
         audioOnly = false,
      },
   } = useRoute();
   const navigation = useNavigation();
   const { uri } = fileDetails;
   const videoPlayer = React.useRef(null);
   const [videoUri, setVideoUri] = React.useState(uri);
   const [currentTime, setCurrentTime] = React.useState(0);
   const [duration, setDuration] = React.useState(0);
   const [isLoading, setIsLoading] = React.useState(true);
   const [paused, setPaused] = React.useState(true);
   const [playerState, setPlayerState] = React.useState(PLAYER_STATES.PAUSED);
   const [onEnded, setOnEnded] = React.useState(false);
   const appState = useAppState();

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
         handleForcePause();
      };
   }, []);

   const handleBackBtn = () => {
      navigation.goBack();
      return true;
   };

   React.useLayoutEffect(() => {
      if (Platform.OS === 'ios') {
         if (uri.includes('ph://')) {
            RNConvertPhAsset.convertVideoFromUrl({
               url: uri,
               convertTo: 'mov',
               quality: 'original',
            })
               .then(response => {
                  setVideoUri(response.path);
               })
               .catch(err => {
                  mflog(err);
               });
         } else {
            setVideoUri(uri);
         }
      } else {
         setVideoUri(uri);
      }
   }, []);

   React.useEffect(() => {
      if (appState) {
         if (!onEnded) {
            handlePause();
         } else {
            setPaused(true);
         }
      }
   }, [appState]);

   const handleForcePause = () => {
      videoPlayer?.current?.seek?.(0);
      setCurrentTime(0);
      setPaused(!paused);
   };

   const handlePause = () => {
      setPlayerState(PLAYER_STATES.PAUSED);
      setPaused(true);
   };

   /**  const calculate = () => {
        let data = Math.max(width, height) / Math.min(width, height);
        setDimention(Math.round(data * screenWidth))
    }

    React.useEffect(() => {
        calculate()
    }, [width, height]) */

   const onSeek = seek => {
      if (playerState === PLAYER_STATES.PLAYING) {
         setPaused(true); // Pause the video player before seeking
         setPlayerState(PLAYER_STATES.PAUSED);
      }
      videoPlayer.current.seek(seek);
      setOnEnded(false);
   };

   const onPaused = state => {
      setPaused(!paused);
      setPlayerState(state);
   };

   const onReplay = () => {
      videoPlayer?.current.seek(0);
      setCurrentTime(0);
      setOnEnded(false);
      if (Platform.OS === 'android') {
         setPlayerState(PLAYER_STATES.PAUSED);
         setPaused(true);
         setTimeout(() => {
            setPlayerState(PLAYER_STATES.PLAYING);
            setPaused(false);
         });
      } else {
         setPlayerState(PLAYER_STATES.PLAYING);
         setPaused(false);
      }
   };

   const onProgress = data => {
      if (!isLoading && playerState === PLAYER_STATES.PLAYING) {
         setCurrentTime(data.currentTime);
      }
   };

   const onLoad = data => {
      setDuration(data.duration);
      setIsLoading(false);
   };

   /**   const onLoadStart = data => setIsLoading(true);
    */
   const onEnd = () => {
      setPlayerState(PLAYER_STATES.ENDED);
      setOnEnded(true);
   };

   /**
        const onError = (error) => alert('Oh! ', error);
        const exitFullScreen = () => {
            alert('Exit full screen');
        };

        const enterFullScreen = () => { };
        const onFullScreen = () => {
          // setIsFullScreen(isFullScreen);
          // if (screenType == 'content') setScreenType('cover');
          // else setScreenType('content');
      }; */

   const onSeeking = time => {
      setCurrentTime(time);
      setPlayerState(PLAYER_STATES.PAUSED);
      setPaused(true);
   };

   return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
         <IconButton
            onPress={handleBackBtn}
            pressedStyle={commonStyles.pressedBg_2}
            containerStyle={[{ position: 'absolute', top: 10, zIndex: 1, left: 5 }]}>
            <BackArrowIcon color={'#fff'} />
         </IconButton>
         <View style={{ flex: 1, justifyContent: 'center' }}>
            <Video
               audioOnly={audioOnly}
               ignoreSilentSwitch={'ignore'}
               onEnd={onEnd}
               onLoad={onLoad}
               onProgress={onProgress}
               paused={paused}
               controls={false}
               poster={videoUri}
               posterResizeMode={'contain'}
               ref={videoPlayer}
               resizeMode={'contain'}
               source={{ uri: videoUri }}
               style={[styles.videoContainer]}
               volume={100}
               muted={false}
            />
         </View>
         <MediaControls
            fadeOutDisable={audioOnly || playerState === PLAYER_STATES.PAUSED || playerState === PLAYER_STATES.ENDED}
            duration={duration}
            isLoading={isLoading}
            mainColor="#333"
            onPaused={onPaused}
            onReplay={onReplay}
            onSeek={onSeek}
            onSeeking={onSeeking}
            fadeOutDelay={1100}
            playerState={playerState}
            progress={currentTime}
            containerStyle={styles.mediaControlStyle}
         />
      </View>
   );
};

export default React.memo(VideoPlayer);

const styles = StyleSheet.create({
   mediaControlStyle: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.1)',
   },
   videoContainer: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
   },
});
