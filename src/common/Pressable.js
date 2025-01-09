import React from 'react';
import {
   PressableProps, // NOSONAR
   Pressable as RNPressable,
   View, // NOSONAR
   ViewStyle, // NOSONAR
} from 'react-native';
import { useThemeColorPalatte } from '../redux/reduxHook';
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
   const themeColorPalatte = useThemeColorPalatte();
   const processedContentContainerStyle = React.useMemo(() => {
      return [...(Array.isArray(contentContainerStyle) ? contentContainerStyle : [contentContainerStyle])];
   }, [contentContainerStyle]);
   return (
      <RNPressable delayLongPress={250} {...props}>
         {({ pressed }) => (
            <View
               style={[
                  processedContentContainerStyle,
                  pressed && (pressedStyle || commonStyles.pressedBg(themeColorPalatte.pressedBg)),
               ]}>
               {children}
            </View>
         )}
      </RNPressable>
   );
};

export default Pressable;
