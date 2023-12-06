import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import React from 'react';
import useFetchImage from '../hooks/useFetchImage';
import { useNetworkStatus } from '../hooks';
import { getUsernameGraphemes } from '../Helper/index';

const Avathar = ({ profileImage, imageStyle, imageProps = {}, ...props }) => {
  const [isImageLoadError, setIsImageLoadError] = React.useState(false);
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

  if (isLoading && profileImage) {
    return <ActivityIndicator />;
  }

  return Boolean(profileImage) && !isImageLoadError && Boolean(imageUrl) ? (
    <Image
      {...imageProps}
      style={imageStyle || styles.imageDiv(props)}
      source={{
        uri: imageUrl,
        method: 'GET',
        cache: 'force-cache',
        headers: {
          Authorization: authToken,
        },
      }}
      onError={handleImageError}
    />
  ) : (
    <View style={styles.imageDiv(props)}>
      <Text style={styles.imgName(props)}>
        {getUsernameGraphemes(props.data)}
      </Text>
    </View>
  );
};

export default Avathar;

const styles = StyleSheet.create({
  imageDiv: props => {
    return {
      width: props.width || 48,
      height: props.height || 48,
      borderRadius: 100,
      backgroundColor: props.backgroundColor || '#9D9D9D',
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
});
