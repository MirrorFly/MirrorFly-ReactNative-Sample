import { View } from 'native-base';
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { Pressable as RNPressable, PressableProps } from 'react-native';
import commonStyles from './commonStyles';

/**
 *
 * @param {PressableProps} props
 */
const Pressable = ({ children, contentContainerStyle, ...props }) => {
  return (
    <RNPressable {...props}>
      {({ pressed }) => (
        <View
          style={[contentContainerStyle, pressed && commonStyles.pressedBg]}>
          {children}
        </View>
      )}
    </RNPressable>
  );
};

export default Pressable;
