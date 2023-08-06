import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Slider } from 'react-native-elements';
import Sound from 'react-native-sound';
import style from './styles';

const PLAY_STATE_PAUSED = 'paused';
const PLAY_STATE_PLAYING = 'playing';
const PLAY_STATE_LOADING = 'loading';
const VOLUME_STATE_UNMUTE = 'unmute';
const VOLUME_STATE_MUTE = 'mute';

const AudioPlayer = () => {
  const [playState, setPlayState] = React.useState(PLAY_STATE_PAUSED);
  const [playSeconds, setPlaySeconds] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  let sliderEditing = false;
  let sound = React.useRef(null);
  const [volumeState, setVolumeState] = React.useState(VOLUME_STATE_UNMUTE);

  React.useEffect(() => {
    Sound.setCategory('Playback'); // Set the audio category for proper handling of the sound in the app
    Sound.setActive(true); // Enable audio background mode (if needed)

    // Initialize the sound
    sound.current = new Sound(
      'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.log('Failed to load the sound:', error);
        }
      },
    );

    // Release the sound when the component unmounts
    return () => {
      if (sound.current) {
        sound.current.release();
      }
    };
  }, []);

  const playSound = () => {
    // Play the sound
    sound.current.play(success => {
      if (success) {
        console.log('Sound played successfully');
      } else {
        console.log('Sound playback failed');
      }
    });
  };

  const pauseSound = () => {
    // Pause the sound
    sound.current.pause();
  };
  const getAudioTimeString = seconds => {
    let m = parseInt(seconds / 60, 10);
    let s = parseInt(seconds % 60, 10);

    return `${m}:${s < 10 ? `0${s}` : s}`;
  };

  const stopSound = () => {
    // Stop the sound and reset it to the beginning
    sound.current.stop();
    sound.current.setCurrentTime(0); // Optional: Set the sound's position back to the beginning
  };
  console.log(sound.current, '2121');
  const currentTimeString = getAudioTimeString(playSeconds);
  const durationString = getAudioTimeString(duration);
  return (
    // <View>
    //   <Text>React Native Sound Player</Text>
    //   <TouchableOpacity onPress={playSound}>
    //     <Text>Play Sound</Text>
    //   </TouchableOpacity>
    //   <TouchableOpacity onPress={pauseSound}>
    //     <Text>Pause Sound</Text>
    //   </TouchableOpacity>
    //   <TouchableOpacity onPress={stopSound}>
    //     <Text>Stop Sound</Text>
    //   </TouchableOpacity>
    // </View>
    <View style={style.audioControlContainer}>
      {playState === PLAY_STATE_PLAYING && (
        <TouchableOpacity onPress={pauseSound}>
          <Icon name="pause" size={20} color="#000000" />
        </TouchableOpacity>
      )}
      {playState === PLAY_STATE_PAUSED && (
        <TouchableOpacity onPress={playSound}>
          <Icon name="play-arrow" size={20} color="#000000" />
        </TouchableOpacity>
      )}
      {playState === PLAY_STATE_LOADING && (
        <ActivityIndicator color="#000000" size="small" />
      )}
      <View style={style.audioControlTimeContainer}>
        <Text style={style.audioControlTimeText}>{currentTimeString}</Text>
        <Text style={style.audioControlTimeText}>
          {'/'}
          {durationString}
        </Text>
      </View>
      {/* <Slider
        onTouchStart={this.onSliderEditStart}
        onTouchEnd={this.onSliderEditEnd}
        onSlidingComplete={this.onSliderEditing}
        value={this.state.playSeconds}
        maximumValue={this.state.duration}
        maximumTrackTintColor="#595a5a"
        minimumTrackTintColor="black"
        step={1}
        allowTouchTrack
        thumbTouchSize={style.thumbTouchSize}
        thumbStyle={style.thumbStyle}
        style={style.sliderStyle}
      /> */}
      {/* {volumeState === VOLUME_STATE_MUTE && (
        <TouchableOpacity onPress={this.unmute}>
          <Icon name="volume-up" size={20} color="#000000" />
        </TouchableOpacity>
      )} */}
      {/* {volumeState === VOLUME_STATE_UNMUTE && (
        <TouchableOpacity onPress={mute}>
          <Icon name="volume-off" size={20} color="#000000" />
        </TouchableOpacity>
      )} */}
      {/* <TouchableOpacity onPress={download}>
        <Icon name="file-download" size={20} color="#000000" />
      </TouchableOpacity> */}
    </View>
  );
};

export default AudioPlayer;
