import React from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import callDownArrow from '../../assets/callDownArrow.png';
import callDownArrow1 from '../../assets/callDownArrow1.png';
import callUpArrow from '../../assets/callUpArrow.png';
import callUpArrow1 from '../../assets/callUpArrow1.png';
import { IncomingCallAccept, IncomingCallEnd, IncomingCallIcon } from '../../common/Icons';
import { getImageSource } from '../../common/utils';
import PulseAnimationComponent from '../components/PulseAnimationComponent';

const GestureAnimationScreen = (props = {}) => {
   const { acceptCall, declineCall } = props;
   const panY = React.useRef(new Animated.Value(0)).current;
   const answerY = React.useRef(0);
   const oldMove = React.useRef(0);
   const begin = React.useRef(true);
   const upArrow1Opacity = React.useRef(new Animated.Value(1)).current;
   const upArrow2Opacity = React.useRef(new Animated.Value(1)).current;
   const downArrow1Opacity = React.useRef(new Animated.Value(1)).current;
   const downArrow2Opacity = React.useRef(new Animated.Value(1)).current;
   let [swipeColor, setSwipeColors] = React.useState('#F2F2F2');
   const duration = 300;
   const delay = 100;
   let swipeHandle = false;

   React.useEffect(() => {
      const createAnimation = (target, startDelay) => {
         return Animated.loop(
            Animated.sequence([
               Animated.delay(startDelay),
               Animated.timing(target, {
                  toValue: 0,
                  duration,
                  useNativeDriver: true,
               }),
               Animated.timing(target, {
                  toValue: 1,
                  duration,
                  useNativeDriver: true,
               }),
            ]),
         );
      };
      const createAnimation1 = (target, startDelay) => {
         return Animated.loop(
            Animated.sequence([
               Animated.timing(target, {
                  toValue: 1,
                  duration: 100,
                  useNativeDriver: true,
               }),
               Animated.timing(target, {
                  toValue: 0,
                  duration,
                  useNativeDriver: true,
               }),
               Animated.timing(target, {
                  toValue: 1,
                  duration,
                  useNativeDriver: true,
               }),
            ]),
         );
      };

      const upArrow1Animation = createAnimation(upArrow1Opacity, 0);
      const upArrow2Animation = createAnimation1(upArrow2Opacity, delay);
      const downArrow1Animation = createAnimation(downArrow1Opacity, 0);
      const downArrow2Animation = createAnimation1(downArrow2Opacity, delay);

      upArrow1Animation.start();
      upArrow2Animation.start();
      downArrow1Animation.start();
      downArrow2Animation.start();
   }, []);

   const panResponder = React.useMemo(
      () =>
         PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (event, gesture) => {
               answerY.current = event.nativeEvent.locationY;
               oldMove.current = 0;
               begin.current = true;
            },
            onPanResponderMove: (event, gesture) => {
               const curY = event.nativeEvent.locationY;
               // Calculate the new Y position within the allowed height range
               const deltaY = answerY.current - curY;
               oldMove.current -= deltaY;
               answerY.current = curY;

               // Check if the movement exceeded a certain threshold to determine if it's a valid swipe
               if (oldMove.current < -100 || oldMove.current > 100) {
                  begin.current = false;
               }

               // Update the panY value based on the direction of the swipe, limited to the height range
               let value = Math.max(-130, Math.min(gesture.dy, 130));
               panY.setValue(value);

               // Check the direction of the swipe and perform actions accordingly
               if (gesture.dy < -80) {
                  setSwipeColor('#4cda64');
                  if (gesture.dy < -100) {
                     swipeHandle = true;
                     acceptCall();
                  }
               } else if (gesture.dy > 80) {
                  setSwipeColor('red');
                  if (gesture.dy > 100) {
                     swipeHandle = true;
                     declineCall();
                  }
               }
            },
            onPanResponderRelease: () => {
               // Reset styles or perform cleanup when the gesture is released
               if (!swipeHandle) {
                  Animated.spring(panY, { toValue: 0, useNativeDriver: false }).start();
                  setSwipeColor('#F2F2F2');
               }
            },
         }),
      [],
   );

   const setSwipeColor = color => {
      setSwipeColors(color);
   };

   const callIconComponent = React.useMemo(() => {
      return (
         <View>
            <Animated.View
               style={{
                  transform: [{ translateY: panY }],
               }}
               {...panResponder.panHandlers}>
               <PulseAnimationComponent color="#fff" numPulses={2} diameter={120} speed={28} duration={1400} />
               <View
                  style={{
                     height: 60,
                     width: 60,
                     backgroundColor: swipeColor,
                     justifyContent: 'center',
                     alignItems: 'center',
                     borderRadius: 60,
                  }}>
                  {swipeColor === '#F2F2F2' && <IncomingCallIcon width={20} height={20} />}
               </View>
            </Animated.View>
         </View>
      );
   }, [panY, swipeColor]);

   return (
      <View style={styles.container}>
         <View style={styles.acceptView}>
            <IncomingCallAccept width={25} height={25} />
            <Animated.Image
               style={{ width: 15.714, height: 8.958, opacity: upArrow2Opacity, marginTop: 18 }}
               source={getImageSource(callUpArrow)}
            />
            <Animated.Image
               style={{ width: 14.063, height: 8.016, opacity: upArrow1Opacity, marginTop: 6 }}
               source={getImageSource(callUpArrow1)}
            />
         </View>

         {callIconComponent}

         <View style={[styles.declineView]}>
            <Animated.Image
               style={{ width: 15.714, height: 8.958, opacity: downArrow1Opacity, marginBottom: 6 }}
               source={getImageSource(callDownArrow1)}
            />

            <Animated.Image
               style={{ width: 15.063, height: 9.016, opacity: downArrow2Opacity, marginBottom: 16 }}
               source={getImageSource(callDownArrow)}
            />
            <IncomingCallEnd width={37} height={37} />
         </View>
      </View>
   );
};

export default GestureAnimationScreen;

const styles = StyleSheet.create({
   container: {
      height: 280,
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   acceptView: {
      alignItems: 'center',
   },
   declineView: {
      alignItems: 'center',
   },
});
