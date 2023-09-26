import React from 'react';
import {
  Pressable as RNPressable,
  // eslint-disable-next-line no-unused-vars
  PressableProps, // NOSONAR
  View,
  // eslint-disable-next-line no-unused-vars
  ViewStyle, // NOSONAR
} from 'react-native';
import commonStyles, { pressableStyles } from './commonStyles';

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
          {children}
          <View
            style={(pressed || forcePress) && pressableStyles.highlightView}
          />
        </View>
      )}
    </RNPressable>
  );
};

export default React.memo(MessagePressable);
