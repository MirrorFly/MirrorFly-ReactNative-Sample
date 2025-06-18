import React from 'react';
import {
    Pressable as RNPressable, // NOSONAR
    View,
    ViewStyle, // NOSONAR
} from 'react-native';
import commonStyles, { pressableStyles } from '../styles/commonStyles';
import PropTypes from 'prop-types';

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
const MessagePressable = ({ children, forcePress = false, contentContainerStyle, ...props }) => {
   const processedContentContainerStyle = React.useMemo(() => {
      return [
         commonStyles.positionRelative,
         ...(Array.isArray(contentContainerStyle) ? contentContainerStyle : [contentContainerStyle]),
      ];
   }, [contentContainerStyle]);
   return (
      <RNPressable delayLongPress={300} {...props}>
         {({ pressed }) => (
            <View style={[processedContentContainerStyle]}>
               {children}
               <View style={(pressed || forcePress) && pressableStyles.highlightView} />
            </View>
         )}
      </RNPressable>
   );
};

MessagePressable.propTypes = {
   children: PropTypes.node,
   forcePress: PropTypes.bool,
   contentContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
   onPress: PropTypes.func,
   onLongPress: PropTypes.func,
   style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default React.memo(MessagePressable);
