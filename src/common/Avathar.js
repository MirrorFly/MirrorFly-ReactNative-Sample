import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import grpImage from '../assets/ic_grp_bg.png';
import img from '../assets/img.png';
import { getImageSource, getUsernameGraphemes } from '../helpers/chatHelpers';
import { CHAT_TYPE_GROUP } from '../helpers/constants';
import { useIsBlockedMeStatus, useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { useFetchImage, useNetworkStatus } from './hooks';
import Text from './Text';

const defaultImageDimension = 48;

const Avathar = ({
   userId,
   profileImage,
   imageStyle,
   transparentBackgroundForImage = true,
   imageProps = {},
   ...props
}) => {
   const { type = '' } = props;
   const themeColorPalatte = useThemeColorPalatte();
   const [isImageLoadError, setIsImageLoadError] = React.useState(false);
   const [isImageLoading, setIsImageLoading] = React.useState(false);
   const isNetworkConnected = useNetworkStatus();
   const { imageUrl, authToken, isLoading } = useFetchImage(profileImage);
   const isBlockedMeStatus = useIsBlockedMeStatus(userId);

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

   if (isBlockedMeStatus) {
      return <Image {...imageProps} style={imageStyle || styles.imageDiv(props)} source={getImageSource(img)} />;
   }

   if (type === CHAT_TYPE_GROUP && !profileImage) {
      return <Image {...imageProps} style={imageStyle || styles.imageDiv(props)} source={getImageSource(grpImage)} />;
   }

   if (isLoading && profileImage) {
      return (
         <View style={imageStyle || styles.imageDiv(props, false)}>
            <ActivityIndicator color={themeColorPalatte.primaryColor} />
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
               <ActivityIndicator color={themeColorPalatte.primaryColor} />
            </View>
         )}
      </View>
   ) : (
      <View style={styles.imageDiv(props)}>
         <Text style={styles.imgName(props)}>{getUsernameGraphemes(props.data)}</Text>
      </View>
   );
};

export default React.memo(Avathar);

const styles = StyleSheet.create({
   imageDiv: (props, hasImage, transparentBackgroundForImage) => {
      let backgroundColor;

      if (hasImage) {
         if (transparentBackgroundForImage) {
            backgroundColor = 'transparent';
         } else {
            backgroundColor = '#9D9D9D'; // to have some background for png images
         }
      } else {
         backgroundColor = props.backgroundColor;
      }

      backgroundColor = backgroundColor || '#9D9D9D';
      return {
         width: props.width || defaultImageDimension,
         height: props.height || defaultImageDimension,
         borderRadius: 100,
         backgroundColor,
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
