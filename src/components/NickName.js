import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { escapeRegExpReservedChars } from '../Helper';
import { isLocalUser } from '../Helper/Chat/ChatHelper';
import commonStyles from '../common/commonStyles';
import useRosterData from '../hooks/useRosterData';

function NickName({ userId, style, colorCodeRequired = false, searchValue = '', ...props }) {
   let { nickName, colorCode } = useRosterData(userId);
   const localUser = isLocalUser(userId);
   const parts = searchValue
      ? nickName.split(new RegExp(`(${escapeRegExpReservedChars(searchValue)})`, 'gi'))
      : [nickName || userId];

   const textStyle = colorCodeRequired ? { ...style, color: colorCode } : style;

   if (localUser) {
      return (
         <Text numberOfLines={1} style={textStyle} {...props}>
            You
         </Text>
      );
   }

   return (
      <View style={commonStyles.hstack}>
         {parts.map((part, i) => {
            const isSearchMatch = part?.toLowerCase() === searchValue.toLowerCase() ? styles.highlight : {};
            return (
               <Text numberOfLines={1} key={++i + '-'} ellipsizeMode="tail" style={[textStyle, isSearchMatch]}>
                  {part}
               </Text>
            );
         })}
      </View>
   );
}

const styles = StyleSheet.create({
   highlight: {
      color: '#3276E2',
      fontWeight: 'bold',
   },
});

export default NickName;
