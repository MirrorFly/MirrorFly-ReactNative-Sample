import React from 'react';
import { Pressable, View } from 'react-native';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import PropTypes from 'prop-types';

const IconButton = ({ containerStyle, style, pressedStyle, onPress, onLongPress, children, ...props }) => {
   const themeColorPalatte = useThemeColorPalatte();
   const ProcessedStyle = React.useMemo(() => {
      if (Array.isArray(style)) {
         // merging all the objects into 1 single object
         return style.reduce((acc, cur) => {
            acc = {
               ...acc,
               ...cur,
            };
            return acc;
         }, {});
      } else {
         return style;
      }
   }, [style]);

   const processedPresableStyle = React.useMemo(() => {
      return [commonStyles.iconButton, ...(Array.isArray(containerStyle) ? containerStyle : [containerStyle])];
   }, [containerStyle]);

   return (
      <Pressable style={processedPresableStyle} onPress={onPress} onLongPress={onLongPress} {...props}>
         {({ pressed }) => (
            <View
               style={[
                  commonStyles.p_10,
                  ProcessedStyle,
                  pressed &&
                     (pressedStyle || [commonStyles.pressedBg(themeColorPalatte.pressedBg), { borderRadius: 50 }]),
               ]}>
               {children}
            </View>
         )}
      </Pressable>
   );
};

IconButton.propTypes = {
   containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
   style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
   pressedStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
   onPress: PropTypes.func,
   onLongPress: PropTypes.func,
   children: PropTypes.node,
};

export default React.memo(IconButton);
