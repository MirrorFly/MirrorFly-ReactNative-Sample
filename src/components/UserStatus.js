import React from 'react';
import Text from '../common/Text';
import { useRoasterData } from '../redux/reduxHook';

function UserStatus({ userId, ...props }) {
   let { status = '' } = useRoasterData(userId);

   return <Text {...props}>{status}</Text>;
}

export default UserStatus;
