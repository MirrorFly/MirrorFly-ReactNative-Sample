import React from 'react';
import {
   Pressable as RNPressable,
   View,
   // eslint-disable-next-line no-unused-vars
   PressableProps, // NOSONAR
   // eslint-disable-next-line no-unused-vars
   ViewStyle, // NOSONAR
} from 'react-native';
import commonStyles from './commonStyles';

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
      <RNPressable delayLongPress={300} {...props}>
         {({ pressed }) => (
            <View style={[processedContentContainerStyle, pressed && (pressedStyle || commonStyles.pressedBg)]}>
               {children}
            </View>
         )}
      </RNPressable>
   );
};

export default Pressable;
