import React from 'react';

import { useRoute } from '@react-navigation/native';
import { View } from 'react-native';
import ScreenHeader from '../common/ScreenHeader';
import AuthProfileImage from '../components/AuthProfileImage';
import { useRoasterData } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

const ProfilePhoto = () => {
   const { params: { userId } = {} } = useRoute();
   const profile = useRoasterData(userId) || {};
   return (
      <>
         <ScreenHeader title={profile.nickName} isSearchable={false} />
         <View style={[commonStyles.vstack, commonStyles.justifyContentCenter, commonStyles.flex1]}>
            <AuthProfileImage
               style={{ height: 400, width: 410, padding: 0, margin: 0, borderRadius: 0 }}
               component="profileImage"
               resizeMode="contain"
               image={profile.image}
            />
         </View>
      </>
   );
};

export default ProfilePhoto;
