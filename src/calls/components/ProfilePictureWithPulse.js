import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';

const ProfilePictureWithPulse = ({ imageUrl }) => {
   const [pulseValue] = useState(new Animated.Value(1));
   const [opacityValue] = useState(new Animated.Value(1));

   useEffect(() => {
      const startPulseAnimation = () => {
         Animated.loop(
            Animated.parallel([
               Animated.sequence([
                  Animated.timing(pulseValue, {
                     toValue: 1.2,
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
                  Animated.timing(opacityValue, {
                     toValue: 1,
                     duration: 100,
                     easing: Easing.inOut(Easing.ease),
                     useNativeDriver: true,
                  }),
                  Animated.timing(opacityValue, {
                     toValue: 0,
                     duration: 100,
                     easing: Easing.inOut(Easing.ease),
                     useNativeDriver: true,
                  }),
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
   }, [pulseValue]);

   return (
      <View style={styles.container}>
         <Animated.View style={[styles.dottedBorder, { transform: [{ scale: pulseValue }], opacity: opacityValue }]}>
            <Image source={{ uri: imageUrl }} style={styles.profileImage} />
         </Animated.View>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      justifyContent: 'center',
      alignItems: 'center',
   },
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
