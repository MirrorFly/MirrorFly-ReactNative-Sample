import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

const SlideInView = ({ visible, children }) => {
   const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

   useEffect(() => {
      if (visible) {
         Animated.timing(slideAnim, {
            toValue: 0, // Slide to the screen's bottom
            duration: 300, // Animation duration in ms
            useNativeDriver: true,
         }).start();
      } else {
         Animated.timing(slideAnim, {
            toValue: Dimensions.get('window').height, // Slide out of the screen
            duration: 300,
            useNativeDriver: true,
         }).start();
      }
   }, [visible, slideAnim]);

   return (
      visible && (
         <View style={styles.wrapper}>
            <Animated.View
               style={[
                  styles.container,
                  {
                     transform: [{ translateY: slideAnim }],
                  },
               ]}>
               {children}
            </Animated.View>
         </View>
      )
   );
};

const styles = StyleSheet.create({
   wrapper: {
      flex: 1,
      position: 'absolute',
      width: '100%',
      height: '100%',
   },
   container: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      elevation: 5,
   },
});

SlideInView.propTypes = {
   visible: PropTypes.bool,
   children: PropTypes.node,
};

export default SlideInView;
