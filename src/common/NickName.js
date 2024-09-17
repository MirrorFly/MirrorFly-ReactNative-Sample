import React from 'react';
import { Text, View } from 'react-native';
import { escapeRegExpReservedChars, isLocalUser } from '../helpers/chatHelpers';
import { useRoasterData } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

function NickName({ userId, searchValue = '', index, style, colorCodeRequired = false, data = {} }) {
   const profile = useRoasterData(userId);
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
   const parts = searchValue
      ? (nickName || userId).split(new RegExp(`(${escapeRegExpReservedChars(searchValue)})`, 'gi'))
      : [nickName || userId];

   const textStyle = colorCodeRequired ? { ...style, color: colorCode } : style;
   return (
      <>
         {searchValue ? (
            <View style={commonStyles.hstack}>
               {parts?.map((part, i) => {
                  const isSearchMatch =
                     part?.toLowerCase() === searchValue?.toLowerCase() ? commonStyles.highlight : {};
                  return (
                     <Text
                        numberOfLines={1}
                        key={`${i}-${index}`} // NOSONAR
                        ellipsizeMode="tail"
                        style={[textStyle, isSearchMatch]}>
                        {localUser ? 'You' : part}
                     </Text>
                  );
               })}
            </View>
         ) : (
            parts?.map((part, i) => {
               const isSearchMatch = part?.toLowerCase() === searchValue?.toLowerCase() ? commonStyles.highlight : {};
               return (
                  <Text
                     numberOfLines={1}
                     key={`${i}-${index}`} // NOSONAR
                     ellipsizeMode="tail"
                     style={[textStyle, isSearchMatch]}>
                     {localUser ? 'You' : part}
                  </Text>
               );
            })
         )}
      </>
   );
}

export default NickName;
