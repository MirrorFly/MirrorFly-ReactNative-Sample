import React from 'react';
import { View } from 'react-native';
import Sound from 'react-native-sound';
import IconButton from '../common/IconButton';
import { AudioPause, AudioPlay } from '../common/Icons';
import Text from '../common/Text';
import { useAppState } from '../common/hooks';
import { stopAudioRecord } from '../components/ChatInput';
import { millisToHoursMinutesAndSeconds } from '../helpers/chatHelpers';
import { mediaStatusConstants } from '../helpers/constants';
import commonStyles from '../styles/commonStyles';
import RNSlider from './RNSlider';
import style from './styles';
import { useFocusEffect } from '@react-navigation/native';

const PLAY_STATE_PAUSED = 'paused';
const PLAY_STATE_PLAYING = 'playing';
const PLAY_STATE_LOADING = 'loading';
export const soundRef = React.createRef();
export const pauseAudio = () => {
   soundRef?.current?.pause?.();
   soundRef?.current?.updateState?.();
};

const AudioPlayer = props => {
   const { media, msgId, uri, mediaStatus } = props;
   const [playState, setPlayState] = React.useState(PLAY_STATE_PAUSED);
   const [playSeconds, setPlaySeconds] = React.useState(0);
   let sound = React.useRef(null);
   let playStateRef = React.useRef(null);
   let sliderEditing = React.useRef(false);
   const appState = useAppState();

   useFocusEffect(
      React.useCallback(() => {
         return () => {
            pauseAudio();
         };
      }, []),
   );

   React.useEffect(() => {
      let timeout = setInterval(() => {
         if (
            sound.current &&
            sound?.current?.isLoaded() &&
            playStateRef.current === PLAY_STATE_PLAYING &&
            !sliderEditing.current
         ) {
            sound.current.getCurrentTime(seconds => {
               setPlaySeconds(seconds);
            });
         }
      }, 500);

      return () => {
         if (sound.current) {
            sound.current.release();
         }
         if (timeout) {
            clearInterval(timeout);
         }
      };
   }, []);

   React.useEffect(() => {
      if (!appState) {
         if (playState === PLAY_STATE_PLAYING) {
            pauseSound();
         }
      }
   }, [appState]);

   React.useEffect(() => {
      if (sound.current && playState === PLAY_STATE_PLAYING) {
         if (soundRef.current && soundRef.current.msgId !== msgId) {
            soundRef.current.pause();
            soundRef?.current?.updateState?.();
         }
         soundRef.current = sound.current;
         soundRef.current.msgId = msgId;
         soundRef.current.updateState = () => {
            setPlayState(PLAY_STATE_PAUSED);
         };
         sound.current.play(playComplete);
      } else {
         const filepath = uri;
         if (playState === PLAY_STATE_LOADING && filepath) {
            Sound.setCategory('Playback');
            sound.current = new Sound(filepath, '', error => {
               if (error) {
                  console.log(error, 'Play Error');
                  setPlayState(PLAY_STATE_PAUSED);
               } else {
                  setPlayState(PLAY_STATE_PLAYING);
                  playStateRef.current = PLAY_STATE_PLAYING;
                  setTimeout(() => {
                     soundRef.current = sound.current;
                     soundRef.current.msgId = msgId;
                     soundRef.current.updateState = () => {
                        setPlayState(PLAY_STATE_PAUSED);
                     };
                     sound.current.setCurrentTime(playSeconds);
                     sound.current.play(playComplete);
                  });
               }
            });
         }
      }
   }, [playState]);

   const playSound = () => {
      stopAudioRecord();
      try {
         if (sound.current) {
            setPlayState(PLAY_STATE_PLAYING);
         } else {
            setPlayState(PLAY_STATE_LOADING);
         }
      } catch (error) {
         console.log(error, 'Play Error');
      }
   };

   const onSliderEditStart = value => {
      sliderEditing.current = true;
   };

   const onSliderEditEnd = () => {
      sliderEditing.current = false;
   };

   const onSliderEditing = value => {
      setPlaySeconds(value);
      if (sound.current) {
         sound.current.setCurrentTime(value);
      }
   };

   const pauseSound = () => {
      if (sound.current) {
         sound.current.pause();
      }
      setPlayState(PLAY_STATE_PAUSED);
   };

   const getAudioTimeString = seconds => {
      let h = Math.floor(seconds / 3600);
      let m = Math.floor((seconds % 3600) / 60);
      let s = Math.floor(seconds % 60);

      return (h > 0 ? (h < 10 ? `0${h}` : h) + ':' : '') + (m < 10 ? `0${m}` : m) + ':' + (s < 10 ? `0${s}` : s);
   };

   const playComplete = success => {
      if (sound.current && success) {
         setPlayState(PLAY_STATE_PAUSED);
         setPlaySeconds(0);
         sound.current.setCurrentTime(0);
      }
   };

   /** const stopSound = () => {
    sound.current?.stop();
    sound.current?.setCurrentTime(0); // Optional: Set the sound's position back to the beginning
  };
   */

   const currentTimeString = getAudioTimeString(playSeconds);
   const durationString = millisToHoursMinutesAndSeconds(media.duration);

   const sliderDisable = React.useMemo(() => {
      return mediaStatus !== mediaStatusConstants.LOADED;
   }, [mediaStatus]);

   return (
      <View style={style.audioControlContainer}>
         <View style={commonStyles.hstack}>
            {mediaStatus === mediaStatusConstants.LOADED && (
               <>
                  {playState === PLAY_STATE_PLAYING ? (
                     <IconButton pressedStyle={{}} onPress={pauseSound}>
                        <AudioPause />
                     </IconButton>
                  ) : (
                     <IconButton pressedStyle={{}} onPress={playSound}>
                        <AudioPlay />
                     </IconButton>
                  )}
               </>
            )}
            <View px={1} style={style.sliderView}>
               <RNSlider
                  onTouchStart={onSliderEditStart}
                  onTouchEnd={onSliderEditEnd}
                  onSlidingComplete={onSliderEditing}
                  value={playSeconds}
                  disabled={sliderDisable}
                  maximumValue={Math.floor(media.duration / 1000) || 0}
                  maximumTrackTintColor="#AFB8D0"
                  minimumTrackTintColor="#FFFFFF"
                  trackStyle={style.trackStyle}
                  thumbStyle={style.thumbStyle}
                  step={1}
                  allowTouchTrack={true}
                  thumbTintColor="#7285B5"
                  style={style.sliderStyle}
               />
               <Text style={style.audioControlTimeContainer}>
                  {playSeconds !== 0 ? currentTimeString : durationString}
               </Text>
            </View>
         </View>
      </View>
   );
};

export default AudioPlayer;
