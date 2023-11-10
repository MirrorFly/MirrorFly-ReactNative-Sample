import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

const PulseAnimatedItem = ({ baseStyle, startDelay }) => {
   const [pulseValue] = useState(new Animated.Value(1));
   const [opacityValue] = useState(new Animated.Value(1));
   console.log(startDelay, 'satrtt');
   useEffect(() => {
      const startPulseAnimation = () => {
         Animated.loop(
            Animated.parallel([
               Animated.sequence([
                  Animated.delay(startDelay),
                  Animated.timing(pulseValue, {
                     toValue: 1.3,
                     duration: 200,
                     easing: Easing.inOut(Easing.sin),
                     useNativeDriver: true,
                  }),
                  Animated.timing(pulseValue, {
                     toValue: 1,
                     duration: 200,
                     easing: Easing.inOut(Easing.sin),
                     useNativeDriver: true,
                  }),
               ]),
               Animated.sequence([
                  Animated.delay(startDelay),
                  // Animated.timing(opacityValue, {
                  //    toValue: 1,
                  //    duration: 70,
                  //    easing: Easing.inOut(Easing.ease),
                  //    useNativeDriver: true,
                  // }),
                  Animated.timing(opacityValue, {
                     toValue: 0,
                     duration: 200,
                     easing: Easing.inOut(Easing.linear),
                     useNativeDriver: true,
                  }),
                  Animated.timing(opacityValue, {
                     toValue: 0,
                     duration: 200,
                     easing: Easing.inOut(Easing.linear),
                     useNativeDriver: true,
                  }),
                  // Animated.timing(opacityValue, {
                  //    toValue: 1,
                  //    duration: 0,
                  //    easing: Easing.inOut(Easing.ease),
                  //    useNativeDriver: true,
                  // }),
               ]),
            ]),
         ).start();
      };

      startPulseAnimation();

      // Clean up animation on component unmount
      return () => {
         pulseValue.stopAnimation();
         opacityValue.stopAnimation();
      };
   }, []);

   return (
      <Animated.View
         style={[
            styles.dottedBorder,
            baseStyle,
            { transform: [{ scale: pulseValue }], opacity: opacityValue },
         ]}></Animated.View>
   );
};

const ProfilePictureWithPulse = (props = {}) => {
   const { iterations, startDelay, baseStyle } = props;
   let iterationData = new Array(iterations).fill(1);
   return iterationData.map((_, index) => (
      <PulseAnimatedItem baseStyle={baseStyle} startDelay={startDelay * index} key={++index * startDelay} />
   ));
};

const styles = StyleSheet.create({
   dottedBorder: {
      borderColor: 'white',
      borderWidth: 0.8,
      borderRadius: 100,
      borderStyle: 'dashed',
      padding: 4,
   },
   profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
   },
});

export default ProfilePictureWithPulse;
