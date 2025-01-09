import React from 'react';
import { Animated, GestureResponderEvent, Keyboard, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { Controls } from './Controls';
import styles from './MediaControls.style';
import { CustomSliderStyle, Slider } from './Slider';
import { Toolbar } from './Toolbar';
import { PLAYER_STATES } from './constants/playerStates';

export type Props = {
   children: React.ReactNode;
   containerStyle: ViewStyle;
   duration: number;
   fadeOutDisable?: boolean;
   fadeOutDelay?: number;
   isFullScreen: boolean;
   isLoading: boolean;
   primaryColor: string;
   onFullScreen?: (event: GestureResponderEvent) => void;
   onPaused: (playerState: typeof PLAYER_STATES.ENDED) => void;
   onReplay: () => void;
   onSeek: (value: number) => void;
   onSeeking: (value: number) => void;
   playerState: typeof PLAYER_STATES.ENDED;
   progress: number;
   showOnStart?: boolean;
   sliderStyle?: CustomSliderStyle;
   toolbarStyle?: ViewStyle;
};

const MediaControls = (props: Props) => {
   const {
      children,
      containerStyle: customContainerStyle = {},
      duration,
      fadeOutDisable = false,
      fadeOutDelay = 5000,
      isLoading = false,
      primaryColor = 'rgba(12, 83, 175, 0.9)',
      onFullScreen,
      onReplay: onReplayCallback,
      onSeek,
      onSeeking,
      playerState,
      progress,
      showOnStart = true,
      sliderStyle, // defaults are applied in Slider.tsx
      toolbarStyle: customToolbarStyle = {},
   } = props;
   const { initialOpacity, initialIsVisible } = (() => {
      if (showOnStart) {
         return {
            initialOpacity: 1,
            initialIsVisible: true,
         };
      }

      return {
         initialOpacity: 0,
         initialIsVisible: false,
      };
   })();

   const [opacity] = React.useState(new Animated.Value(initialOpacity));
   const [isVisible, setIsVisible] = React.useState(initialIsVisible);

   React.useEffect(() => {
      if (playerState === PLAYER_STATES.PLAYING) {
         fadeOutControls(fadeOutDelay);
      }
      if (playerState !== PLAYER_STATES.PLAYING) {
         fadeInControls();
      }
   }, [playerState]);

   const fadeOutControls = (delay = 0) => {
      if (!fadeOutDisable) {
         Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            delay,
            useNativeDriver: true,
         }).start(result => {
            /* I noticed that the callback is called twice, when it is invoked and when it completely finished
      This prevents some flickering */
            if (result.finished) {
               setIsVisible(false);
            }
         });
      }
   };

   const fadeInControls = (loop = true) => {
      setIsVisible(true);
      Animated.timing(opacity, {
         toValue: 1,
         duration: 300,
         delay: 0,
         useNativeDriver: true,
      }).start(() => {
         if (loop) {
            fadeOutControls(fadeOutDelay);
         }
      });
   };

   const onReplay = () => {
      fadeOutControls(fadeOutDelay);
      onReplayCallback();
   };

   const cancelAnimation = () => opacity.stopAnimation(() => setIsVisible(true));

   const onPause = () => {
      const { playerState, onPaused } = props;
      const { PLAYING, PAUSED, ENDED } = PLAYER_STATES;
      switch (playerState) {
         case PLAYING: {
            cancelAnimation();
            break;
         }
         case PAUSED: {
            fadeOutControls(fadeOutDelay);
            break;
         }
         case ENDED:
            break;
      }

      const newPlayerState = playerState === PLAYING ? PAUSED : PLAYING;
      return onPaused(newPlayerState);
   };

   const toggleControls = () => {
      // value is the last value of the animation when stop animation was called.
      // As this is an opacity effect, I (Charlie) used the value (0 or 1) as a boolean
      Keyboard.dismiss();
      opacity.stopAnimation((value: number) => {
         setIsVisible(!!value);
         return value ? fadeOutControls() : fadeInControls();
      });
   };

   return (
      <TouchableWithoutFeedback accessible={false} onPress={toggleControls}>
         <Animated.View style={[styles.container, customContainerStyle, { opacity }]}>
            {isVisible && (
               <View style={[styles.container, customContainerStyle]}>
                  <View style={[styles.controlsRow, styles.toolbarRow, customToolbarStyle]}>{children}</View>
                  <Controls
                     onPause={onPause}
                     onReplay={onReplay}
                     isLoading={isLoading}
                     primaryColor={primaryColor}
                     playerState={playerState}
                  />
                  <Slider
                     progress={progress}
                     duration={duration}
                     primaryColor={primaryColor}
                     onFullScreen={onFullScreen}
                     playerState={playerState}
                     onSeek={onSeek}
                     onSeeking={onSeeking}
                     onPause={onPause}
                     customSliderStyle={sliderStyle}
                  />
               </View>
            )}
         </Animated.View>
      </TouchableWithoutFeedback>
   );
};

MediaControls.Toolbar = Toolbar;

export default MediaControls;
