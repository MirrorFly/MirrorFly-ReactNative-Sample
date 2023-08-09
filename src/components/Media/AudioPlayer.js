import React, { createRef } from 'react';
import { Text } from 'react-native';
import RNSlider from './RNSlider';
import Sound from 'react-native-sound';
import style from './styles';
import { Icon, IconButton, View } from 'native-base';
import { AudioPause, AudioPlay } from '../../common/Icons';
import { millisToMinutesAndSeconds } from '../../Helper/Chat/Utility';
import { useAppState } from '../../hooks';

const PLAY_STATE_PAUSED = 'paused';
const PLAY_STATE_PLAYING = 'playing';
const PLAY_STATE_LOADING = 'loading';
let soundRef = createRef();

const AudioPlayer = props => {
  const { media, msgId, uri } = props;
  const [playState, setPlayState] = React.useState(PLAY_STATE_PAUSED);
  const [playSeconds, setPlaySeconds] = React.useState(0);
  let sound = React.useRef(null);
  let playStateRef = React.useRef(null);
  let sliderEditing = React.useRef(false);
  const appState = useAppState();

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
    let m = parseInt(seconds / 60, 10);
    let s = parseInt(seconds % 60, 10);
    return `${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
  };

  const playComplete = success => {
    if (sound.current && success) {
      setPlayState(PLAY_STATE_PAUSED);
      setPlaySeconds(0);
      sound.current.setCurrentTime(0);
    }
  };

  const stopSound = () => {
    soundRef.current.stop();
    soundRef.current.setCurrentTime(0); // Optional: Set the sound's position back to the beginning
  };

  const currentTimeString = getAudioTimeString(playSeconds);
  const durationString = millisToMinutesAndSeconds(media.duration);

  return (
    <View style={style.audioControlContainer}>
      <View px={1} flexDirection={'row'}>
        {playState === PLAY_STATE_PLAYING ? (
          <IconButton
            style={{ width: 30 }}
            onPress={pauseSound}
            _pressed={{ bg: null }}
            icon={<Icon as={AudioPause} name="emoji-happy" />}
            borderRadius="full"
          />
        ) : (
          <IconButton
            style={{ width: 30 }}
            onPress={playSound}
            _pressed={{ bg: null }}
            icon={<Icon as={AudioPlay} name="emoji-happy" />}
            borderRadius="full"
          />
        )}
        <View px={1} style={style.sliderView}>
          <RNSlider
            onTouchStart={onSliderEditStart}
            onTouchEnd={onSliderEditEnd}
            onSlidingComplete={onSliderEditing}
            value={playSeconds}
            maximumValue={Math.floor(media.duration / 1000)}
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
