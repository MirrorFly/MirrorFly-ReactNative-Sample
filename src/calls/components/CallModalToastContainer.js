import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import { useDispatch, useSelector } from 'react-redux';
import { resetCallModalToastDataAction } from '../../redux/callModalToastSlice';

const opacityAnimationDuration = 300;
let autoHideToastTimeout;

const CallModalToastContainer = () => {
   const [isVisible, setIsVisible] = React.useState(false);
   const animatedOpacityValue = React.useRef(new Animated.Value(0)).current;

   const { id, toastMessage, toastDuration } = useSelector(state => state.callModalToastData) || {};

   const dispatch = useDispatch();

   React.useEffect(() => {
      if (id) {
         showToast();
         autoHideToastTimeout = BackgroundTimer.setTimeout(() => {
            hideToast();
         }, toastDuration);
         return () => {
            BackgroundTimer.clearTimeout(autoHideToastTimeout);
         };
      } else if (isVisible) {
         hideToast();
      }
   }, [id]);

   const animateOpacity = toValue => {
      Animated.timing(animatedOpacityValue, {
         duration: opacityAnimationDuration,
         toValue: toValue,
         useNativeDriver: true,
      }).start();
   };

   const showToast = () => {
      setIsVisible(true);
      animateOpacity(1);
   };

   const hideToast = () => {
      animateOpacity(0);
      BackgroundTimer.setTimeout(() => {
         setIsVisible(false);
         dispatch(resetCallModalToastDataAction());
      }, opacityAnimationDuration);
   };

   return isVisible ? (
      <Animated.View
         style={[
            styles.container,
            {
               opacity: animatedOpacityValue,
            },
         ]}>
         <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>
   ) : null;
};

export default CallModalToastContainer;

const styles = StyleSheet.create({
   container: {
      position: 'absolute',
      bottom: 50,
      alignSelf: 'center',
      padding: 15,
      backgroundColor: 'black',
      borderRadius: 5,
   },
   toastText: {
      color: '#fff',
   },
});
