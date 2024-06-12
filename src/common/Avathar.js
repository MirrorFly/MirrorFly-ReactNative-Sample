import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import grpImage from '../assets/ic_grp_bg.png';
import ApplicationColors from '../config/appColors';
import { getImageSource, getUsernameGraphemes } from '../helpers/chatHelpers';
import { CHAT_TYPE_GROUP } from '../helpers/constants';
import commonStyles from '../styles/commonStyles';
import { useFetchImage, useNetworkStatus } from './hooks';

const defaultImageDimension = 48;

const Avathar = ({ profileImage, imageStyle, transparentBackgroundForImage = true, imageProps = {}, ...props }) => {
   const { type = '' } = props;
   const [isImageLoadError, setIsImageLoadError] = React.useState(false);
   const [isImageLoading, setIsImageLoading] = React.useState(false);
   const isNetworkConnected = useNetworkStatus();
   const { imageUrl, authToken, isLoading } = useFetchImage(profileImage);

   React.useEffect(() => {
      if (isNetworkConnected && isImageLoadError) {
         setIsImageLoadError(false);
      }
   }, [isNetworkConnected]);

   const handleImageError = () => {
      setIsImageLoadError(true);
   };

   const handleImageLoadingStart = () => {
      setIsImageLoading(true);
   };

   const handleImageLoadingEnd = () => {
      setIsImageLoading(false);
   };

   if (type === CHAT_TYPE_GROUP && !profileImage) {
      return <Image {...imageProps} style={imageStyle || styles.imageDiv(props)} source={getImageSource(grpImage)} />;
   }

   if (isLoading && profileImage) {
      return (
         <View style={imageStyle || styles.imageDiv(props, false)}>
            <ActivityIndicator color={ApplicationColors.mainColor} />
         </View>
      );
   }

   return Boolean(profileImage) && !isImageLoadError && Boolean(imageUrl) ? (
      <View style={commonStyles.positionRelative}>
         <Image
            {...imageProps}
            style={imageStyle || styles.imageDiv(props, true, transparentBackgroundForImage)}
            source={{
               uri: imageUrl,
               method: 'GET',
               cache: 'force-cache',
               headers: {
                  Authorization: authToken,
               },
            }}
            onLoadStart={handleImageLoadingStart}
            onLoadEnd={handleImageLoadingEnd}
            onError={handleImageError}
         />
         {isImageLoading && (
            <View style={[styles.imageDiv(props, true, transparentBackgroundForImage), styles.imageLoaderWrapper]}>
               <ActivityIndicator color={ApplicationColors.mainColor} />
            </View>
         )}
      </View>
   ) : (
      <View style={styles.imageDiv(props)}>
         <Text style={styles.imgName(props)}>{getUsernameGraphemes(props.data)}</Text>
      </View>
   );
};

export default Avathar;

const styles = StyleSheet.create({
   imageDiv: (props, hasImage, transparentBackgroundForImage) => {
      return {
         width: props.width || defaultImageDimension,
         height: props.height || defaultImageDimension,
         borderRadius: 100,
         backgroundColor:
            (hasImage
               ? transparentBackgroundForImage
                  ? 'transparent'
                  : '#9D9D9D' // to have some background for png images
               : props.backgroundColor) || '#9D9D9D',
         justifyContent: 'center',
         alignItems: 'center',
      };
   },
   imgName: props => ({
      color: 'white',
      fontWeight: '600',
      fontSize: props.fontSize || 18,
      textTransform: 'uppercase',
   }),
   imageLoaderWrapper: {
      position: 'absolute',
      backgroundColor: 'rgba(0,0,0,.2)',
   },
});
