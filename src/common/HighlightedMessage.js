import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import commonStyles from '../styles/commonStyles';

export const HighlightedMessage = ({ text, searchValue = '', index }) => {
   const parts = searchValue ? text.split(new RegExp(`(${escapeRegExpReservedChars(searchValue)})`, 'gi')) : [text];

   return (
      <View style={commonStyles.hstack}>
         {parts.map((part, i) => {
            const isSearchMatch = part?.toLowerCase() === searchValue.toLowerCase() ? styles.highlight : {};
            return (
               <Text
                  numberOfLines={1}
                  key={++i + '-' + index}
                  ellipsizeMode="tail"
                  style={[styles.highlightedMessageText, isSearchMatch]}>
                  {part}
               </Text>
            );
         })}
      </View>
   );
};

const styles = StyleSheet.create({
   highlightedMessageText: {
      color: '#767676',
   },
});
