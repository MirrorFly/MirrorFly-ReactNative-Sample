import React from 'react';
import { Image } from 'react-native';
import useRosterData from '../hooks/useRosterData';
import useFetchImage from '../hooks/useFetchImage';
import grpImage from '../assets/ic_grp_bg.png';
import { getImageSource } from '../common/utils';

function InfoImageView({ userId, ...props }) {
   let { image } = useRosterData(userId);

   const { imageUrl, authToken } = useFetchImage(image);

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
