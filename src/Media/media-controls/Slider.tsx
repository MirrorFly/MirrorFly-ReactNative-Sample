import { TouchableOpacity, View, ViewStyle } from 'react-native';
import Text from '../../common/Text';
import RNSlider from '../RNSlider';
import { Props as MediaControlsProps } from './MediaControls';
import styles from './MediaControls.style';
import { PLAYER_STATES } from './constants/playerStates';
import { humanizeVideoDuration } from './utils';

export type CustomSliderStyle = {
   containerStyle: ViewStyle;
   trackStyle: ViewStyle;
   thumbStyle: ViewStyle;
};

type Props = Pick<
   MediaControlsProps,
   'progress' | 'duration' | 'primaryColor' | 'onFullScreen' | 'playerState' | 'onSeek' | 'onSeeking'
> & {
   onPause: () => void;
   customSliderStyle?: CustomSliderStyle;
};

/** const fullScreenImage = require('./assets/ic_fullscreen.png'); */

const Slider = (props: Props) => {
   const { customSliderStyle, duration, primaryColor, onFullScreen, onPause, progress } = props;

   const containerStyle = customSliderStyle?.containerStyle || {};
   const customTrackStyle = customSliderStyle?.trackStyle || {};
   const customThumbStyle = customSliderStyle?.thumbStyle || {};

   const dragging = (value: number) => {
      const { onSeeking, playerState } = props;
      onSeeking(value);

      if (playerState === PLAYER_STATES.PAUSED) {
         return;
      }

      onPause();
   };

   const seekVideo = (value: number) => {
      props.onSeek(value);
      onPause();
   };

   return (
      <View style={[styles.controlsRow, styles.progressContainer, containerStyle]}>
         <View style={styles.progressColumnContainer}>
            <View style={[styles.timerLabelsContainer]}>
               <Text style={styles.timerLabel}>{humanizeVideoDuration(progress)}</Text>
               <Text style={styles.timerLabel}>{humanizeVideoDuration(duration)}</Text>
            </View>
            <RNSlider
               style={[styles.progressSlider]}
               onValueChange={dragging}
               onSlidingComplete={seekVideo}
               maximumValue={Math.floor(duration)}
               value={Math.floor(progress)}
               trackStyle={[styles.track, customTrackStyle]}
               thumbStyle={[styles.thumb, customThumbStyle, { borderColor: primaryColor }]}
               minimumTrackTintColor={primaryColor}
            />
         </View>
         {Boolean(onFullScreen) && (
            <TouchableOpacity style={styles.fullScreenContainer} onPress={onFullScreen}>
               {/* <Image source={fullScreenImage} /> */}
            </TouchableOpacity>
         )}
      </View>
   );
};

export { Slider };
