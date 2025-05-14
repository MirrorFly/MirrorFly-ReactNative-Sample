import React, { useRef } from 'react';
import { Animated, I18nManager, StyleSheet, View } from 'react-native';
import { showNetWorkToast } from '../helpers/chatHelpers';
import { useThemeColorPalatte } from '../redux/reduxHook';
import IconButton from './IconButton';
import { useNetworkStatus } from './hooks';

function CustomSwitch({ value, onToggle, disabled = false, networkDisabled = false }) {
   const isNetWorkConnected = useNetworkStatus();
   const themeColorPalatte = useThemeColorPalatte();
   const isRTL = I18nManager.isRTL;
   const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
   const opacity = disabled ? 0.6 : 1;

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
      if (!isNetWorkConnected && !networkDisabled) {
         showNetWorkToast();
         return;
      }
      onToggle?.(!value);
   };

   const translateX = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: isRTL ? [-2, -23] : [2, 23],
   });

   return (
      <IconButton onPress={toggleSwitch} disabled={disabled}>
         <View
            style={[
               styles.switchContainer,
               value ? { borderColor: themeColorPalatte.primaryColor } : { borderColor: '#767577' },
               { opacity },
            ]}>
            <View style={[styles.switchBackground]} />
            <Animated.View
               style={[
                  styles.thumb,
                  value ? { backgroundColor: themeColorPalatte.primaryColor } : styles.thumbOff,
                  { opacity },
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
   thumbOff: {
      backgroundColor: '#767577',
   },
});

export default CustomSwitch;
