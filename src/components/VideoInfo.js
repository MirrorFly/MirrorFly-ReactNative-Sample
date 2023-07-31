import {  Text, View, Dimensions, Pressable,Share } from 'react-native';
import React from 'react';
import Video from 'react-native-video';
 import  { PLAYER_STATES } from 'react-native-media-controls';
import Orientation from 'react-native-orientation-locker';
import { BackArrowIcon, ShareIcon } from '../common/Icons';
import { useSelector } from 'react-redux';

const VideoInfo = (props) => {
    const SingleSelectedImage = useSelector((state) => state.chatSelectedMedia.data.media);
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const videoPlayer = React.useRef(null);
    const [currentTime, setCurrentTime] = React.useState(0);
     const [duration, setDuration] = React.useState(0);
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [paused, setPaused] = React.useState(false);
    const [
        playerState, setPlayerState
    ] = React.useState(PLAYER_STATES.PLAYING);
 
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
        setIsLoading(false);
    };

    const openBottomSheet = () => {
        Share.share({
         message:
           'hd.jpg',
       })
     };
    const onLoadStart = (data) => setIsLoading(true);

    const onEnd = () => setPlayerState(PLAYER_STATES.ENDED);

   
    React.useEffect(() => {
        const orientationChangeHandler = (orientation) => {
           
            setIsFullScreen(orientation === 'LANDSCAPE');
        };

        Orientation.addOrientationListener(orientationChangeHandler);

        return () => {
            Orientation.removeOrientationListener(orientationChangeHandler);
        };
    }, []);

    const externalVideoSource = {
       uri: SingleSelectedImage.local_path,
      
    };
   
    const onSeeking = (currentTime) => setCurrentTime(currentTime);
    const handleBackBtn =()=>{
        props.handleBackBtn();
    }
    
    return (
        <View style={{ flex: 1 }}>
            
            <View style={{ flexDirection: "row", padding: 12, alignItems: "center", justifyContent: 'space-between', backgroundColor: "#F2F2F2", width: "100%",borderBottomColor:"#0000001A",borderBottomWidth:1 }}>
               <View style={{flexDirection: 'row', alignItems: 'center'}} >
                    <Pressable onPress={handleBackBtn} style={{ marginLeft: 8 }}>
                        <BackArrowIcon />

                    </Pressable>
                    <Text style={{ color: "#000", fontSize: 20, fontWeight: "500", marginLeft: 20 }}>Sent Media</Text>
                </View>
      <Pressable onPress={openBottomSheet}>
      <ShareIcon width="24" height="24" />
      </Pressable>
                
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
               <Video 
                        onEnd={onEnd}
                        onLoad={onLoad}
                        controls={true}
                        onLoadStart={onLoadStart}
                        onProgress={onProgress}
                        paused={paused}
                        ref={videoPlayer}
                        resizeMode={"contain"}
                        onFullScreen={true}
                        source={externalVideoSource}
                        style={{
                            width: isFullScreen ? screenWidth : "100%",
                            height: isFullScreen ? screenHeight : "100%",
                            justifyContent: 'center'
                        }}
                        volume={100}
                        muted={false}
                       
                    />
            </View>
        </View>
    )
}

export default VideoInfo
