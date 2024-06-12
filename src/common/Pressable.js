import React from 'react';
import {
    PressableProps,
    Pressable as RNPressable,
    View, // NOSONAR
    ViewStyle, // NOSONAR
} from 'react-native';
import commonStyles from '../styles/commonStyles';

/**
 * @typedef {Object} CustomProps
 * @property {ViewStyle} pressedStyle
 * @property {ViewStyle} contentContainerStyle
 *
 * @typedef { PressableProps & CustomProps } CustomPressableProps
 */

/**
 * @param {CustomPressableProps} props
 */
const Pressable = ({ children, contentContainerStyle, pressedStyle, ...props }) => {
   const processedContentContainerStyle = React.useMemo(() => {
      return [...(Array.isArray(contentContainerStyle) ? contentContainerStyle : [contentContainerStyle])];
   }, [contentContainerStyle]);
   return (
      <RNPressable delayLongPress={250} {...props}>
         {({ pressed }) => (
            <View style={[processedContentContainerStyle, pressed && (pressedStyle || commonStyles.pressedBg)]}>
               {children}
            </View>
         )}
      </RNPressable>
   );
};

export default Pressable;
