import React from 'react';
import { Text } from 'react-native';
import useRosterData from '../hooks/useRosterData';
import { isLocalUser } from '../Helper/Chat/ChatHelper';

function NickName({ userId, ...props }) {
   let { nickName } = useRosterData(userId);
   const localUser = isLocalUser(userId);

   return <Text {...props}>{localUser ? 'You' : nickName || userId}</Text>;
}

export default NickName;
