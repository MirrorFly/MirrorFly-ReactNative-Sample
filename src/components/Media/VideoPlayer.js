import Video from 'react-native-video';
import React, { useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import MediaControls, { PLAYER_STATES } from 'react-native-media-controls';
import { View } from 'native-base';
import RNConvertPhAsset from 'react-native-convert-ph-asset';

const screenWidth = Dimensions.get('window').width;

const VideoPlayer = (props) => {
    const { item: { fileDetails = {} } = {} } = props
    const { image: { uri, height, width } } = fileDetails
    const videoPlayer = React.useRef(null);
    const [videoUri, setVideoUri] = useState('')
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [paused, setPaused] = useState(true);
    const [playerState, setPlayerState] = useState(PLAYER_STATES.PAUSED);
    const [dimention, setDimention] = React.useState(0)
    const [mediaControlTop, setMediaControlTop] = React.useState(0)

    /**  const calculate = () => {
        let data = Math.max(width, height) / Math.min(width, height);
        setDimention(Math.round(data * screenWidth))
    }

    React.useEffect(() => {
        calculate()
    }, [width, height]) */

    const onSeek = (seek) => {
        videoPlayer.current.seek(seek);
    };

    const onPaused = (playerState) => {
        setPaused(!paused);
        setPlayerState(playerState);
    };

    const onReplay = () => {
        setPlayerState(PLAYER_STATES.PLAYING);
        videoPlayer.current.seek(0);
    };

    const onProgress = (data) => {
        if (!isLoading && playerState !== PLAYER_STATES.ENDED) {
            setCurrentTime(data.currentTime);
        }
    };

    const onLoad = (data) => {
        setDuration(data.duration);
    };

    const onLoadStart = (data) => setIsLoading(true);

    const onEnd = () => setPlayerState(PLAYER_STATES.ENDED);

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

    const onSeeking = (currentTime) => setCurrentTime(currentTime);

    const handleLayout = (e) => {
        const { width: _width, height: _height } = e.nativeEvent.layout;
        let ratio = height / width;
        const dimension = Math.round(ratio * screenWidth)
        const top = (_height - dimension) / 2
        setMediaControlTop(isNaN(top) ? 0 : top);
        setDimention(Platform.OS == 'ios' && dimension > _height ? dimension - 30 : dimension);
        setIsLoading(false);
    }

    React.useLayoutEffect(() => {
        if (Platform.OS == 'ios')
            RNConvertPhAsset.convertVideoFromUrl({
                url: uri,
                convertTo: 'mov',
                quality: 'original'
            }).then((response) => {
                setVideoUri(response.path)
            }).catch((err) => {
                console.log(err)
            });
        else setVideoUri(uri)
    }, [])

    return (
        <View style={{ flex: 1 }} onLayout={handleLayout}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
                {videoUri && <Video
                    onEnd={onEnd}
                    onLoad={onLoad}
                    // onLoadStart={onLoadStart}
                    onProgress={onProgress}
                    paused={paused}
                    controls={false}
                    poster={uri}
                    posterResizeMode={"contain"}
                    ref={videoPlayer}
                    resizeMode={"contain"}
                    source={{ uri: videoUri }}
                    style={{
                        width: "100%",
                        height: "100%",
                        justifyContent: 'center'
                    }}
                    volume={100}
                    muted={false}
                />}
            </View>
            {!isLoading &&
                <View position={'absolute'} top={mediaControlTop} bottom={0} left={0} right={0} justifyContent={'center'}>
                    <MediaControls
                        duration={duration}
                        isLoading={isLoading}
                        mainColor="#333"
                        onPaused={onPaused}
                        onReplay={onReplay}
                        onSeek={onSeek}
                        onSeeking={onSeeking}
                        playerState={playerState}
                        progress={currentTime}
                        containerStyle={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,.5)',
                            height: dimention,
                        }}
                    />
                </View>}
        </View>
    )
}

export default React.memo(VideoPlayer)