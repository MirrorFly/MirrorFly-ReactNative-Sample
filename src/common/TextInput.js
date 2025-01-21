import React from 'react';
import { I18nManager, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { useFontFamily } from '../redux/reduxHook';

/**
 * @typedef {Object} CustomProps
 * @property {TextStyle} contentContainerStyle
 */

const TextInput = ({ style = {}, inputRef = {}, placeholder = '', ...props }) => {
   const isRTL = I18nManager.isRTL;
   const fontFamily = useFontFamily();

   const getFontFamilyForWeight = fontWeight => {
      // Define your font family mapping based on font weight
      switch (fontWeight) {
         case 'bold':
         case '700':
         case '600':
            return fontFamily.fontBold;
         case '500':
            return fontFamily.fontMedium;
         case '400':
         default:
            return fontFamily.fontRegular;
      }
   };

   const processedContentContainerStyle = React.useMemo(() => {
      const baseStyles = Array.isArray(style) ? style : [style];
      const fontWeightStyle = baseStyles.find(s => s?.fontWeight) || {};
      const fontWeight = fontWeightStyle.fontWeight || '400'; // Default weight
      const fontFamily = getFontFamilyForWeight(fontWeight);

      return StyleSheet.flatten([...baseStyles, { textAlign: isRTL ? 'right' : 'left', fontFamily }]);
   }, [style, isRTL, fontFamily]);

   placeholder = isRTL ? placeholder.replace('...', '') + '...' : placeholder;

   return <RNTextInput style={processedContentContainerStyle} ref={inputRef} placeholder={placeholder} {...props} />;
};

export default TextInput;
