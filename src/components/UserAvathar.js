import React from 'react';
import Avathar from '../common/Avathar';
import { useRoasterData } from '../redux/reduxHook';

function UserAvathar({ type, userId, data = {}, ...props }) {
   const [visible, setVisible] = React.useState(false);
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
   // const localUser = isLocalUser(userId);
   const onPress = () => {
      setVisible(true);
   };

   const onRequestClose = () => {
      setVisible(false);
   };

   return (
      <Avathar type={type} data={nickName || userId} backgroundColor={colorCode} profileImage={imageToken} {...props} />
   );
}

export default UserAvathar;
