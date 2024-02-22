import Video from 'react-native-video';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import MediaControls, { PLAYER_STATES } from './media-controls';
import { View } from 'native-base';
import RNConvertPhAsset from 'react-native-convert-ph-asset';
import { useAppState } from '../../hooks';

const VideoPlayer = props => {
  const { item: { fileDetails = {} } = {} } = props;
  const { uri } = fileDetails;
  const videoPlayer = React.useRef(null);
  const [videoUri, setVideoUri] = React.useState('');
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [paused, setPaused] = React.useState(true);
  const [playerState, setPlayerState] = React.useState(PLAYER_STATES.PAUSED);
  const [onEnded, setOnEnded] = React.useState(false);

  const appState = useAppState();

  React.useEffect(() => {
    if (appState) {
      if (!onEnded) {
        setPlayerState(PLAYER_STATES.PAUSED);
        setPaused(true);
      } else {
        setPaused(true);
      }
    }
  }, [appState]);

  /**  const calculate = () => {
        let data = Math.max(width, height) / Math.min(width, height);
        setDimention(Math.round(data * screenWidth))
    }

    React.useEffect(() => {
        calculate()
    }, [width, height]) */

  const onSeek = seek => {
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
    if (!isLoading && playerState !== PLAYER_STATES.ENDED) {
      setCurrentTime(data.currentTime);
    }
  };

  const onLoad = data => {
    setDuration(data.duration);
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

  const handleLayout = e => {
    setIsLoading(false);
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
            console.log(err);
          });
      } else {
        setVideoUri(uri);
      }
    } else {
      setVideoUri(uri);
    }
  }, []);

  return (
    <View style={{ flex: 1 }} onLayout={handleLayout}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {Boolean(videoUri) && (
          <Video
            ignoreSilentSwitch={'ignore'}
            onEnd={onEnd}
            onLoad={onLoad}
            // onLoadStart={onLoadStart}
            onProgress={onProgress}
            paused={paused}
            controls={false}
            poster={uri}
            posterResizeMode={'contain'}
            ref={videoPlayer}
            resizeMode={'contain'}
            source={{ uri: videoUri }}
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
            }}
            volume={100}
            muted={false}
          />
        )}
      </View>
      {!isLoading && (
        // <View
        //   position={'absolute'}
        //   top={mediaControlTop}
        //   bottom={0}
        //   left={0}
        //   right={0}
        //   justifyContent={'center'}>
        <MediaControls
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
        // </View>
      )}
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
});
