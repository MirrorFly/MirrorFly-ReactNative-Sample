import React from 'react';
import { Image, View } from 'react-native';
import grpImage from '../assets/ic_grp_bg.png';
import img from '../assets/img.png';
import { getImageSource, getUsernameGraphemes } from '../helpers/chatHelpers';
import { CHAT_TYPE_SINGLE } from '../helpers/constants';
import { useIsBlockedMeStatus, useRoasterData } from '../redux/reduxHook';
import { useFetchImage } from './hooks';
import Text from './Text';

function InfoImageView({ userId, type, scaledFontSize, ...props }) {
   let { nickName, image } = useRoasterData(userId) || {};
   const isBlockedMeStatus = useIsBlockedMeStatus(userId);
   const _nickName = nickName || userId;

   const { imageUrl, authToken } = useFetchImage(image);

   if (isBlockedMeStatus) {
      return (
         <View
            style={{
               backgroundColor: '#C7C7C7',
               width: '100%',
               height: '100%',
               justifyContent: 'center',
               alignItems: 'center',
            }}>
            <Image {...props} style={{ width: '50%', height: '50%' }} source={getImageSource(img)} />
         </View>
      );
   }

   if (type === CHAT_TYPE_SINGLE && !imageUrl) {
      return <Text style={{ color: '#fff', fontSize: scaledFontSize }}>{getUsernameGraphemes(_nickName)}</Text>;
   }

   return imageUrl ? (
      <Image
         source={{
            uri: imageUrl,
            method: 'GET',
            cache: 'force-cache',
            headers: {
               Authorization: authToken,
            },
         }}
         {...props}
      />
   ) : (
      <Image {...props} source={getImageSource(grpImage)} />
   );
}

export default InfoImageView;
