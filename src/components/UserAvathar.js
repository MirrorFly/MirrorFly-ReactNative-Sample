import React from 'react';
import Avathar from '../common/Avathar';
import { useRoasterData } from '../redux/reduxHook';

function UserAvathar({ type, userId, data = {}, ...props }) {
   const profile = useRoasterData(userId);
   const [userProfile, setUserProfile] = React.useState(data);

   React.useEffect(() => {
      if (profile) {
         setUserProfile(prevData => ({
            ...prevData,
            ...profile,
         }));
      }
   }, [profile]);

   let { nickName, colorCode, image: imageToken } = userProfile;

   return (
      <Avathar
         type={type}
         userId={userId}
         data={nickName || userId}
         backgroundColor={colorCode}
         profileImage={imageToken}
         {...props}
      />
   );
}

export default React.memo(UserAvathar);
