import React from 'react';
import {
  Pressable as RNPressable,
  // eslint-disable-next-line no-unused-vars
  PressableProps, // NOSONAR
  View,
  StyleSheet,
  // eslint-disable-next-line no-unused-vars
  ViewStyle, // NOSONAR
} from 'react-native';
import commonStyles from './commonStyles';
import ApplicationColors from '../config/appColors';

/**
 * @typedef {Object} CustomProps
 * @property {boolean} forcePress
 * @property {ViewStyle} contentContainerStyle
 *
 * @typedef { PressableProps & CustomProps } MessagePressableProps
 */

/**
 * @param {MessagePressableProps} props
 */
const MessagePressable = ({
  children,
  forcePress = false,
  contentContainerStyle,
  ...props
}) => {
  const processedContentContainerStyle = React.useMemo(() => {
    return [
      commonStyles.positionRelative,
      ...(Array.isArray(contentContainerStyle)
        ? contentContainerStyle
        : [contentContainerStyle]),
    ];
  }, [contentContainerStyle]);
  return (
    <RNPressable {...props}>
      {({ pressed }) => (
        <View style={[processedContentContainerStyle]}>
          <View style={(pressed || forcePress) && styles.highlightView} />
          {children}
        </View>
      )}
    </RNPressable>
  );
};

export default MessagePressable;

const styles = StyleSheet.create({
  highlightView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: ApplicationColors.pressedBg,
    zIndex: 10,
  },
});
