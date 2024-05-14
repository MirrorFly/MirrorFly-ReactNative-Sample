import React from 'react';
import { Pressable, View } from 'react-native';
import commonStyles from './commonStyles';

const IconButton = ({ containerStyle, style, pressedStyle, onPress, children }) => {
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
      <Pressable style={processedPresableStyle} onPress={onPress}>
         {({ pressed }) => (
            <View
               style={[commonStyles.padding_10, ProcessedStyle, pressed && (pressedStyle || commonStyles.pressedBg)]}>
               {children}
            </View>
         )}
      </Pressable>
   );
};

export default React.memo(IconButton);
