import React from 'react';
import useRosterData from '../hooks/useRosterData';
import Avathar from '../common/Avathar';
import SDK from '../SDK/SDK';

function UserAvathar({ userId, userProfile, ...props }) {
   let { nickName, image: imageToken, colorCode } = useRosterData(userId);

   nickName = nickName || userProfile?.nickName || userId || '';
   imageToken = imageToken || userProfile?.image || '';
   colorCode = colorCode || userProfile?.colorCode || SDK.getRandomColorCode();

   return <Avathar data={nickName} profileImage={imageToken} backgroundColor={colorCode} {...props} />;
}

export default UserAvathar;
