import React from 'react';
import Text from '../common/Text';
import { useRoasterData } from '../redux/reduxHook';
import PropTypes from 'prop-types';

function UserStatus({ userId, ...props }) {
   let { status = '' } = useRoasterData(userId) || {};

   return <Text {...props}>{status}</Text>;
}

UserStatus.propTypes = {
   userId: PropTypes.string,
};

export default UserStatus;
