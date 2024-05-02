import React from 'react';
import { Text } from 'react-native';
import useRosterData from '../hooks/useRosterData';
import { isLocalUser } from '../Helper/Chat/ChatHelper';

function NickName({ userId, style, colorCodeRequired = false, ...props }) {
   let { nickName, colorCode } = useRosterData(userId);
   const localUser = isLocalUser(userId);

   const textStyle = colorCodeRequired ? { ...style, color: colorCode } : style;
   return (
      <Text numberOfLines={1} style={textStyle} {...props}>
         {localUser ? 'You' : nickName || userId}
      </Text>
   );
}

export default NickName;
