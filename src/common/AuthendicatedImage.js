import React from 'react';
import { Box, Image, Spinner } from 'native-base';
import RNFetchBlob from 'rn-fetch-blob';
import { getExtention } from './utils';

const AuthenticatedImage = props => {
  const [imageSource, setImageSource] = React.useState(null);
  const [isFetching, setIsFetching] = React.useState(false);
  React.useEffect(() => {
    setIsFetching(true);
    const fetchImage = async () => {
      let image_URL = props.imageUrl;
      let ext = getExtention(image_URL);
      ext = ext[0];
      let options = {
        fileCache: true,
        appendExt: ext,
      };
      const response = await RNFetchBlob.config(options)
        .fetch('GET', image_URL, {
          Authorization: props.authToken,
        })
        .progress((received, total) => {});
      const base64 = await response.readFile('base64');
      response.flush();
      const imageBase64 = `data:image/png;base64,${base64}`;
      setImageSource(imageBase64);
      setIsFetching(false);
    };
    fetchImage();
  }, [props.imageUrl, props.authToken]);

  return (
    <Box>
      {isFetching ? (
        <Spinner />
      ) : (
        <>
          {imageSource && (
            <Image
              {...props}
              source={{ uri: imageSource }}
              resizeMode="contain"
              alt="profile_image"
            />
          )}
        </>
      )}
    </Box>
  );
};

export default AuthenticatedImage;
