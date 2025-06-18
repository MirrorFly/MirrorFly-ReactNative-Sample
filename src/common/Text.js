import React from 'react';
import { I18nManager, Text as RNText, StyleSheet } from 'react-native';
import { useFontFamily } from '../redux/reduxHook';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} CustomProps
 * @property {TextStyle} contentContainerStyle
 */

const Text = React.forwardRef(({ style = {}, ...props }, ref) => {
   const isRTL = I18nManager.isRTL;
   const fontFamily = useFontFamily();

   const getFontFamilyForWeight = fontWeight => {
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

   const getFontWeight = fontWeight => {
      const defaultWeights = {
         bold: '600',
         700: '600',
         600: '600',
         500: '500',
         400: '400',
         default: '400',
      };
      return defaultWeights[fontWeight] || defaultWeights.default;
   };

   const processedContentContainerStyle = React.useMemo(() => {
      const baseStyles = Array.isArray(style) ? style : [style];
      const fontWeightStyle = baseStyles.find(s => s?.fontWeight) || {};
      const fontWeight = getFontWeight(fontWeightStyle.fontWeight); // Default weight
      const _fontFamily = getFontFamilyForWeight(fontWeight);
      const hasTextAlign = baseStyles.some(s => s?.textAlign);

      return StyleSheet.flatten([
         ...baseStyles,
         {
            ...(hasTextAlign ? {} : { textAlign: isRTL ? 'left' : 'auto' }),
            writingDirection: 'auto',
            fontFamily: _fontFamily,
            fontWeight,
         },
      ]);
   }, [style, isRTL, fontFamily]);

   return (
      <RNText ref={ref} style={processedContentContainerStyle} {...props}>
         {props.children}
      </RNText>
   );
});

Text.propTypes = {
   style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
   children: PropTypes.node,
   contentContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default Text;
