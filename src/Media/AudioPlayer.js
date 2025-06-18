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
import PropTypes from 'prop-types';

const PLAY_STATE_PAUSED = 'paused';
const PLAY_STATE_PLAYING = 'playing';
const PLAY_STATE_LOADING = 'loading';
export const soundRef = React.createRef();
export const pauseAudio = () => {
   soundRef?.current?.pause?.();
   soundRef?.current?.updateState?.();
};

const propTypes = {
   mediaStatus: PropTypes.string,
   uri: PropTypes.string,
   msgId: PropTypes.string,
   media: PropTypes.shape({
      duration: PropTypes.number, // Ensures media.duration is a number
   }),
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
         if (sound?.current?.isLoaded() && playStateRef.current === PLAY_STATE_PLAYING && !sliderEditing.current) { //NOSONAR
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
      const initializeSound = filepath => {
         Sound.setCategory('Playback');
         sound.current = new Sound(filepath, '', error => {
            if (error) {
               console.log(error, 'Play Error');
               setPlayState(PLAY_STATE_PAUSED);
            } else {
               handleSoundLoaded();
            }
         });
      };

      const handleSoundLoaded = () => {
         setPlayState(PLAY_STATE_PLAYING);
         playStateRef.current = PLAY_STATE_PLAYING;
         setTimeout(() => {
            configureSoundRef();
            sound.current.setCurrentTime(playSeconds);
            sound.current.play(playComplete);
         });
      };

      const configureSoundRef = () => {
         soundRef.current = sound.current;
         soundRef.current.msgId = msgId;
         soundRef.current.updateState = () => {
            setPlayState(PLAY_STATE_PAUSED);
         };
      };

      const handlePlayStatePlaying = () => {
         if (soundRef.current && soundRef.current.msgId !== msgId) {
            soundRef.current.pause();
            soundRef?.current?.updateState?.();
         }
         configureSoundRef();
         sound.current.play(playComplete);
      };

      if (sound.current && playState === PLAY_STATE_PLAYING) {
         handlePlayStatePlaying();
      } else if (playState === PLAY_STATE_LOADING && uri) {
         initializeSound(uri);
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

   const getAudioTimeString = totalSeconds => {
      let h = Math.floor(totalSeconds / 3600);
      let m = Math.floor((totalSeconds % 3600) / 60);
      let s = Math.floor(totalSeconds % 60);

      let hours = '';
      if (h > 0) {
         hours = h < 10 ? `0${h}` : h;
         hours += ':';
      }
      let minutes = m < 10 ? `0${m}` : m;
      let seconds = s < 10 ? `0${s}` : s;

      minutes += ':';

      return hours + minutes + seconds;
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

AudioPlayer.propTypes = propTypes;

export default AudioPlayer;
