import React, { useEffect, useState } from 'react';
import { Image as RNImage } from 'react-native';
import PropTypes from 'prop-types';

function Image({ thumbImage, uri, ...props }) {
   console.log('uri ==> ', uri);
   const [imageUri, setImageUri] = useState(uri || thumbImage);

   useEffect(() => {
      if (uri) {
         setImageUri(uri);
      }
   }, [uri]);

   const handleLoadEnd = () => {
      if (uri) {
         setImageUri(uri); // Switch to main image once loaded
      }
   };

   const handleError = () => {
      setImageUri(thumbImage); // Fall back to thumb on error
   };
   console.log('imageUri ==> ', uri, imageUri);
   return (
      <RNImage
         source={{ uri: imageUri }}
         {...props}
         onLoadStart={handleError}
         onLoadEnd={handleLoadEnd}
         onError={handleError}
      />
   );
}

Image.propTypes = {
   thumbImage: PropTypes.string,
   uri: PropTypes.string,
   props: PropTypes.object,
};

export default Image;
