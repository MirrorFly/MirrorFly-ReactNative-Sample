import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import React from 'react';
import useFetchImage from '../hooks/useFetchImage';
import { useNetworkStatus } from '../hooks';
import { getUsernameGraphemes } from '../Helper/index';
import ApplicationColors from '../config/appColors';
import commonStyles from './commonStyles';

const defaultImageDimension = 48;

const Avathar = ({ profileImage, imageStyle, transparentBackgroundForImage = true, imageProps = {}, ...props }) => {
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

   if (isLoading && profileImage) {
      return (
         <View style={imageStyle || styles.imageDiv(props, false)}>
            <ActivityIndicator color={ApplicationColors.mainColor} />
         </View>
      );
   }

   return profileImage && !isImageLoadError && imageUrl ? (
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
