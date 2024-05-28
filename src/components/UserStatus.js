import React from 'react';
import { Text } from 'react-native';
import useRosterData from '../hooks/useRosterData';

function UserStatus({ userId, ...props }) {
   let { status } = useRosterData(userId);

   return <Text {...props}>{status}</Text>;
}

export default UserStatus;
