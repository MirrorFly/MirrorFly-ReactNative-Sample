import React from 'react';
import { View } from 'react-native';
import { escapeRegExpReservedChars } from '../helpers/chatHelpers';
import commonStyles from '../styles/commonStyles';
import Text from './Text';

export const HighlightedMessage = ({ text, searchValue = '', index, themeColorPalatte }) => {
   const parts = searchValue ? text.split(new RegExp(`(${escapeRegExpReservedChars(searchValue)})`, 'gi')) : [text];

   return (
      <View style={commonStyles.hstack}>
         {parts.map((part, i) => {
            const isSearchMatch =
               part?.toLowerCase() === searchValue.toLowerCase()
                  ? { color: themeColorPalatte.primaryColor, fontWeight: 'bold' }
                  : {};
            return (
               <Text
                  numberOfLines={1}
                  key={++i + '-' + index}
                  ellipsizeMode="tail"
                  style={[{ color: themeColorPalatte.secondaryTextColor }, isSearchMatch]}>
                  {part}
               </Text>
            );
         })}
      </View>
   );
};
