import React from 'react';
import { Image, Text } from 'react-native';
import grpImage from '../assets/ic_grp_bg.png';
import { getImageSource, getUsernameGraphemes } from '../helpers/chatHelpers';
import { CHAT_TYPE_SINGLE } from '../helpers/constants';
import { useRoasterData } from '../redux/reduxHook';
import { useFetchImage } from './hooks';

function InfoImageView({ userId, type, scaledFontSize, ...props }) {
   let { nickName, image } = useRoasterData(userId) || {};
   const _nickName = nickName || userId;

   const { imageUrl, authToken } = useFetchImage(image);

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
