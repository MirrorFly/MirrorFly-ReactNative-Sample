import { View } from 'react-native';
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { Pressable as RNPressable, PressableProps } from 'react-native';
import commonStyles from './commonStyles';

/**
 *
 * @param {PressableProps} props
 */
const Pressable = ({
  children,
  contentContainerStyle,
  pressedStyle,
  ...props
}) => {
  const processedContentContainerStyle = React.useMemo(() => {
    return [
      ...(Array.isArray(contentContainerStyle)
        ? contentContainerStyle
        : [contentContainerStyle]),
    ];
  }, [contentContainerStyle]);
  return (
    <RNPressable {...props}>
      {({ pressed }) => (
        <View
          style={[
            processedContentContainerStyle,
            pressed && (pressedStyle || commonStyles.pressedBg),
          ]}>
          {children}
        </View>
      )}
    </RNPressable>
  );
};

export default Pressable;
