import SDK from 'SDK/SDK';
import { useEffect, useState } from 'react';

const initialState = {
  isLoading: false,
  imageUrl: '',
  authToken: '',
};

/**
 * @typedef {Object} ImageData
 * @property {boolean} isLoading
 * @property {string} imageUrl
 * @property {string} authToken
 */

/**
 * A Custom hook to get the complete image URL from SDK and fetch and return the image base64 data
 * @param {string} imageToken
 * @returns {ImageData}
 */
const useFetchImage = imageToken => {
  const [state, setState] = useState({
    ...initialState,
    isLoading: Boolean(imageToken),
  });

  useEffect(() => {
    getMediaURL();
  }, [imageToken]);

  const getMediaURL = async () => {
    if (!imageToken) {
      if (
        state.authToken !== initialState.authToken &&
        state.imageUrl !== initialState.imageUrl
      ) {
        setState({ ...initialState });
      }
      return;
    }
    const { data: imageData = {}, statusCode } = await SDK.getMediaURL(
      imageToken,
    );
    if (statusCode === 200) {
      const { fileUrl, token } = imageData;
      setState({
        isLoading: false,
        imageUrl: fileUrl,
        authToken: token,
      });
    } else {
      setState({ ...initialState });
    }
  };

  return state;
};

export default useFetchImage;
