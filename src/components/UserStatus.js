import React from 'react';
import { Text } from 'react-native';
import { useRoasterData } from '../redux/reduxHook';

function UserStatus({ userId, ...props }) {
   let { status = '' } = useRoasterData(userId);

   return <Text {...props}>{status}</Text>;
}

export default UserStatus;
