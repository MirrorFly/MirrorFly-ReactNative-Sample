import React from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import SDK, { RealmKeyValueStore } from '../SDK/SDK';
import Avathar from '../common/Avathar';
import ApplicationColors from '../config/appColors';
import { getExtention } from '../helpers/chatHelpers';

const AuthProfileImage = props => {
   const [imageSource, setImageSource] = React.useState(null);
   const [isFetching, setIsFetching] = React.useState(false);
   const profileImageKey = props.image.split('.')[0];

   React.useEffect(() => {
      handleAuthImage();
   }, [props.image]);

   const handleAuthImage = async () => {
      if (props.image) {
         const _profileImage = await RealmKeyValueStore.getItem('profileImage');
         if (_profileImage) {
            let profileImage = JSON.parse(_profileImage);
            if (profileImage && profileImage[profileImageKey]) {
               setImageSource(profileImage[profileImageKey]);
            }
         } else {
            RealmKeyValueStore.removeItem('profileImage');
            getImageURL();
         }
      }
   };

   const storeProfileImage = imageBase64 => {
      RealmKeyValueStore.setItem('profileImage', JSON.stringify({ [profileImageKey]: imageBase64 }));
   };

   const getImageURL = async () => {
      const imageUrl = await SDK.getMediaURL(props.image);
      console.log(imageUrl);
      return fetchImage(imageUrl.data.fileUrl, imageUrl.data.token);
   };

   const fetchImage = async (fileUrl, authToken) => {
      setIsFetching(true);
      let ext = getExtention(fileUrl);
      ext = ext[0];
      let options = {
         fileCache: true,
         appendExt: ext,
      };
      const response = await RNFetchBlob.config(options).fetch('GET', fileUrl, {
         Authorization: authToken,
      });
      const base64 = await response.readFile('base64');
      response.flush();
      const imageBase64 = `data:image/png;base64,${base64}`;
      if (props?.component == 'profileImage') storeProfileImage(imageBase64);
      setImageSource(imageBase64);
      setIsFetching(false);
   };

   return (
      <View>
         {isFetching || Boolean(props?.imageUploading) ? (
            <ActivityIndicator size={'small'} color={ApplicationColors.mainColor} />
         ) : (
            <>
               {Boolean(imageSource) ? (
                  <Image
                     style={{
                        borderRadius: 100,
                        resizeMode: 'contain',
                        borderColor: '#d3d3d3',
                        borderWidth: 0.25,
                     }}
                     width={157}
                     height={157}
                     source={{ uri: imageSource }}
                     resizeMode="contain"
                     alt="profile_image"
                  />
               ) : (
                  <Avathar fontSize={60} width={157} height={157} data={props?.nickName} backgroundColor={'blue'} />
               )}
            </>
         )}
      </View>
   );
};

export default AuthProfileImage;
