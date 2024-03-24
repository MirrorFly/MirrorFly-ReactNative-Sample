import React from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import RNConvertPhAsset from 'react-native-convert-ph-asset';
import Video from 'react-native-video';
import { getThumbBase64URL } from '../../Helper/Chat/Utility';
import commonStyles from '../../common/commonStyles';
import { useAppState } from '../../hooks';
import { mflog } from '../../uikitHelpers/uikitMethods';
import MediaControls, { PLAYER_STATES } from './media-controls';

const VideoPlayer = props => {
   const {
      forcePause: { mediaForcePause = false, setMediaForcePause = () => {} } = {},
      audioOnly = false,
      item: { thumbImage = '', fileDetails = {} } = {},
   } = props;

   const { uri } = fileDetails;
   const videoPlayer = React.useRef(null);
   const [volume, setVolume] = React.useState(100);
   const [videoUri, setVideoUri] = React.useState('');
   const [currentTime, setCurrentTime] = React.useState(fileDetails.duration || 0);
   const [duration, setDuration] = React.useState(0);
   const [isLoading, setIsLoading] = React.useState(true);
   const [paused, setPaused] = React.useState(true);
   const [playerState, setPlayerState] = React.useState(PLAYER_STATES.PAUSED);
   const [onEnded, setOnEnded] = React.useState(false);
   const appState = useAppState();

   React.useEffect(() => {
      return () => handleForcePause();
   }, []);

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
      if (mediaForcePause) {
         handleForcePause();
      }
   }, [mediaForcePause]);

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
      handlePause();
      setVolume(0);
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
      setMediaForcePause?.(false);
      setVolume(100);
   };

   const onReplay = () => {
      videoPlayer?.current.seek(0);
      setCurrentTime(0);
      setOnEnded(false);
      setVolume(100);
      if (Platform.OS === 'android') {
         setPlayerState(PLAYER_STATES.PAUSED);
         setPaused(true);
         setTimeout(() => {
            setPlayerState(PLAYER_STATES.PLAYING);
            setPaused(false);
            setMediaForcePause?.(false);
         });
      } else {
         setPlayerState(PLAYER_STATES.PLAYING);
         setPaused(false);
         setMediaForcePause?.(false);
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
      if (onEnded) {
         setPlayerState(PLAYER_STATES.PAUSED);
         setPaused(true);
      }
   };

   return (
      <View style={{ flex: 1 }}>
         <View style={{ flex: 1, justifyContent: 'center' }}>
            <Video
               audioOnly={audioOnly}
               ignoreSilentSwitch={'ignore'}
               onEnd={onEnd}
               onLoad={onLoad}
               onProgress={onProgress}
               paused={paused}
               controls={false}
               poster={uri}
               posterResizeMode={'contain'}
               ref={videoPlayer}
               resizeMode={'contain'}
               source={{ uri: videoUri }}
               style={[styles.videoContainer, { display: mediaForcePause ? 'none' : 'flex' }]}
               volume={volume}
               muted={false}
            />
            <Image
               style={[commonStyles.flex1, commonStyles.resizeContain, { display: mediaForcePause ? 'flex' : 'none' }]}
               source={{ uri: getThumbBase64URL(thumbImage) }}
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
