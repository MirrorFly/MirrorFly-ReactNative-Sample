import React, { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import ApplicationColors from '../config/appColors';
import { showNetWorkToast } from '../helpers/chatHelpers';
import IconButton from './IconButton';
import { useNetworkStatus } from './hooks';

function CustomSwitch({ value, onToggle, disabled = false }) {
   const isNetWorkConnected = useNetworkStatus();
   const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

   React.useEffect(() => {
      animate(value);
   }, [value]);

   const animate = _value => {
      Animated.timing(animatedValue, {
         toValue: _value,
         duration: 200,
         useNativeDriver: true,
      }).start();
   };

   const toggleSwitch = () => {
      if (!isNetWorkConnected) {
         showNetWorkToast();
         return;
      }
      onToggle?.(!value);
   };

   const translateX = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 23], // Adjust the outputRange to change the thumb travel distance
   });

   return (
      <IconButton onPress={toggleSwitch} disabled={disabled}>
         <View
            style={[
               styles.switchContainer,
               Boolean(value) ? styles.switchBorderdOn : styles.switchBorderdOff,
               { opacity: disabled ? 0.7 : 1 },
            ]}>
            <View style={[styles.switchBackground]} />
            <Animated.View
               style={[
                  styles.thumb,
                  Boolean(value) ? styles.thumbOn : styles.thumbOff,
                  { opacity: disabled ? 0.7 : 1 },
                  { transform: [{ translateX }] },
               ]}
            />
         </View>
      </IconButton>
   );
}

const styles = StyleSheet.create({
   switchContainer: {
      width: 40,
      height: 18.5,
      borderRadius: 18,
      borderWidth: 1,
      justifyContent: 'center',
   },
   switchBorderdOn: {
      borderColor: ApplicationColors.mainColor,
   },
   switchBorderdOff: {
      borderColor: '#767577',
   },
   switchBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: 18,
      backgroundColor: 'transparent',
   },
   thumb: {
      width: 13, // Thumb size
      height: 13,
      borderRadius: 14,
      position: 'absolute',
      top: 2,
   },
   thumbOn: {
      backgroundColor: ApplicationColors.mainColor,
   },
   thumbOff: {
      backgroundColor: '#767577',
   },
});

export default CustomSwitch;
