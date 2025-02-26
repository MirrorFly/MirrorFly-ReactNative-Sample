import React from 'react';
import { StyleSheet, View } from 'react-native';
import { isLocalUser } from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import { useRoasterData, useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import Text from './Text';

function NickName({ userId, searchValue = '', index, style, colorCodeRequired = false, data = {} }) {
   const stringSet = getStringSet();
   const profile = useRoasterData(userId);
   const themeColorPalatte = useThemeColorPalatte();
   const [userProfile, setUserProfile] = React.useState(() => ({
      ...data,
      ...profile,
   }));

   React.useMemo(() => {
      if (profile && JSON.stringify(profile) !== JSON.stringify(userProfile)) {
         setUserProfile(prevData => ({
            ...prevData,
            ...profile,
         }));
      }
   }, [profile]);

   let { nickName, colorCode } = userProfile;
   const localUser = isLocalUser(userId);
   const parts = [nickName || userId];
   // ? (nickName || userId).split(new RegExp(`(${escapeRegExpReservedChars(searchValue)})`, 'gi'))
   // : [nickName || userId];

   const textStyle = colorCodeRequired ? { ...style, color: colorCode } : style;
   const baseStyles = Array.isArray(textStyle) ? textStyle : [textStyle];

   return (
      <>
         {searchValue ? (
            <View style={commonStyles.hstack}>
               {parts?.map((part, i) => {
                  const isSearchMatch =
                     part?.toLowerCase() === searchValue?.toLowerCase()
                        ? { color: themeColorPalatte.primaryColor, fontWeight: 'bold' }
                        : {};
                  const combinedStyle = StyleSheet.flatten([baseStyles, isSearchMatch]);
                  return (
                     <Text
                        numberOfLines={1}
                        key={`${i}-${index}`} // NOSONAR
                        ellipsizeMode="tail"
                        style={combinedStyle}>
                        {localUser ? stringSet.COMMON_TEXT.YOU_LABEL : part}
                     </Text>
                  );
               })}
            </View>
         ) : (
            parts?.map((part, i) => {
               return (
                  <Text
                     numberOfLines={1}
                     key={`${i}-${index}`} // NOSONAR
                     ellipsizeMode="tail"
                     style={baseStyles}>
                     {localUser ? stringSet.COMMON_TEXT.YOU_LABEL : part}
                  </Text>
               );
            })
         )}
      </>
   );
}

export default NickName;
