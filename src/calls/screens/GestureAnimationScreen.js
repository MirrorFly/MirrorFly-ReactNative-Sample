import { StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector,
  Directions,
} from 'react-native-gesture-handler';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
// } from 'react-native-reanimated';

export default function App() {
//   const position = useSharedValue(0);

//   const flingGesture = Gesture.Fling()
//     .direction(Directions.RIGHT)
//     .onStart((e) => {
//       position.value = withTiming(position.value + 10, { duration: 100 });
//     });

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: position.value }],
//   }));

  return (
    <GestureDetector gesture={flingGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 120,
    width: 120,
    backgroundColor: '#b58df1',
    borderRadius: 20,
    marginBottom: 30,
  },
});