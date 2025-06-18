import React, { useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import PropTypes from 'prop-types';

const PulseAnimatedView = ({ animateToValue, baseStyle, animationDuration = 300, children }) => {
   const scaleValue = new Animated.Value(1);

   useEffect(() => {
      const startPulseAnimation = () => {
         // Animated.loop(
         Animated.sequence([
            Animated.delay(500),
            Animated.timing(scaleValue, {
               toValue: animateToValue, // Use the animateToValue
               duration: animationDuration,
               easing: Easing.inOut(Easing.ease),
               useNativeDriver: true, // Enabling native driver for performance
            }),
            Animated.timing(scaleValue, {
               toValue: 1, // Scale back to 1
               duration: animationDuration,
               easing: Easing.inOut(Easing.ease),
               useNativeDriver: true, // Enabling native driver for performance
            }),
         ]).start();
         // ).start();
      };

      startPulseAnimation();
   }, [animateToValue]); // Re-run the animation when animateToValue changes

   return (
      <Animated.View
         style={[
            baseStyle,
            {
               transform: [{ scale: scaleValue }],
            },
         ]}>
         {children}
      </Animated.View>
   );
};

PulseAnimatedView.propTypes = {
   animateToValue: PropTypes.number,
   baseStyle: PropTypes.object,
   animationDuration: PropTypes.number,
   children: PropTypes.node,
};

export default PulseAnimatedView;
