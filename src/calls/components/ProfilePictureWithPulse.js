import React, { useEffect } from 'react';
import { Animated, Easing } from 'react-native';

const ProfilePictureWithPulse = ({ animateToValue, baseStyle, animationDuration = 1100, children }) => {
   const scaleValue = React.useRef(new Animated.Value(0.9)).current;
   const opacityValue = React.useRef(new Animated.Value(1)).current;

   useEffect(() => {
      const startPulseAnimation = () => {
         Animated.loop(
            Animated.sequence([
               Animated.parallel([
                  Animated.timing(scaleValue, {
                     toValue: animateToValue, // Use the animateToValue
                     duration: animationDuration,
                     easing: Easing.inOut(Easing.ease),
                     useNativeDriver: true, // Enabling native driver for performance
                  }),
                  Animated.timing(opacityValue, {
                     toValue: 0, // Use the animateToValue
                     duration: animationDuration,
                     easing: Easing.inOut(Easing.ease),
                     useNativeDriver: true, // Enabling native driver for performance
                  }),
               ]),
               Animated.timing(scaleValue, {
                  toValue: 0.9, // Scale back to 1
                  duration: animationDuration / 3,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true, // Enabling native driver for performance
               }),
               Animated.timing(opacityValue, {
                  toValue: 1, // Scale back to 1
                  duration: 0,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true, // Enabling native driver for performance
               }),
            ]),
         ).start();
      };
      setTimeout(() => {
         startPulseAnimation();
      }, 200);
   }, []); // Re-run the animation when animateToValue changes

   return (
      <Animated.View
         style={[
            baseStyle,
            {
               transform: [{ scale: scaleValue }],
               opacity: opacityValue,
            },
         ]}>
         {children}
      </Animated.View>
   );
};

export default ProfilePictureWithPulse;
